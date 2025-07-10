# ResQ Food - Social-Ecological Food Rescue Platform

ResQ Food is a digital platform that connects businesses with surplus unsold food to consumers looking for discounted or free food packages, helping reduce food waste while providing affordable food options.

## Project Overview

- **Frontend**: React 18 + Vite + Google Maps API
- **Backend**: NestJS (Node.js 18) with REST API
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Auth**: Firebase (business users only)
- **Media Storage**: Supabase Storage
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Features

### Business Dashboard
- Registration/authentication for businesses
- Create, edit, and publish food listings
- Manage "surprise packages" with pricing and descriptions
- Display Google ratings integration

### Public Interface
- Browse available listings without login
- Interactive map visualization
- Filter by category, price, distance, and rating
- Mobile-first Progressive Web App

### Admin Panel
- Moderate and approve listings
- Analytics dashboard
- Business management

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Firebase account
- Google Maps API key

### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=your_supabase_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FIREBASE_PROJECT_ID=your_firebase_project_id
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

The application is configured for deployment on:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase
- **CI/CD**: GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 