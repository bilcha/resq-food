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
      // Step 1: Sync pending changes to backend
      await this.syncPendingChanges()

      // Step 2: Fetch latest data from backend
      await this.syncFromBackend()

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

  private async processPendingChange(change: any): Promise<void> {
    const { type, table, data } = change

    if (table === 'listings') {
      switch (type) {
        case 'create':
          const createdListing = await listingsApi.create(data)
          await offlineDB.saveListing(createdListing)
          break
        case 'update':
          const updatedListing = await listingsApi.update(data.id, data)
          await offlineDB.saveListing(updatedListing)
          break
        case 'delete':
          await listingsApi.delete(data.id)
          await offlineDB.deleteListing(data.id)
          break
      }
    } else if (table === 'businesses') {
      switch (type) {
        case 'update':
          const updatedBusiness = await businessApi.updateProfile(data)
          await offlineDB.saveBusiness(updatedBusiness)
          break
        // Businesses are typically not created or deleted via the frontend
      }
    }
  }

  private async syncFromBackend(): Promise<void> {
    try {
      // Fetch all listings
      const listings = await listingsApi.getAll()
      console.log(`Fetched ${listings.length} listings from backend`)
      
      // Save to local DB
      for (const listing of listings) {
        await offlineDB.saveListing(listing)
      }

      // Fetch all businesses
      const businesses = await businessApi.getAll()
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
    } catch (error) {
      console.error('Force sync to local failed:', error)
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
  }> {
    const pendingChanges = await offlineDB.getPendingChanges()
    const lastSync = await this.getLastSyncTimestamp()

    return {
      isOnline: navigator.onLine,
      isSyncing: this.isSyncing,
      lastSync,
      pendingChanges: pendingChanges.length
    }
  }
}

export const syncService = new SyncService() 