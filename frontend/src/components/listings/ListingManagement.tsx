import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Package, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { listingsApi, Listing, CreateListingData, UpdateListingData } from '../../lib/offline-api'
import { useAuthStore } from '../../store/auth'
import ListingForm from './ListingForm'
import { formatPrice } from '../../lib/currency'

interface ListingManagementProps {
  businessId: string
}

export default function ListingManagement({ businessId }: ListingManagementProps) {
  const queryClient = useQueryClient()
  const { business } = useAuthStore()
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Listen for sync completion to refresh listings
  useEffect(() => {
    const handleSyncComplete = () => {
      console.log('Sync completed, refreshing listings...')
      
      // Add a small delay to ensure database updates are complete
      setTimeout(() => {
        // Invalidate and refetch immediately
        queryClient.invalidateQueries({ 
          queryKey: ['business-listings', businessId],
          refetchType: 'all' 
        })
        // Also force a manual refetch after a short delay to ensure it happens
        setTimeout(() => {
          queryClient.refetchQueries({ 
            queryKey: ['business-listings', businessId] 
          })
        }, 500)
      }, 100)
    }

    window.addEventListener('sync-complete', handleSyncComplete)
    return () => window.removeEventListener('sync-complete', handleSyncComplete)
  }, [queryClient, businessId])

  // Fetch business listings
  const {
    data: listings = [],
    isLoading,
    isError,
    error,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['business-listings', businessId],
    queryFn: () => listingsApi.getByBusiness(businessId),
    enabled: !!businessId,
    retry: (failureCount, error) => {
      // Don't retry if offline
      if (!navigator.onLine) return false
      // Only retry network errors up to 2 times
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnWindowFocus: false,
    networkMode: 'offlineFirst',
    staleTime: 30 * 1000, // Reduced to 30 seconds for more responsive UI updates
  })

  // Debug: Log when listings data changes
  useEffect(() => {
    console.log('Listings data updated:', {
      count: listings.length,
      dataUpdatedAt: new Date(dataUpdatedAt),
      listingsWithBlobUrls: listings.filter(l => l.image_url?.startsWith('blob:')).length
    })
  }, [listings, dataUpdatedAt])

  // Create listing mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateListingData & { business_id: string }) => listingsApi.create(data),
    networkMode: 'offlineFirst',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-listings', businessId] })
      setShowForm(false)
    },
  })

  // Update listing mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingData }) => 
      listingsApi.update(id, data),
    networkMode: 'offlineFirst',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-listings', businessId] })
      setEditingListing(null)
    },
  })

  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => listingsApi.delete(id),
    networkMode: 'offlineFirst',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-listings', businessId] })
      setDeletingId(null)
    },
  })

  const handleCreateListing = async (data: CreateListingData | UpdateListingData) => {
    const createData = { ...data, business_id: businessId } as CreateListingData & { business_id: string }
    await createMutation.mutateAsync(createData)
  }

  const handleUpdateListing = async (data: CreateListingData | UpdateListingData) => {
    if (!editingListing) return
    await updateMutation.mutateAsync({ id: editingListing.id, data: data as UpdateListingData })
  }

  const handleDeleteListing = async (id: string) => {
    if (confirm(t('components.listings.management.delete_confirm'))) {
      setDeletingId(id)
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        setDeletingId(null)
      }
    }
  }

  const getStatusBadge = (listing: Listing) => {
    const now = new Date()
    const availableFrom = new Date(listing.available_from)
    const availableUntil = new Date(listing.available_until)

    if (now < availableFrom) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Calendar size={12} className="mr-1" />
          {t('components.listings.management.status.scheduled')}
        </span>
      )
    }

    if (now > availableUntil) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {t('components.listings.management.status.expired')}
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} className="mr-1" />
        {t('components.listings.management.status.active')}
      </span>
    )
  }

  const formatPriceLocal = (price: number, isFree: boolean) => {
    if (isFree) return t('listing_detail.free')
    return formatPrice(price, false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="text-red-400 mr-2" size={20} />
          <p className="text-red-800">
            {t('components.listings.management.error_loading')}: {error instanceof Error ? error.message : t('components.listings.management.unknown_error')}
          </p>
        </div>
      </div>
    )
  }

  // Show form for creating new listing
  if (showForm && !editingListing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('components.listings.management.create_new_listing')}</h2>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ListingForm
            onSubmit={handleCreateListing}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
            submitLabel={t('components.listings.management.create_listing')}
          />
        </div>
      </div>
    )
  }

  // Show form for editing listing
  if (editingListing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('components.listings.management.edit_listing')}</h2>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ListingForm
            initialData={{
              ...editingListing,
              image_url: editingListing.image_url || undefined
            }}
            onSubmit={handleUpdateListing}
            onCancel={() => setEditingListing(null)}
            isLoading={updateMutation.isPending}
            submitLabel={t('components.listings.management.update_listing')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('components.listings.management.title')}</h2>
          <p className="text-gray-600 mt-1">
            {t('components.listings.management.subtitle', { businessName: business?.name })}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{t('components.listings.management.create_new')}</span>
        </button>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('components.listings.management.no_listings')}</h3>
          <p className="text-gray-600 mb-4">
            {t('components.listings.management.create_first')}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            {t('components.listings.management.create_first_listing')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {listing.image_url ? (
                <div className="relative">
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                  {listing.image_url.startsWith('blob:') && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{t('components.listings.management.syncing')}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Package className="text-gray-400" size={48} />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {listing.title}
                  </h3>
                  {getStatusBadge(listing)}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {listing.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{t('components.listings.management.category')}:</span>
                    <span className="font-medium">{listing.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{t('components.listings.management.price')}:</span>
                    <span className="font-medium text-primary-600">
                      {formatPriceLocal(listing.price, listing.is_free)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{t('components.listings.management.quantity')}:</span>
                    <span className="font-medium">{listing.quantity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{t('components.listings.management.available_until')}:</span>
                    <span className="font-medium">
                      {format(new Date(listing.available_until), 'MMM d, HH:mm')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingListing(listing)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Edit size={16} />
                    <span>{t('components.listings.management.edit')}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteListing(listing.id)}
                    disabled={deletingId === listing.id}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deletingId === listing.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    <span>{t('components.listings.management.delete')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 