import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import OnlineStatusIndicator from './components/ui/OnlineStatusIndicator'
import DataPreloadIndicator from './components/ui/DataPreloadIndicator'

import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import BusinessDashboard from './pages/BusinessDashboard'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

import { useAuthStore } from './store/auth'
import { offlineDB } from './lib/offline-db'
import { dataPreloader } from './lib/data-preloader'

function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    // Initialize authentication
    initAuth()
    
    // Initialize offline database and preload data
    const initializeApp = async () => {
      try {
        await offlineDB.init()
        // Preload essential data for offline use
        await dataPreloader.preloadEssentialData()
      } catch (error) {
        console.error('App initialization failed:', error)
      }
    }
    
    initializeApp()
  }, [initAuth])

  // Update preloader when business context changes
  const { business, isAuthenticated } = useAuthStore()
  useEffect(() => {
    if (business && isAuthenticated) {
      // Business user logged in - preload their specific data
      dataPreloader.updateBusinessContext({
        isLoggedIn: true,
        businessId: business.id
      })
    } else {
      // Not logged in as business
      dataPreloader.updateBusinessContext({
        isLoggedIn: false
      })
    }
  }, [business, isAuthenticated])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <OnlineStatusIndicator />
      <DataPreloadIndicator />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/business-dashboard" 
            element={
              <ProtectedRoute>
                <BusinessDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App 