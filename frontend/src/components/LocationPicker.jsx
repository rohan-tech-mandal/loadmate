import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 20.5937, // Nashik, India
  lng: 78.9629,
};

const LocationPicker = ({ onLocationSelect, initialLocation, label = 'Select Location' }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(initialLocation || null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const addressComponents = results[0].address_components;
        const fullAddress = results[0].formatted_address;
        
        let city = '';
        let pincode = '';

        addressComponents.forEach((component) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        setAddress(fullAddress);
        onLocationSelect({
          address: fullAddress,
          city: city,
          pincode: pincode,
          coordinates: { latitude: lat, longitude: lng },
        });
      }
    });
  };

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setMarker({ lat, lng });
    reverseGeocode(lat, lng);
  }, [onLocationSelect]);

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setMarker({ lat, lng });
        map?.panTo({ lat, lng });
        map?.setZoom(15);

        const addressComponents = place.address_components;
        let city = '';
        let pincode = '';

        addressComponents?.forEach((component) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        setAddress(place.formatted_address);
        onLocationSelect({
          address: place.formatted_address,
          city: city,
          pincode: pincode,
          coordinates: { latitude: lat, longitude: lng },
        });
      }
    }
  };

  const handleMyLocation = () => {
    setLoadingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setMarker({ lat, lng });
          map?.panTo({ lat, lng });
          map?.setZoom(15);
          
          reverseGeocode(lat, lng);
          setLoadingLocation(false);
        },
        (error) => {
          setLoadingLocation(false);
          let errorMessage = 'Unable to retrieve your location';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLoadingLocation(false);
      alert('Geolocation is not supported by your browser');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      
      <div className="flex space-x-2">
        <Autocomplete 
          onLoad={onAutocompleteLoad} 
          onPlaceChanged={onPlaceChanged}
          className="flex-1"
        >
          <input
            type="text"
            placeholder="Search for a location..."
            className="input-field"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Autocomplete>

        <button
          type="button"
          onClick={handleMyLocation}
          disabled={loadingLocation}
          className="px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
          title="Use my current location"
        >
          {loadingLocation ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="hidden sm:inline">Getting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">My Location</span>
            </>
          )}
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={marker || defaultCenter}
        zoom={marker ? 15 : 10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {marker && (
          <Marker 
            position={marker}
            animation={window.google?.maps?.Animation?.DROP}
          />
        )}
      </GoogleMap>

      <div className="flex items-start space-x-2 text-xs text-gray-500">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div>
          <p>Click on the map, search for a location, or use "My Location" to select GPS coordinates</p>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;