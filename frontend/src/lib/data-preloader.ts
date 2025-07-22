import { offlineDB } from './offline-db'
import { listingsApi as originalListingsApi, businessApi as originalBusinessApi } from './api'

interface BusinessContext {
  isLoggedIn: boolean
  businessId?: string
}

class DataPreloader {
  private isPreloading = false
  private preloadComplete = false
  private businessContext: BusinessContext = { isLoggedIn: false }

  setBusinessContext(context: BusinessContext): void {
    this.businessContext = context
  }

  async preloadEssentialData(): Promise<void> {
    if (this.isPreloading || this.preloadComplete) {
      return
    }

    if (!navigator.onLine) {
      console.log('Offline on startup - skipping data preload')
      return
    }

    this.isPreloading = true
    console.log('Starting data preload...')

    try {
      // Prepare tasks based on user context
      const tasks = [
        this.preloadListings(),
        this.preloadBusinesses()
      ]

      // If business is logged in, add their specific listings
      if (this.businessContext.isLoggedIn && this.businessContext.businessId) {
        tasks.push(this.preloadBusinessListings(this.businessContext.businessId))
      }

      // Load data in parallel for better performance
      const results = await Promise.allSettled(tasks)

      // Log results
      if (results[0].status === 'fulfilled') {
        console.log(`Preloaded ${results[0].value} public listings`)
      } else {
        console.warn('Failed to preload public listings:', results[0].reason)
      }

      if (results[1].status === 'fulfilled') {
        console.log(`Preloaded ${results[1].value} businesses`)
      } else {
        console.warn('Failed to preload businesses:', results[1].reason)
      }

      // Log business-specific results if applicable
      if (results[2]) {
        if (results[2].status === 'fulfilled') {
          console.log(`Preloaded ${results[2].value} business-specific listings`)
        } else {
          console.warn('Failed to preload business listings:', results[2].reason)
        }
      }

      this.preloadComplete = true
      console.log('Data preload completed')
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('data-preload-complete'))
      
    } catch (error) {
      console.error('Data preload failed:', error)
    } finally {
      this.isPreloading = false
    }
  }

  private async preloadListings(): Promise<number> {
    try {
      const listings = await originalListingsApi.getAll()
      
      // Save all listings to IndexedDB
      for (const listing of listings) {
        await offlineDB.saveListing(listing)
      }
      
      return listings.length
    } catch (error) {
      console.error('Failed to preload listings:', error)
      throw error
    }
  }

  private async preloadBusinesses(): Promise<number> {
    try {
      const businesses = await originalBusinessApi.getAll()
      
      // Save all businesses to IndexedDB
      for (const business of businesses) {
        await offlineDB.saveBusiness(business)
      }
      
      return businesses.length
    } catch (error) {
      console.error('Failed to preload businesses:', error)
      throw error
    }
  }

  private async preloadBusinessListings(businessId: string): Promise<number> {
    try {
      // Get ALL business listings regardless of status (active, inactive, pending, etc.)
      const listings = await originalListingsApi.getByBusiness(businessId)
      
      // Save all business listings to IndexedDB
      for (const listing of listings) {
        await offlineDB.saveListing(listing)
      }
      
      console.log(`Preloaded ${listings.length} listings for business ${businessId} (all statuses)`)
      return listings.length
    } catch (error) {
      console.error(`Failed to preload listings for business ${businessId}:`, error)
      throw error
    }
  }

  async getPreloadStatus(): Promise<{
    isPreloading: boolean
    isComplete: boolean
    hasLocalData: boolean
  }> {
    const storageInfo = await offlineDB.getStorageInfo()
    
    return {
      isPreloading: this.isPreloading,
      isComplete: this.preloadComplete,
      hasLocalData: storageInfo.businessesCount > 0 || storageInfo.listingsCount > 0
    }
  }

  // Force reload data (useful for manual refresh)
  async forcePreload(): Promise<void> {
    this.preloadComplete = false
    await this.preloadEssentialData()
  }

  // Update business context and trigger preload if needed
  async updateBusinessContext(context: BusinessContext): Promise<void> {
    const wasLoggedIn = this.businessContext.isLoggedIn
    const oldBusinessId = this.businessContext.businessId
    
    this.setBusinessContext(context)
    
    // If business just logged in or changed, preload their specific data
    if (context.isLoggedIn && context.businessId && 
        (!wasLoggedIn || oldBusinessId !== context.businessId)) {
      
      if (navigator.onLine) {
        try {
          console.log(`Loading listings for newly logged in business: ${context.businessId}`)
          await this.preloadBusinessListings(context.businessId)
          window.dispatchEvent(new CustomEvent('business-data-preload-complete'))
        } catch (error) {
          console.error('Failed to preload business-specific data:', error)
        }
      }
    }
  }
}

export const dataPreloader = new DataPreloader() 