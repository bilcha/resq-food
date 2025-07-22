import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Business, Listing } from './api'

interface OfflineDBSchema extends DBSchema {
  businesses: {
    key: string
    value: Business & {
      _lastUpdated: number
      _lastSynced?: number
    }
  }
  listings: {
    key: string
    value: Listing & {
      _lastUpdated: number
      _lastSynced?: number
    }
    indexes: {
      'by-business': string
      'by-category': string
    }
  }
  pending_changes: {
    key: string
    value: {
      id: string
      type: 'create' | 'update' | 'delete'
      table: 'businesses' | 'listings'
      data: any
      timestamp: number
    }
  }
  app_state: {
    key: string
    value: {
      key: string
      value: any
      timestamp: number
    }
  }
}

class OfflineDB {
  private db: IDBPDatabase<OfflineDBSchema> | null = null
  private readonly DB_NAME = 'resq-food-offline'
  private readonly DB_VERSION = 1

  async init(): Promise<void> {
    if (this.db) return

    this.db = await openDB<OfflineDBSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Businesses store
        if (!db.objectStoreNames.contains('businesses')) {
          db.createObjectStore('businesses', { keyPath: 'id' })
        }

        // Listings store with indexes
        if (!db.objectStoreNames.contains('listings')) {
          const listingsStore = db.createObjectStore('listings', { keyPath: 'id' })
          listingsStore.createIndex('by-business', 'business_id')
          listingsStore.createIndex('by-category', 'category')
        }

        // Pending changes for sync
        if (!db.objectStoreNames.contains('pending_changes')) {
          db.createObjectStore('pending_changes', { keyPath: 'id' })
        }

        // App state store
        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state', { keyPath: 'key' })
        }
      },
    })
  }

  private async ensureInit(): Promise<IDBPDatabase<OfflineDBSchema>> {
    if (!this.db) {
      await this.init()
    }
    return this.db!
  }

  // Business operations
  async saveBusiness(business: Business): Promise<void> {
    const db = await this.ensureInit()
    const businessWithMeta = {
      ...business,
      _lastUpdated: Date.now(),
      _lastSynced: Date.now()
    }
    await db.put('businesses', businessWithMeta)
  }

  async getBusinesses(): Promise<Business[]> {
    const db = await this.ensureInit()
    const businesses = await db.getAll('businesses')
    return businesses.map(({ _lastUpdated, _lastSynced, ...business }) => business as Business)
  }

  async getBusiness(id: string): Promise<Business | null> {
    const db = await this.ensureInit()
    const business = await db.get('businesses', id)
    if (!business) return null
    const { _lastUpdated, _lastSynced, ...businessData } = business
    return businessData as Business
  }

  async deleteBusiness(id: string): Promise<void> {
    const db = await this.ensureInit()
    await db.delete('businesses', id)
  }

  // Listing operations
  async saveListing(listing: Listing): Promise<void> {
    const db = await this.ensureInit()
    const listingWithMeta = {
      ...listing,
      _lastUpdated: Date.now(),
      _lastSynced: Date.now()
    }
    await db.put('listings', listingWithMeta)
  }

  async getListings(): Promise<Listing[]> {
    const db = await this.ensureInit()
    const listings = await db.getAll('listings')
    return listings.map(({ _lastUpdated, _lastSynced, ...listing }) => listing as Listing)
  }

  async getListing(id: string): Promise<Listing | null> {
    const db = await this.ensureInit()
    const listing = await db.get('listings', id)
    if (!listing) return null
    const { _lastUpdated, _lastSynced, ...listingData } = listing
    return listingData as Listing
  }

  async getListingsByBusiness(businessId: string): Promise<Listing[]> {
    const db = await this.ensureInit()
    const listings = await db.getAllFromIndex('listings', 'by-business', businessId)
    return listings.map(({ _lastUpdated, _lastSynced, ...listing }) => listing as Listing)
  }

  async getListingsByCategory(category: string): Promise<Listing[]> {
    const db = await this.ensureInit()
    const listings = await db.getAllFromIndex('listings', 'by-category', category)
    return listings.map(({ _lastUpdated, _lastSynced, ...listing }) => listing as Listing)
  }

  async deleteListing(id: string): Promise<void> {
    const db = await this.ensureInit()
    await db.delete('listings', id)
  }

  // Filter listings locally
  async filterListings(filters: {
    category?: string
    is_free?: boolean
    min_price?: number
    max_price?: number
    search?: string
  }): Promise<Listing[]> {
    let listings = await this.getListings()

    if (filters.category) {
      listings = listings.filter(listing => listing.category === filters.category)
    }

    if (filters.is_free !== undefined) {
      listings = listings.filter(listing => listing.is_free === filters.is_free)
    }

    if (filters.min_price !== undefined) {
      listings = listings.filter(listing => listing.price >= filters.min_price!)
    }

    if (filters.max_price !== undefined) {
      listings = listings.filter(listing => listing.price <= filters.max_price!)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      listings = listings.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm) ||
        listing.businesses.name.toLowerCase().includes(searchTerm)
      )
    }

    return listings
  }

  // Pending changes for sync
  async addPendingChange(type: 'create' | 'update' | 'delete', table: 'businesses' | 'listings', data: any): Promise<void> {
    const db = await this.ensureInit()
    const change = {
      id: `${type}_${table}_${data.id || 'new'}_${Date.now()}`,
      type,
      table,
      data,
      timestamp: Date.now()
    }
    await db.put('pending_changes', change)
  }

  async getPendingChanges(): Promise<any[]> {
    const db = await this.ensureInit()
    return await db.getAll('pending_changes')
  }

  async removePendingChange(id: string): Promise<void> {
    const db = await this.ensureInit()
    await db.delete('pending_changes', id)
  }

  async clearPendingChanges(): Promise<void> {
    const db = await this.ensureInit()
    const tx = db.transaction(['pending_changes'], 'readwrite')
    await tx.objectStore('pending_changes').clear()
    await tx.done
  }

  // App state management
  async setAppState(key: string, value: any): Promise<void> {
    const db = await this.ensureInit()
    await db.put('app_state', {
      key,
      value,
      timestamp: Date.now()
    })
  }

  async getAppState(key: string): Promise<any> {
    const db = await this.ensureInit()
    const state = await db.get('app_state', key)
    return state?.value
  }

  // Utility methods
  async clear(): Promise<void> {
    const db = await this.ensureInit()
    const tx = db.transaction(['businesses', 'listings', 'pending_changes', 'app_state'], 'readwrite')
    await Promise.all([
      tx.objectStore('businesses').clear(),
      tx.objectStore('listings').clear(),
      tx.objectStore('pending_changes').clear(),
      tx.objectStore('app_state').clear()
    ])
    await tx.done
  }

  async getStorageInfo(): Promise<{
    businessesCount: number
    listingsCount: number
    pendingChangesCount: number
  }> {
    const db = await this.ensureInit()
    const [businessesCount, listingsCount, pendingChangesCount] = await Promise.all([
      db.count('businesses'),
      db.count('listings'),
      db.count('pending_changes')
    ])

    return {
      businessesCount,
      listingsCount,
      pendingChangesCount
    }
  }
}

export const offlineDB = new OfflineDB()

// Initialize the database
offlineDB.init().catch(console.error) 