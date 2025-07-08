import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useEffect } from 'react'
import { useAuthStore } from './store/auth'
import { initializeFirebase } from './lib/firebase'
import { registerSW } from 'virtual:pwa-register'

// Layout Components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Pages
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import BusinessDashboard from './pages/BusinessDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    // Initialize Firebase
    initializeFirebase()
    
    // // Initialize authentication
    initAuth()

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      registerSW({
        onNeedRefresh() {
          // Show update notification
          console.log('New content available, please refresh.')
        },
        onOfflineReady() {
          console.log('App ready to work offline')
        },
      })
    }
  }, [])
  // }, [initAuth])

  return (
    <>
      <Helmet>
        <title>ResQ Food - Reduce Food Waste</title>
        <meta name="description" content="Connect with businesses to get surplus food at discounted prices while helping reduce food waste." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/business-dashboard" element={
              <ProtectedRoute>
                <BusinessDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </>
  )
}

export default App 