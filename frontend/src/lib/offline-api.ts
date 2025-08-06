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
  private isOfflineOrUnreliable(): boolean {
    // Be more aggressive about treating uncertain network states as offline
    // This prevents hanging spinners on slow/unreliable connections
    return !navigator.onLine
  }
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
      console.log('OfflineAPI: Creating listing, navigator.onLine =', navigator.onLine)
      
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
        is_approved: true, // Listings are immediately approved
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        businesses: {} as Business // Will be populated when synced
      }

      // For mutations, be aggressive about offline-first to prevent hanging
      // Only try online if we're very confident about connectivity
      if (this.isOfflineOrUnreliable()) {
        console.log('OfflineAPI: Going offline-first for create')
        await offlineDB.saveListing(tempListing)
        await syncService.queueLocalChange('create', 'listings', { ...data, _tempId: tempId })
        return tempListing
      }

      // Try online with very short timeout to prevent hanging
      console.log('OfflineAPI: Attempting online create')
      try {
        // Create a promise that rejects quickly to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 2000)
        })
        
        const createPromise = originalListingsApi.create(data)
        const listing = await Promise.race([createPromise, timeoutPromise])
        
        await offlineDB.saveListing(listing)
        console.log('OfflineAPI: Created listing on backend:', listing.id)
        return listing
      } catch (error) {
        console.warn('OfflineAPI: Backend request failed, falling back to offline:', error)
        // Fall back to offline creation
        await offlineDB.saveListing(tempListing)
        await syncService.queueLocalChange('create', 'listings', { ...data, _tempId: tempId })
        return tempListing
      }
    },

    update: async (id: string, data: UpdateListingData): Promise<Listing> => {
      console.log('OfflineAPI: Updating listing, navigator.onLine =', navigator.onLine)
      
      // For mutations, be aggressive about offline-first
      if (this.isOfflineOrUnreliable()) {
        console.log('OfflineAPI: Going offline-first for update')
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
      }

      // Try online with timeout
      console.log('OfflineAPI: Attempting online update')
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 2000)
        })
        
        const updatePromise = originalListingsApi.update(id, data)
        const listing = await Promise.race([updatePromise, timeoutPromise])
        
        await offlineDB.saveListing(listing)
        console.log('OfflineAPI: Updated listing on backend:', id)
        return listing
      } catch (error) {
        console.warn('OfflineAPI: Backend request failed, falling back to offline:', error)
        // Fall back to offline update
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
      }
    },

    delete: async (id: string): Promise<void> => {
      console.log('OfflineAPI: Deleting listing, navigator.onLine =', navigator.onLine)
      
      // For mutations, be aggressive about offline-first
      if (this.isOfflineOrUnreliable()) {
        console.log('OfflineAPI: Going offline-first for delete')
        await offlineDB.deleteListing(id)
        await syncService.queueLocalChange('delete', 'listings', { id })
        return
      }

      // Try online with timeout
      console.log('OfflineAPI: Attempting online delete')
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 2000)
        })
        
        const deletePromise = originalListingsApi.delete(id)
        await Promise.race([deletePromise, timeoutPromise])
        
        await offlineDB.deleteListing(id)
        console.log('OfflineAPI: Deleted listing on backend:', id)
      } catch (error) {
        console.warn('OfflineAPI: Backend request failed, falling back to offline:', error)
        // Fall back to offline deletion
        await offlineDB.deleteListing(id)
        await syncService.queueLocalChange('delete', 'listings', { id })
      }
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
      imagesCount: number
      unuploadedImagesCount: number
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

  async cleanupTempData(): Promise<number> {
    return await syncService.cleanupTempListings()
  }
}

export const offlineApi = new OfflineFirstAPI()

// Export the offline-first versions of the APIs
export const listingsApi = offlineApi.listings
export const businessApi = offlineApi.business

// Export utility functions
export const offlineUtils = {
  getOfflineStatus: () => offlineApi.getOfflineStatus(),
  clearOfflineData: () => offlineApi.clearOfflineData(),
  forceSync: () => offlineApi.forceSync(),
  cleanupTempData: () => offlineApi.cleanupTempData()
}

// Re-export other APIs that don't need offline functionality
export { authApi, setAuthToken, removeAuthToken, FOOD_CATEGORIES } from './api'
export type * from './api' 

// Offline-first image upload API
export const uploadApi = {
  uploadImage: async (file: File, folder?: string, linkedToListing?: string): Promise<{ imageUrl: string }> => {
    // If online, try to upload immediately with extended timeout
    if (navigator.onLine) {
      try {
        const originalUploadApi = await import('./api')
        const result = await originalUploadApi.uploadApi.uploadImage(file, folder, 10000) // 45 second timeout for user-initiated uploads
        return result
      } catch (error) {
        console.warn('Online image upload failed, storing offline:', error)
        // Fall through to offline storage
      }
    }
    
    // Store image offline
    console.log('Storing image offline for later upload')
    const localUrl = await offlineDB.saveImage(file, linkedToListing)
    return { imageUrl: localUrl }
  },

  deleteImage: async (imageUrl: string): Promise<void> => {
    // Check if this is a local URL (blob URL)
    if (imageUrl.startsWith('blob:')) {
      const image = await offlineDB.findImageByLocalUrl(imageUrl)
      if (image) {
        await offlineDB.deleteImage(image.id)
        return
      }
    }
    
    // If online and it's a remote URL, try to delete from server
    if (navigator.onLine && !imageUrl.startsWith('blob:')) {
      try {
        const originalUploadApi = await import('./api')
        await originalUploadApi.uploadApi.deleteImage(imageUrl)
      } catch (error) {
        console.warn('Failed to delete remote image:', error)
      }
    }
  },

  // Get all pending image uploads
  getPendingUploads: async (): Promise<any[]> => {
    return await offlineDB.getUnuploadedImages()
  }
} 