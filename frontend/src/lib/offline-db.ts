import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Business, Listing } from './api';

interface OfflineDBSchema extends DBSchema {
  businesses: {
    key: string;
    value: Business & {
      _lastUpdated: number;
      _lastSynced?: number;
    };
  };
  listings: {
    key: string;
    value: Listing & {
      _lastUpdated: number;
      _lastSynced?: number;
    };
    indexes: {
      'by-business': string;
      'by-category': string;
    };
  };
  pending_changes: {
    key: string;
    value: {
      id: string;
      type: 'create' | 'update' | 'delete';
      table: 'businesses' | 'listings';
      data: any;
      timestamp: number;
    };
  };
  app_state: {
    key: string;
    value: {
      key: string;
      value: any;
      timestamp: number;
    };
  };
  images: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      filename: string;
      mimeType: string;
      size: number;
      localUrl: string;
      remoteUrl?: string;
      uploaded: boolean;
      createdAt: number;
      linkedToListing?: string;
      uploadFailedCount?: number;
      lastUploadAttempt?: number;
      uploadError?: string;
    };
    indexes: {
      'by-listing': string;
    };
  };
}

class OfflineDB {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;
  private readonly DB_NAME = 'resq-food-offline';
  private readonly DB_VERSION = 2; // Increment version for schema change

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<OfflineDBSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db, oldVersion) {
        // Businesses store
        if (!db.objectStoreNames.contains('businesses')) {
          db.createObjectStore('businesses', { keyPath: 'id' });
        }

        // Listings store with indexes
        if (!db.objectStoreNames.contains('listings')) {
          const listingsStore = db.createObjectStore('listings', {
            keyPath: 'id',
          });
          listingsStore.createIndex('by-business', 'business_id');
          listingsStore.createIndex('by-category', 'category');
        }

        // Pending changes for sync
        if (!db.objectStoreNames.contains('pending_changes')) {
          db.createObjectStore('pending_changes', { keyPath: 'id' });
        }

        // App state store
        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state', { keyPath: 'key' });
        }

        // Images store (new in version 2)
        if (oldVersion < 2 && !db.objectStoreNames.contains('images')) {
          const imagesStore = db.createObjectStore('images', { keyPath: 'id' });
          imagesStore.createIndex('by-listing', 'linkedToListing');
        }
      },
    });
  }

  private async ensureInit(): Promise<IDBPDatabase<OfflineDBSchema>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Business operations
  async saveBusiness(business: Business): Promise<void> {
    const db = await this.ensureInit();
    const businessWithMeta = {
      ...business,
      _lastUpdated: Date.now(),
      _lastSynced: Date.now(),
    };
    await db.put('businesses', businessWithMeta);
  }

  async getBusinesses(): Promise<Business[]> {
    const db = await this.ensureInit();
    const businesses = await db.getAll('businesses');
    return businesses.map(
      ({ _lastUpdated, _lastSynced, ...business }) => business as Business,
    );
  }

  async getBusiness(id: string): Promise<Business | null> {
    const db = await this.ensureInit();
    const business = await db.get('businesses', id);
    if (!business) return null;
    const { _lastUpdated, _lastSynced, ...businessData } = business;
    return businessData as Business;
  }

  async deleteBusiness(id: string): Promise<void> {
    const db = await this.ensureInit();
    await db.delete('businesses', id);
  }

  // Listing operations
  async saveListing(listing: Listing): Promise<void> {
    const db = await this.ensureInit();
    const listingWithMeta = {
      ...listing,
      _lastUpdated: Date.now(),
      _lastSynced: Date.now(),
    };
    await db.put('listings', listingWithMeta);
  }

  async getListings(): Promise<Listing[]> {
    const db = await this.ensureInit();
    const listings = await db.getAll('listings');
    return listings.map(
      ({ _lastUpdated, _lastSynced, ...listing }) => listing as Listing,
    );
  }

  async getListing(id: string): Promise<Listing | null> {
    const db = await this.ensureInit();
    const listing = await db.get('listings', id);
    if (!listing) return null;
    const { _lastUpdated, _lastSynced, ...listingData } = listing;
    return listingData as Listing;
  }

  async getListingsByBusiness(businessId: string): Promise<Listing[]> {
    const db = await this.ensureInit();
    const listings = await db.getAllFromIndex(
      'listings',
      'by-business',
      businessId,
    );
    return listings.map(
      ({ _lastUpdated, _lastSynced, ...listing }) => listing as Listing,
    );
  }

  async getListingsByCategory(category: string): Promise<Listing[]> {
    const db = await this.ensureInit();
    const listings = await db.getAllFromIndex(
      'listings',
      'by-category',
      category,
    );
    return listings.map(
      ({ _lastUpdated, _lastSynced, ...listing }) => listing as Listing,
    );
  }

  async deleteListing(id: string): Promise<void> {
    const db = await this.ensureInit();
    await db.delete('listings', id);
  }

  // Filter listings locally
  async filterListings(filters: {
    category?: string;
    is_free?: boolean;
    min_price?: number;
    max_price?: number;
    search?: string;
    hide_expired?: boolean;
  }): Promise<Listing[]> {
    let listings = await this.getListings();

    if (filters.category) {
      listings = listings.filter(
        (listing) => listing.category === filters.category,
      );
    }

    if (filters.is_free !== undefined) {
      listings = listings.filter(
        (listing) => listing.is_free === filters.is_free,
      );
    }

    if (filters.min_price !== undefined) {
      listings = listings.filter(
        (listing) => listing.price >= filters.min_price!,
      );
    }

    if (filters.max_price !== undefined) {
      listings = listings.filter(
        (listing) => listing.price <= filters.max_price!,
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      listings = listings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm) ||
          listing.description.toLowerCase().includes(searchTerm) ||
          (listing.businesses?.name &&
            listing.businesses.name.toLowerCase().includes(searchTerm)),
      );
    }

    // Filter out expired listings if hide_expired is true
    if (filters.hide_expired !== false) {
      // Default to true if not explicitly set to false
      const now = new Date();
      listings = listings.filter((listing) => {
        const availableUntil = new Date(listing.available_until);
        return availableUntil > now;
      });
    }

    return listings;
  }

  // Pending changes for sync
  async addPendingChange(
    type: 'create' | 'update' | 'delete',
    table: 'businesses' | 'listings',
    data: any,
  ): Promise<void> {
    const db = await this.ensureInit();
    const change = {
      id: `${type}_${table}_${data.id || 'new'}_${Date.now()}`,
      type,
      table,
      data,
      timestamp: Date.now(),
    };
    await db.put('pending_changes', change);
  }

  async getPendingChanges(): Promise<any[]> {
    const db = await this.ensureInit();
    return await db.getAll('pending_changes');
  }

  async removePendingChange(id: string): Promise<void> {
    const db = await this.ensureInit();
    await db.delete('pending_changes', id);
  }

  async updatePendingChange(id: string, updatedData: any): Promise<void> {
    const db = await this.ensureInit();
    const existingChange = await db.get('pending_changes', id);
    if (existingChange) {
      const updatedChange = {
        ...existingChange,
        data: updatedData,
        timestamp: Date.now(),
      };
      await db.put('pending_changes', updatedChange);
    }
  }

  async clearPendingChanges(): Promise<void> {
    const db = await this.ensureInit();
    const tx = db.transaction(['pending_changes'], 'readwrite');
    await tx.objectStore('pending_changes').clear();
    await tx.done;
  }

  // App state management
  async setAppState(key: string, value: any): Promise<void> {
    const db = await this.ensureInit();
    await db.put('app_state', {
      key,
      value,
      timestamp: Date.now(),
    });
  }

  async getAppState(key: string): Promise<any> {
    const db = await this.ensureInit();
    const state = await db.get('app_state', key);
    return state?.value;
  }

  // Image operations
  async saveImage(file: File, linkedToListing?: string): Promise<string> {
    const db = await this.ensureInit();
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const localUrl = URL.createObjectURL(file);

    const imageData = {
      id: imageId,
      blob: file,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      localUrl,
      uploaded: false,
      createdAt: Date.now(),
      linkedToListing,
    };

    await db.put('images', imageData);
    return localUrl;
  }

  async getImage(id: string): Promise<{ blob: Blob; localUrl: string } | null> {
    const db = await this.ensureInit();
    const image = await db.get('images', id);
    if (!image) return null;
    return { blob: image.blob, localUrl: image.localUrl };
  }

  async getImagesByListing(listingId: string): Promise<any[]> {
    const db = await this.ensureInit();
    return await db.getAllFromIndex('images', 'by-listing', listingId);
  }

  async getUnuploadedImages(): Promise<any[]> {
    const db = await this.ensureInit();
    const images = await db.getAll('images');
    return images.filter((img) => !img.uploaded);
  }

  async markImageAsUploaded(imageId: string, remoteUrl: string): Promise<void> {
    const db = await this.ensureInit();
    const image = await db.get('images', imageId);
    if (image) {
      image.uploaded = true;
      image.remoteUrl = remoteUrl;
      // Clear any failure tracking on successful upload
      delete image.uploadFailedCount;
      delete image.lastUploadAttempt;
      delete image.uploadError;
      await db.put('images', image);
    }
  }

  async markImageUploadFailed(imageId: string, error: string): Promise<void> {
    const db = await this.ensureInit();
    const image = await db.get('images', imageId);
    if (image) {
      image.uploadFailedCount = (image.uploadFailedCount || 0) + 1;
      image.lastUploadAttempt = Date.now();
      image.uploadError = error;
      await db.put('images', image);
    }
  }

  async getFailedUploadImages(): Promise<any[]> {
    const db = await this.ensureInit();
    const images = await db.getAll('images');
    return images.filter(
      (img) =>
        !img.uploaded && img.uploadFailedCount && img.uploadFailedCount > 0,
    );
  }

  async getRetryableImages(
    maxRetries: number = 3,
    minRetryDelay: number = 5 * 60 * 1000,
  ): Promise<any[]> {
    const db = await this.ensureInit();
    const images = await db.getAll('images');
    const now = Date.now();

    return images.filter(
      (img) =>
        !img.uploaded &&
        (img.uploadFailedCount || 0) < maxRetries &&
        (!img.lastUploadAttempt || now - img.lastUploadAttempt > minRetryDelay),
    );
  }

  async deleteImage(id: string): Promise<void> {
    const db = await this.ensureInit();
    const image = await db.get('images', id);
    if (image && image.localUrl) {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(image.localUrl);
    }
    await db.delete('images', id);
  }

  async findImageByLocalUrl(localUrl: string): Promise<any | null> {
    const db = await this.ensureInit();
    const images = await db.getAll('images');
    return images.find((img) => img.localUrl === localUrl) || null;
  }

  // Utility methods
  async clear(): Promise<void> {
    const db = await this.ensureInit();
    const tx = db.transaction(
      ['businesses', 'listings', 'pending_changes', 'app_state', 'images'],
      'readwrite',
    );

    // Revoke all image URLs before clearing
    const images = await tx.objectStore('images').getAll();
    images.forEach((image) => {
      if (image.localUrl) {
        URL.revokeObjectURL(image.localUrl);
      }
    });

    await Promise.all([
      tx.objectStore('businesses').clear(),
      tx.objectStore('listings').clear(),
      tx.objectStore('pending_changes').clear(),
      tx.objectStore('app_state').clear(),
      tx.objectStore('images').clear(),
    ]);
    await tx.done;
  }

  async getStorageInfo(): Promise<{
    businessesCount: number;
    listingsCount: number;
    pendingChangesCount: number;
    imagesCount: number;
    unuploadedImagesCount: number;
  }> {
    const db = await this.ensureInit();
    const [businessesCount, listingsCount, pendingChangesCount, imagesCount] =
      await Promise.all([
        db.count('businesses'),
        db.count('listings'),
        db.count('pending_changes'),
        db.count('images'),
      ]);

    const unuploadedImages = await this.getUnuploadedImages();

    return {
      businessesCount,
      listingsCount,
      pendingChangesCount,
      imagesCount,
      unuploadedImagesCount: unuploadedImages.length,
    };
  }
}

export const offlineDB = new OfflineDB();

// Initialize the database
offlineDB.init().catch(console.error);
