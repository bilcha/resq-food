import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface Business {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  google_rating: number
  google_place_id: string
}

export interface Listing {
  id: string
  business_id: string
  title: string
  description: string
  category: string
  price: number
  is_free: boolean
  image_url: string | null
  available_from: string
  available_until: string
  quantity: number
  is_active: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
  businesses: Business
}

export interface ListingFilters {
  category?: string
  is_free?: boolean
  min_price?: number
  max_price?: number
  search?: string
}

// API Functions
export const listingsApi = {
  getAll: async (filters?: ListingFilters): Promise<Listing[]> => {
    const params = new URLSearchParams()
    
    if (filters?.category) params.append('category', filters.category)
    if (filters?.is_free !== undefined) params.append('is_free', String(filters.is_free))
    if (filters?.min_price !== undefined) params.append('min_price', String(filters.min_price))
    if (filters?.max_price !== undefined) params.append('max_price', String(filters.max_price))
    
    const response = await api.get(`api/listings?${params.toString()}`)
    let listings = response.data as Listing[]
    
    // Apply search filter on frontend since backend doesn't support it
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      listings = listings.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm) ||
        listing.businesses.name.toLowerCase().includes(searchTerm)
      )
    }
    
    return listings
  },

  getById: async (id: string): Promise<Listing> => {
    const response = await api.get(`api/listings/${id}`)
    return response.data
  },
}

export const FOOD_CATEGORIES = [
  'Bakery',
  'Fruits & Vegetables',
  'Dairy',
  'Meat & Fish',
  'Prepared Foods',
  'Desserts',
  'Beverages',
  'Other'
] as const

export type FoodCategory = typeof FOOD_CATEGORIES[number] 