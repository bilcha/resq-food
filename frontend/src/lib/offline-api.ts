import { offlineDB } from './offline-db'
import { syncService } from './sync-service'
import { 
  listingsApi as originalListingsApi, 
  businessApi as originalBusinessApi,
  Business, 
  Listing, 
  ListingFilters, 
  CreateListingData, 
  UpdateListingData,
  BusinessUpdateData
} from './api'

class OfflineFirstAPI {
  // Listings API
  listings = {
    getAll: async (filters?: ListingFilters): Promise<Listing[]> => {
      // Always try to get local data first for immediate response
      const localListings = await offlineDB.filterListings(filters || {})
      
      // If offline, return local data immediately
      if (!navigator.onLine) {
        console.log('Using local listings data (offline):', localListings.length, 'items')
        return localListings
      }
      
      // If online, try to update from backend with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const listings = await originalListingsApi.getAll(filters)
        clearTimeout(timeoutId)
        
        // Cache updated results locally
        for (const listing of listings) {
          await offlineDB.saveListing(listing)
        }
        console.log('Updated with fresh backend data:', listings.length, 'items')
        return listings
      } catch (error) {
        console.warn('Backend request failed, using local data:', error)
        return localListings
      }
    },

    getById: async (id: string): Promise<Listing> => {
      // Try local data first
      const localListing = await offlineDB.getListing(id)
      
      // If offline, return local data
      if (!navigator.onLine) {
        if (!localListing) {
          throw new Error('Listing not found (offline)')
        }
        console.log('Using local listing data for:', id)
        return localListing
      }
      
      // If online, try to get fresh data with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
        
        const listing = await originalListingsApi.getById(id)
        clearTimeout(timeoutId)
        
        await offlineDB.saveListing(listing)
        console.log('Updated listing from backend:', id)
        return listing
      } catch (error) {
        console.warn('Backend request failed for listing', id, error)
        if (!localListing) {
          throw new Error('Listing not found')
        }
        return localListing
      }
    },

    getByBusiness: async (businessId: string): Promise<Listing[]> => {
      // Get local data first
      const localListings = await offlineDB.getListingsByBusiness(businessId)
      
      // If offline, return local data
      if (!navigator.onLine) {
        console.log('Using local business listings for:', businessId, localListings.length, 'items')
        return localListings
      }
      
      // If online, try to update with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const listings = await originalListingsApi.getByBusiness(businessId)
        clearTimeout(timeoutId)
        
        for (const listing of listings) {
          await offlineDB.saveListing(listing)
        }
        console.log('Updated business listings from backend:', businessId, listings.length, 'items')
        return listings
      } catch (error) {
        console.warn('Backend request failed for business', businessId, error)
        return localListings
      }
    },

    create: async (data: CreateListingData & { business_id: string }): Promise<Listing> => {
      // Generate temporary ID for offline operation
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const tempListing: Listing = {
        id: tempId,
        business_id: data.business_id,
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        is_free: data.is_free,
        image_url: data.image_url || null,
        available_from: data.available_from,
        available_until: data.available_until,
        quantity: data.quantity || 1,
        is_active: true,
        is_approved: false, // Will be updated when synced
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        businesses: {} as Business // Will be populated when synced
      }

      if (navigator.onLine) {
        try {
          const listing = await originalListingsApi.create(data)
          await offlineDB.saveListing(listing)
          return listing
        } catch (error) {
          console.warn('Backend request failed, creating offline:', error)
        }
      }
      
      // Store locally and queue for sync
      await offlineDB.saveListing(tempListing)
      await syncService.queueLocalChange('create', 'listings', data)
      return tempListing
    },

    update: async (id: string, data: UpdateListingData): Promise<Listing> => {
      if (navigator.onLine) {
        try {
          const listing = await originalListingsApi.update(id, data)
          await offlineDB.saveListing(listing)
          return listing
        } catch (error) {
          console.warn('Backend request failed, updating offline:', error)
        }
      }
      
      // Update locally and queue for sync
      const existingListing = await offlineDB.getListing(id)
      if (!existingListing) {
        throw new Error('Listing not found for update')
      }
      
      const updatedListing = {
        ...existingListing,
        ...data,
        updated_at: new Date().toISOString()
      }
      
      await offlineDB.saveListing(updatedListing)
      await syncService.queueLocalChange('update', 'listings', { id, ...data })
      return updatedListing
    },

    delete: async (id: string): Promise<void> => {
      if (navigator.onLine) {
        try {
          await originalListingsApi.delete(id)
          await offlineDB.deleteListing(id)
          return
        } catch (error) {
          console.warn('Backend request failed, deleting offline:', error)
        }
      }
      
      // Delete locally and queue for sync
      await offlineDB.deleteListing(id)
      await syncService.queueLocalChange('delete', 'listings', { id })
    }
  }

  // Business API
  business = {
    getAll: async (): Promise<Business[]> => {
      // Get local data first
      const localBusinesses = await offlineDB.getBusinesses()
      
      // If offline, return local data
      if (!navigator.onLine) {
        console.log('Using local businesses data (offline):', localBusinesses.length, 'items')
        return localBusinesses
      }
      
      // If online, try to update with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const businesses = await originalBusinessApi.getAll()
        clearTimeout(timeoutId)
        
        for (const business of businesses) {
          await offlineDB.saveBusiness(business)
        }
        console.log('Updated businesses from backend:', businesses.length, 'items')
        return businesses
      } catch (error) {
        console.warn('Backend request failed, using local businesses:', error)
        return localBusinesses
      }
    },

    getById: async (id: string): Promise<Business> => {
      // Try local data first
      const localBusiness = await offlineDB.getBusiness(id)
      
      // If offline, return local data
      if (!navigator.onLine) {
        if (!localBusiness) {
          throw new Error('Business not found (offline)')
        }
        console.log('Using local business data for:', id)
        return localBusiness
      }
      
      // If online, try to get fresh data with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
        
        const business = await originalBusinessApi.getById(id)
        clearTimeout(timeoutId)
        
        await offlineDB.saveBusiness(business)
        console.log('Updated business from backend:', id)
        return business
      } catch (error) {
        console.warn('Backend request failed for business', id, error)
        if (!localBusiness) {
          throw new Error('Business not found')
        }
        return localBusiness
      }
    },

    updateProfile: async (data: BusinessUpdateData): Promise<Business> => {
      if (navigator.onLine) {
        try {
          const business = await originalBusinessApi.updateProfile(data)
          await offlineDB.saveBusiness(business)
          return business
        } catch (error) {
          console.warn('Backend request failed, updating offline:', error)
        }
      }
      
      // Update locally and queue for sync
      const businesses = await offlineDB.getBusinesses()
      if (businesses.length === 0) {
        throw new Error('No business profile found for update')
      }
      
      const existingBusiness = businesses[0] // Assuming single business profile
      const updatedBusiness = {
        ...existingBusiness,
        ...data,
        updated_at: new Date().toISOString()
      }
      
      await offlineDB.saveBusiness(updatedBusiness)
      await syncService.queueLocalChange('update', 'businesses', data)
      return updatedBusiness
    }
  }

  // Utility methods
  async getOfflineStatus(): Promise<{
    hasLocalData: boolean
    storageInfo: {
      businessesCount: number
      listingsCount: number
      pendingChangesCount: number
    }
  }> {
    const storageInfo = await offlineDB.getStorageInfo()
    
    return {
      hasLocalData: storageInfo.businessesCount > 0 || storageInfo.listingsCount > 0,
      storageInfo
    }
  }

  async clearOfflineData(): Promise<void> {
    await offlineDB.clear()
  }

  async forceSync(): Promise<void> {
    await syncService.sync()
  }
}

export const offlineApi = new OfflineFirstAPI()

// Export the offline-first versions of the APIs
export const listingsApi = offlineApi.listings
export const businessApi = offlineApi.business

// Re-export other APIs that don't need offline functionality
export { authApi, uploadApi, setAuthToken, removeAuthToken, FOOD_CATEGORIES } from './api'
export type * from './api' 