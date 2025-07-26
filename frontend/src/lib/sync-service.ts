import { offlineDB } from './offline-db'
import { listingsApi, businessApi, Business, Listing } from './api'

class SyncService {
  private isSyncing = false
  private syncQueue: (() => Promise<void>)[] = []

  constructor() {
    // Listen for connection restoration events
    window.addEventListener('connection-restored', () => {
      this.sync()
    })

    // Periodic sync when online (every 5 minutes)
    setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.sync()
      }
    }, 5 * 60 * 1000)

    // Background image retry every 1 minute
    setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.retryFailedImageUploads()
      }
    }, 1 * 60 * 1000)
  }

  async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress')
      return
    }

    if (!navigator.onLine) {
      console.log('Cannot sync while offline')
      return
    }

    this.isSyncing = true
    console.log('Starting data synchronization...')

    try {
      // Step 1: Upload pending images
      await this.syncPendingImages()

      // Step 2: Sync pending changes to backend
      await this.syncPendingChanges()

      // Step 3: Fetch latest data from backend
      await this.syncFromBackend()

      // Step 4: Clean up any orphaned temporary listings
      await this.cleanupTempListings()

      console.log('Synchronization completed successfully')
      window.dispatchEvent(new CustomEvent('sync-complete'))
    } catch (error) {
      console.error('Synchronization failed:', error)
      window.dispatchEvent(new CustomEvent('sync-error', { detail: error }))
    } finally {
      this.isSyncing = false
    }
  }

  private async syncPendingChanges(): Promise<void> {
    const pendingChanges = await offlineDB.getPendingChanges()
    console.log(`Syncing ${pendingChanges.length} pending changes`)

    for (const change of pendingChanges) {
      try {
        await this.processPendingChange(change)
        await offlineDB.removePendingChange(change.id)
      } catch (error) {
        console.error(`Failed to sync change ${change.id}:`, error)
        // For now, we'll skip failed changes. In production, you might want to retry or handle conflicts
      }
    }
  }

  private async syncPendingImages(): Promise<void> {
    // Get images that haven't been uploaded and are eligible for retry
    const pendingImages = await offlineDB.getRetryableImages(3, 5 * 60 * 1000) // max 3 retries, 5 min delay
    console.log(`Syncing ${pendingImages.length} pending images`)

    for (const imageData of pendingImages) {
      try {
        console.log(`Attempting to upload image ${imageData.id} (attempt ${(imageData.uploadFailedCount || 0) + 1})`)
        
        // Upload the image using the original API with extended timeout
        const originalUploadApi = await import('./api')
        const result = await originalUploadApi.uploadApi.uploadImage(
          imageData.blob, 
          'listings', 
          60000 // 60 second timeout for sync operations
        )
        
        // Mark as uploaded and store remote URL
        await offlineDB.markImageAsUploaded(imageData.id, result.imageUrl)
        
        // Update any listings that reference this local image URL
        await this.updateListingsWithImageUrl(imageData.localUrl, result.imageUrl)
        
        // Clean up the local image after successful upload and update
        await this.cleanupUploadedImage(imageData.id)
        
        console.log(`Successfully uploaded and cleaned up image ${imageData.id}:`, result.imageUrl)
      } catch (error) {
        console.error(`Failed to upload image ${imageData.id}:`, error)
        
        // Mark the upload as failed but don't stop the sync process
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await offlineDB.markImageUploadFailed(imageData.id, errorMessage)
        
        console.log(`Image ${imageData.id} marked for retry later. Error: ${errorMessage}`)
        // Continue with other images instead of failing the entire sync
      }
    }
    
    // Log summary of image upload status
    const failedImages = await offlineDB.getFailedUploadImages()
    if (failedImages.length > 0) {
      console.log(`${failedImages.length} images still pending upload (will retry later)`)
    }
  }

  private async updateListingsWithImageUrl(localUrl: string, remoteUrl: string): Promise<void> {
    // Find listings that use this local image URL
    const allListings = await offlineDB.getListings()
    const listingsToUpdate = allListings.filter(listing => listing.image_url === localUrl)
    
    for (const listing of listingsToUpdate) {
      // Update the listing with the remote URL
      const updatedListing = { ...listing, image_url: remoteUrl }
      await offlineDB.saveListing(updatedListing)
      console.log(`Updated listing ${listing.id} image URL from local to remote`)
    }
    
    // CRITICAL: Also update any pending changes that reference this local URL
    await this.updatePendingChangesWithImageUrl(localUrl, remoteUrl)
    
    console.log(`Completed updating ${listingsToUpdate.length} listings with new image URL`)
  }

  private async updatePendingChangesWithImageUrl(localUrl: string, remoteUrl: string): Promise<void> {
    const pendingChanges = await offlineDB.getPendingChanges()
    const relevantChanges = pendingChanges.filter(change => 
      change.table === 'listings' && change.data.image_url === localUrl
    )
    
    console.log(`Found ${relevantChanges.length} pending changes that need image URL update`)
    
    for (const change of relevantChanges) {
      // Update the pending change data
      const updatedData = {
        ...change.data,
        image_url: remoteUrl
      }
      
      // Update the existing pending change
      await offlineDB.updatePendingChange(change.id, updatedData)
    }
  }

  private async processPendingChange(change: any): Promise<void> {
    const { type, table, data } = change

    if (table === 'listings') {
      switch (type) {
        case 'create':
          // Extract temp ID if present, then clean up the data
          const { _tempId, ...createData } = data
          
          // Use original API directly during sync to avoid local storage
          const createdListing = await (await import('./api')).listingsApi.create(createData)
          await offlineDB.saveListing(createdListing)
          
          // Clean up temporary listing if it exists
          if (_tempId) {
            console.log('Sync: Cleaning up temporary listing:', _tempId)
            await offlineDB.deleteListing(_tempId)
          }
          break
        case 'update':
          const updatedListing = await (await import('./api')).listingsApi.update(data.id, data)
          await offlineDB.saveListing(updatedListing)
          break
        case 'delete':
          await (await import('./api')).listingsApi.delete(data.id)
          await offlineDB.deleteListing(data.id)
          break
      }
    } else if (table === 'businesses') {
      switch (type) {
        case 'update':
          const updatedBusiness = await (await import('./api')).businessApi.updateProfile(data)
          await offlineDB.saveBusiness(updatedBusiness)
          break
        // Businesses are typically not created or deleted via the frontend
      }
    }
  }

  private async syncFromBackend(): Promise<void> {
    try {
      // Use original API directly during sync to get fresh data
      const { listingsApi: originalListingsApi, businessApi: originalBusinessApi } = await import('./api')
      
      // Fetch all listings
      const listings = await originalListingsApi.getAll()
      console.log(`Fetched ${listings.length} listings from backend`)
      
      // Save to local DB
      for (const listing of listings) {
        await offlineDB.saveListing(listing)
      }

      // Fetch all businesses
      const businesses = await originalBusinessApi.getAll()
      console.log(`Fetched ${businesses.length} businesses from backend`)
      
      // Save to local DB
      for (const business of businesses) {
        await offlineDB.saveBusiness(business)
      }

      // Update last sync timestamp
      await offlineDB.setAppState('lastSyncTimestamp', Date.now())
    } catch (error) {
      console.error('Error syncing from backend:', error)
      throw error
    }
  }

  async forceSyncToLocal(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Cannot sync while offline')
      return
    }

    try {
      await this.syncFromBackend()
      console.log('Force sync to local completed')
      window.dispatchEvent(new CustomEvent('sync-complete'))
    } catch (error) {
      console.error('Force sync to local failed:', error)
      window.dispatchEvent(new CustomEvent('sync-error', { detail: error }))
      throw error
    }
  }

  // Queue local changes for sync
  async queueLocalChange(type: 'create' | 'update' | 'delete', table: 'businesses' | 'listings', data: any): Promise<void> {
    await offlineDB.addPendingChange(type, table, data)
    
    // Try to sync immediately if online
    if (navigator.onLine && !this.isSyncing) {
      // Add to queue to avoid blocking
      this.syncQueue.push(() => this.sync())
      this.processQueue()
    }
  }

  private async processQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return

    const task = this.syncQueue.shift()
    if (task) {
      try {
        await task()
      } catch (error) {
        console.error('Queue task failed:', error)
      }
      
      // Process next task
      setTimeout(() => this.processQueue(), 1000)
    }
  }

  async getLastSyncTimestamp(): Promise<number | null> {
    return await offlineDB.getAppState('lastSyncTimestamp')
  }

  async getSyncStatus(): Promise<{
    isOnline: boolean
    isSyncing: boolean
    lastSync: number | null
    pendingChanges: number
    tempListings: number
    pendingImages: number
    failedImages: number
  }> {
    const pendingChanges = await offlineDB.getPendingChanges()
    const pendingImages = await offlineDB.getUnuploadedImages()
    const failedImages = await offlineDB.getFailedUploadImages()
    const lastSync = await this.getLastSyncTimestamp()
    
    // Count temporary listings
    const allListings = await offlineDB.getListings()
    const tempListings = allListings.filter(listing => listing.id.startsWith('temp_')).length

    return {
      isOnline: navigator.onLine,
      isSyncing: this.isSyncing,
      lastSync,
      pendingChanges: pendingChanges.length,
      tempListings,
      pendingImages: pendingImages.length,
      failedImages: failedImages.length
    }
  }

  // Clean up orphaned temporary listings (those without pending changes)
  async cleanupTempListings(): Promise<number> {
    console.log('Cleaning up orphaned temporary listings...')
    
    const allListings = await offlineDB.getListings()
    const tempListings = allListings.filter(listing => listing.id.startsWith('temp_'))
    
    if (tempListings.length === 0) {
      console.log('No temporary listings found')
      return 0
    }
    
    const pendingChanges = await offlineDB.getPendingChanges()
    const pendingTempIds = pendingChanges
      .filter(change => change.type === 'create' && change.table === 'listings' && change.data._tempId)
      .map(change => change.data._tempId)
    
    let cleanedCount = 0
    for (const tempListing of tempListings) {
      // Only delete temp listings that don't have pending changes
      if (!pendingTempIds.includes(tempListing.id)) {
        console.log('Removing orphaned temporary listing:', tempListing.id)
        await offlineDB.deleteListing(tempListing.id)
        cleanedCount++
      }
    }
    
    console.log(`Cleaned up ${cleanedCount} orphaned temporary listings`)
    return cleanedCount
  }

  // Retry failed image uploads in the background
  async retryFailedImageUploads(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync in progress, skipping image retry')
      return
    }

    try {
      const retryableImages = await offlineDB.getRetryableImages(3, 5 * 60 * 1000)
      
      if (retryableImages.length === 0) {
        return // No images to retry
      }

      console.log(`Background retry: Found ${retryableImages.length} images to retry`)

      for (const imageData of retryableImages) {
        try {
          console.log(`Background retry: Uploading image ${imageData.id} (attempt ${(imageData.uploadFailedCount || 0) + 1})`)
          
          // Upload with extended timeout
          const originalUploadApi = await import('./api')
          const result = await originalUploadApi.uploadApi.uploadImage(
            imageData.blob, 
            'listings', 
            60000 // 60 second timeout
          )
          
          // Mark as uploaded
          await offlineDB.markImageAsUploaded(imageData.id, result.imageUrl)
          
          // Update listings with remote URL
          await this.updateListingsWithImageUrl(imageData.localUrl, result.imageUrl)
          
          // Clean up local image
          await this.cleanupUploadedImage(imageData.id)
          
          console.log(`Background retry: Successfully uploaded image ${imageData.id}`)
          
          // Trigger cache refresh for any affected listings
          window.dispatchEvent(new CustomEvent('sync-complete'))
          
        } catch (error) {
          console.error(`Background retry failed for image ${imageData.id}:`, error)
          
          // Mark as failed
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          await offlineDB.markImageUploadFailed(imageData.id, errorMessage)
        }
      }
    } catch (error) {
      console.error('Background image retry failed:', error)
    }
  }

  private async cleanupUploadedImage(imageId: string): Promise<void> {
    try {
      // Wait a bit to ensure any pending UI updates are complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Delete the local image record
      await offlineDB.deleteImage(imageId)
      console.log(`Cleaned up local image ${imageId}`)
    } catch (error) {
      console.error(`Failed to cleanup image ${imageId}:`, error)
    }
  }
}

export const syncService = new SyncService() 