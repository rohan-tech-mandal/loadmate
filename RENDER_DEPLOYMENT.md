# LoadMate Backend - Render.com Deployment Guide

## 🚀 Step-by-Step Deployment

### 1. **Create Render Account**
- Go to [render.com](https://render.com)
- Sign up with your GitHub account
- Verify your email

### 2. **Connect Your Repository**
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select your `loadmate` repository
- Choose the `main` branch

### 3. **Configure the Service**
- **Name**: `loadmate-backend`
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Plan**: Free (or Hobby for $7/month)

### 4. **Set Environment Variables**
Click "Advanced" → "Environment Variables" and add:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_strong_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
GOOGLE_CALLBACK_URL=https://your-backend-domain.onrender.com/auth/google/callback
```

### 5. **Deploy**
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Your backend will be available at: `https://loadmate-backend.onrender.com`

## 🔧 Important Notes

### **MongoDB Atlas Setup**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster (free tier available)
3. Get your connection string
4. Add your Render IP to MongoDB Atlas whitelist (or use 0.0.0.0/0 for all IPs)

### **Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Update your OAuth redirect URIs:
   - `https://your-backend-domain.onrender.com/auth/google/callback`
   - `https://your-frontend-domain.vercel.app/auth-success`

### **Environment Variables Explained**
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong secret for JWT tokens (generate with: `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID/SECRET`: From Google Cloud Console
- `SESSION_SECRET`: For Express sessions (can be same as JWT_SECRET)
- `FRONTEND_URL`: Your deployed frontend URL
- `GOOGLE_CALLBACK_URL`: Your backend URL + `/auth/google/callback`

## 🎯 After Deployment

1. **Test Health Check**: Visit `https://your-backend.onrender.com/api/health`
2. **Update Frontend**: Change `VITE_API_URL` to your Render backend URL
3. **Test Full Flow**: Try registering, logging in, and booking

## 🆘 Troubleshooting

### **Common Issues**
- **Build Fails**: Check that all dependencies are in `package.json`
- **Database Connection**: Verify MongoDB Atlas whitelist includes Render IPs
- **OAuth Issues**: Check redirect URIs in Google Console
- **CORS Errors**: Verify `FRONTEND_URL` environment variable

### **Logs**
- View logs in Render dashboard
- Check "Logs" tab for deployment issues
- Use `console.log` for debugging

## 📊 Render Free Tier Limits
- 750 hours/month (enough for development)
- Sleeps after 15 minutes of inactivity
- 512MB RAM
- Automatic deployments from GitHub

## 🚀 Next Steps
1. Deploy frontend to Vercel
2. Update frontend environment variables
3. Test the complete application
4. Set up custom domain (optional)
