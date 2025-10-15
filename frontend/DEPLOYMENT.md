# LoadMate Frontend Deployment Guide

## Environment Variables Required

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Backend API URL (your deployed backend URL)
VITE_API_URL=https://your-backend-url.com/api

# Google Maps API Key (for location picker)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google OAuth Client ID (for Google sign-in)
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

## Vercel Deployment Steps

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project in Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all the variables from above

4. **Redeploy** after setting environment variables

## Build Configuration

The project is already configured with:
- ✅ Vite build system
- ✅ React Router for SPA routing
- ✅ Environment variable support
- ✅ Production build optimization
