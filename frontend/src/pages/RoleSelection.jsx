import { Link } from 'react-router-dom';

const RoleSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Join LoadMate</h1>
          <p className="text-xl text-gray-600">Choose how you'd like to use our platform</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Card */}
          <Link
            to="/register-customer"
            className="group block"
          >
            <div className="card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 group-hover:border-blue-400">
              <div className="text-center p-8">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl text-white">📦</span>
                </div>

                {/* Content */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">I Need Transport</h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Book reliable transport services for your goods. Perfect for individuals and businesses who need to ship items.
                </p>

                {/* Features */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Book transport instantly</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Track your shipments</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Transparent pricing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Multiple vehicle options</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <div className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg group-hover:bg-blue-700 transition-colors">
                    Sign Up as Customer
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Owner Card */}
          <Link
            to="/register-owner"
            className="group block"
          >
            <div className="card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 group-hover:border-green-400">
              <div className="text-center p-8">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl text-white">🚚</span>
                </div>

                {/* Content */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">I Have Vehicles</h2>
                <p className="text-gray-600 mb-6 text-lg">
                  List your vehicles and start earning by providing transport services. Perfect for transport businesses and vehicle owners.
                </p>

                {/* Features */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">List your vehicles</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Receive booking requests</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Manage your fleet</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">Earn money daily</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <div className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg group-hover:bg-green-700 transition-colors">
                    Sign Up as Owner
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
