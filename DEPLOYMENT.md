# ResQ Food Deployment Guide

This guide will help you deploy the ResQ Food platform to production environments.

## Prerequisites

### Required Services
1. **Supabase Account** - For database and storage
2. **Firebase Account** - For authentication
3. **Google Cloud Console** - For Maps API
4. **Vercel Account** - For frontend hosting
5. **Railway Account** - For backend hosting
6. **GitHub Account** - For CI/CD

### Required API Keys
- Supabase URL and keys
- Firebase configuration
- Google Maps API key

## Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new Supabase project
2. Copy the database schema from `backend/src/database/schema.sql`
3. Execute the schema in your Supabase SQL editor
4. Enable PostGIS extension
5. Set up Row Level Security (RLS) policies
6. Create storage bucket for images

### 2. Authentication Setup (Firebase)

1. Create a new Firebase project
2. Enable Authentication with Email/Password
3. Configure authorized domains
4. Generate service account key
5. Download configuration for web app

### 3. Google Maps Setup

1. Go to Google Cloud Console
2. Enable Maps JavaScript API
3. Enable Places API (for business ratings)
4. Create API key with proper restrictions
5. Add your domain to authorized URLs

### 4. Environment Variables

#### Backend (.env)
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Server
PORT=3000
NODE_ENV=production
```

#### Frontend (.env)
```bash
# API
VITE_API_URL=https://your-backend-url.railway.app

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Options

### Option 1: Manual Deployment

#### Deploy Backend to Railway
1. Connect your GitHub repository to Railway
2. Create a new service for the backend
3. Set environment variables
4. Deploy from the `backend` directory
5. Configure custom domain (optional)

#### Deploy Frontend to Vercel
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Configure environment variables
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy and configure custom domain (optional)

### Option 2: Automated CI/CD

#### GitHub Actions Setup
1. Add repository secrets in GitHub Settings:
   - `RAILWAY_TOKEN` - Railway deployment token
   - `VERCEL_TOKEN` - Vercel deployment token
   - `ORG_ID` - Vercel organization ID
   - `PROJECT_ID` - Vercel project ID
   - All environment variables for both frontend and backend

2. The CI/CD pipeline will automatically:
   - Run tests on pull requests
   - Deploy to staging on feature branches
   - Deploy to production on main branch

### Option 3: Docker Deployment

#### Using Docker Compose (Development)
```bash
# Clone the repository
git clone <your-repo-url>
cd resq-food

# Create environment files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Edit environment files with your values
nano backend/.env
nano frontend/.env

# Start all services
docker-compose up -d
```

#### Using Docker (Production)
```bash
# Build and run backend
cd backend
docker build -t resq-food-backend .
docker run -p 3000:3000 --env-file .env resq-food-backend

# Build and run frontend
cd frontend
docker build -t resq-food-frontend .
docker run -p 5173:5173 --env-file .env resq-food-frontend
```

## Production Checklist

### Security
- [ ] Configure CORS for production domains
- [ ] Set up proper Firebase security rules
- [ ] Enable Supabase RLS policies
- [ ] Use HTTPS for all endpoints
- [ ] Secure API keys and secrets

### Performance
- [ ] Enable CDN for static assets
- [ ] Configure proper caching headers
- [ ] Optimize images and assets
- [ ] Enable compression
- [ ] Set up monitoring and logging

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure alerts for critical issues

### SEO & PWA
- [ ] Configure proper meta tags
- [ ] Set up robots.txt
- [ ] Generate sitemap
- [ ] Test PWA functionality
- [ ] Optimize Core Web Vitals

## Troubleshooting

### Common Issues

#### Database Connection Failed
- Check Supabase URL and keys
- Verify database is running
- Check firewall settings

#### Authentication Not Working
- Verify Firebase configuration
- Check authorized domains
- Validate API keys

#### Maps Not Loading
- Check Google Maps API key
- Verify API is enabled
- Check domain restrictions

#### Build Failures
- Check Node.js version (18+)
- Verify all dependencies are installed
- Check for TypeScript errors

### Getting Help
- Check the logs in Railway/Vercel dashboard
- Review error messages in browser console
- Verify all environment variables are set
- Test API endpoints manually

## Maintenance

### Regular Tasks
- Monitor application performance
- Update dependencies regularly
- Review and rotate API keys
- Backup database regularly
- Monitor error rates and fix issues

### Scaling
- Monitor database performance
- Consider upgrading hosting plans
- Implement caching strategies
- Optimize database queries
- Consider CDN for global distribution

## Support

For technical support or questions:
- Check the GitHub repository issues
- Review the documentation
- Contact the development team

---

**Note**: This deployment guide assumes you have basic knowledge of web deployment and the mentioned services. Make sure to test thoroughly in a staging environment before deploying to production. 