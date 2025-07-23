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
  firebase_uid: string
  name: string
  email: string
  phone?: string
  address?: string
  latitude?: number
  longitude?: number
  google_place_id?: string
  google_rating?: number
  description?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface BusinessUpdateData {
  name?: string
  phone?: string
  address?: string
  latitude?: number
  longitude?: number
  description?: string
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

export interface CreateListingData {
  title: string
  description: string
  category: string
  price: number
  is_free: boolean
  image_url?: string
  available_from: string
  available_until: string
  quantity?: number
}

export interface UpdateListingData {
  title?: string
  description?: string
  category?: string
  price?: number
  is_free?: boolean
  image_url?: string
  available_from?: string
  available_until?: string
  quantity?: number
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
        (listing.businesses?.name && listing.businesses.name.toLowerCase().includes(searchTerm))
      )
    }
    
    return listings
  },

  getById: async (id: string): Promise<Listing> => {
    const response = await api.get(`api/listings/${id}`)
    return response.data
  },

  getByBusiness: async (businessId: string): Promise<Listing[]> => {
    const response = await api.get(`api/listings/business/${businessId}`)
    return response.data
  },

  create: async (data: CreateListingData): Promise<Listing> => {
    const response = await api.post('api/listings', data)
    return response.data
  },

  update: async (id: string, data: UpdateListingData): Promise<Listing> => {
    const response = await api.put(`api/listings/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`api/listings/${id}`)
  },
}

// Set authorization token for authenticated requests
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Remove authorization token
export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization']
}

export const authApi = {
  verifyToken: async (token: string): Promise<{ valid: boolean; user?: Business; error?: string }> => {
    const response = await api.post('/api/auth/verify-token', { token })
    return response.data
  },

  getProfile: async (): Promise<Business> => {
    const response = await api.get('api/auth/profile')
    return response.data
  },
}

export const businessApi = {
  updateProfile: async (data: BusinessUpdateData): Promise<Business> => {
    const response = await api.put('/api/business/profile', data)
    return response.data
  },

  getAll: async (): Promise<Business[]> => {
    const response = await api.get('/api/business')
    return response.data
  },

  getById: async (id: string): Promise<Business> => {
    const response = await api.get(`/api/business/${id}`)
    return response.data
  },
}

export const uploadApi = {
  uploadImage: async (file: File, folder?: string): Promise<{ imageUrl: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    if (folder) formData.append('folder', folder)

    const response = await api.post('api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteImage: async (imageUrl: string): Promise<void> => {
    await api.delete('api/upload/image', { data: { imageUrl } })
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