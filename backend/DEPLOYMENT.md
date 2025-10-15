# LoadMate Backend Deployment Guide

## Railway Deployment (Recommended)

### 1. Prepare for Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway Project**:
   ```bash
   cd backend
   railway init
   ```

### 2. Environment Variables

Set these environment variables in Railway dashboard:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### 3. Deploy

```bash
railway up
```

## Alternative: Render Deployment

### 1. Create render.yaml

```yaml
services:
  - type: web
    name: loadmate-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: loadmate-db
          property: connectionString
```

### 2. Deploy to Render

1. Connect your GitHub repository
2. Select the backend folder
3. Set environment variables
4. Deploy

## Health Check Endpoint

Add this to your server.js for health checks:

```javascript
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
```
