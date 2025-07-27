import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, MapPin, Clock, Star, Calendar, Package, Euro, Phone, Globe, AlertCircle } from 'lucide-react'
import { listingsApi } from '../lib/offline-api'
import { formatDistanceToNow, format } from 'date-fns'
import ListingsMap from '../components/listings/ListingsMap'
import { useTranslation } from 'react-i18next'

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    data: listing,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id!),
    enabled: !!id,
    retry: (failureCount, error) => {
      // Don't retry if offline
      if (!navigator.onLine) return false
      // Only retry network errors up to 2 times
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnWindowFocus: false,
    networkMode: 'offlineFirst',
  })

  const formatTimeRemaining = (until: string) => {
    try {
      return formatDistanceToNow(new Date(until), { addSuffix: true })
    } catch {
      return t('listing_detail.invalid_date')
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp')
    } catch {
      return t('listing_detail.invalid_date')
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Bakery': 'bg-orange-100 text-orange-800',
      'Fruits & Vegetables': 'bg-green-100 text-green-800',
      'Dairy': 'bg-blue-100 text-blue-800',
      'Meat & Fish': 'bg-red-100 text-red-800',
      'Prepared Foods': 'bg-purple-100 text-purple-800',
      'Desserts': 'bg-pink-100 text-pink-800',
      'Beverages': 'bg-cyan-100 text-cyan-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['Other']
  }

  if (isError) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              {t('listing_detail.error_loading')}
            </h2>
            <p className="text-red-700 mb-4">
              {error instanceof Error ? error.message : t('listing_detail.listing_not_found')}
            </p>
            <div className="space-x-3">
              <button
                onClick={() => navigate('/listings')}
                className="btn btn-secondary"
              >
                <ArrowLeft size={16} className="mr-2" />
                {t('listing_detail.back_to_listings')}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                {t('listing_detail.try_again')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button Skeleton */}
          <div className="skeleton h-10 w-32 mb-6"></div>
          
          {/* Header Skeleton */}
          <div className="card mb-8">
            <div className="skeleton h-8 w-3/4 mb-4"></div>
            <div className="skeleton h-6 w-1/2 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="skeleton h-64 mb-4"></div>
                <div className="skeleton h-6 w-full mb-2"></div>
                <div className="skeleton h-6 w-3/4"></div>
              </div>
              <div className="space-y-4">
                <div className="skeleton h-20"></div>
                <div className="skeleton h-20"></div>
                <div className="skeleton h-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('listing_detail.listing_not_found')}
          </h2>
          <Link to="/listings" className="btn btn-primary">
            <ArrowLeft size={16} className="mr-2" />
            {t('listing_detail.back_to_listings')}
          </Link>
        </div>
      </div>
    )
  }

  const { businesses } = listing

  return (
    <>
      <Helmet>
        <title>{listing.title} - ResQ Food</title>
        <meta name="description" content={listing.description} />
      </Helmet>

      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/listings')}
            className="btn btn-secondary mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            {t('listing_detail.back_to_listings')}
          </button>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Listing Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`badge ${getCategoryColor(listing.category)}`}>
                        {listing.category}
                      </span>
                      {listing.quantity > 1 && (
                        <span className="badge bg-primary-100 text-primary-800">
                          {listing.quantity} {t('listing_detail.available')}
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {listing.title}
                    </h1>
                  </div>
                  
                  <div className="text-right">
                    {listing.is_free ? (
                      <div className="text-2xl font-bold text-green-600">
                        {t('listing_detail.free')}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900">
                        €{listing.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Image */}
                <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-6">
                  {listing.image_url ? (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <span className="text-6xl mb-2 block">🍽️</span>
                        <p>{t('listing_detail.no_image_available')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="prose prose-gray max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t('listing_detail.description')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              </div>

              {/* Business Info */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('listing_detail.business_information')}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">{businesses?.name || t('listing_detail.unknown_business')}</h4>
                      <p className="text-gray-600">{businesses?.address || t('listing_detail.address_not_available')}</p>
                    </div>
                  </div>

                  {businesses.google_rating && (
                    <div className="flex items-center space-x-3">
                      <Star size={20} className="text-yellow-400 fill-current" />
                      <div>
                        <span className="font-medium text-gray-900">
                          {businesses.google_rating} {t('listing_detail.stars')}
                        </span>
                        <p className="text-sm text-gray-600">{t('listing_detail.google_rating')}</p>
                      </div>
                    </div>
                  )}

                  {businesses.google_place_id && (
                    <div className="flex items-center space-x-3">
                      <Globe size={20} className="text-gray-400" />
                      <a
                        href={`https://www.google.com/maps/place/?q=place_id:${businesses.google_place_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {t('listing_detail.view_on_google_maps')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Map */}
              {businesses.latitude && businesses.longitude && (
                <div className="card p-0 overflow-hidden">
                  <div className="p-6 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('listing_detail.location')}
                    </h3>
                  </div>
                  <ListingsMap
                    listings={[listing]}
                    className="h-64"
                  />
                </div>
              )}
            </div>

            {/* Right Column - Details & Actions */}
            <div className="space-y-6">
              {/* Availability */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('listing_detail.availability')}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock size={20} className="text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {t('listing_detail.available_until_label')} {formatTimeRemaining(listing.available_until)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('listing_detail.until')} {formatDateTime(listing.available_until)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {t('listing_detail.available_from')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(listing.available_from)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Package size={20} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {t('listing_detail.quantity')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {listing.quantity} {listing.quantity === 1 ? t('listing_detail.item_available') : t('listing_detail.items_available')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('listing_detail.interested')}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t('listing_detail.contact_business_message')}
                </p>
                
                <div className="space-y-3">
                  {businesses.google_place_id && (
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${businesses.google_place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full"
                    >
                      <MapPin size={16} className="mr-2" />
                      {t('listing_detail.get_directions')}
                    </a>
                  )}
                  
                  <button className="btn btn-secondary w-full">
                    <Phone size={16} className="mr-2" />
                    {t('listing_detail.contact_business')}
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-xs">
                    <strong>{t('listing_detail.note_label')}</strong> {t('listing_detail.note_message')}
                  </p>
                </div>
              </div>

              {/* Listing Details */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('listing_detail.listing_details')}
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('listing_detail.listed')}</span>
                    <span className="text-gray-900">
                      {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('listing_detail.updated')}</span>
                    <span className="text-gray-900">
                      {formatDistanceToNow(new Date(listing.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('listing_detail.category')}</span>
                    <span className="text-gray-900">{listing.category}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('listing_detail.type')}</span>
                    <span className="text-gray-900">
                      {listing.is_free ? t('listing_detail.free') : t('listing_detail.paid')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ListingDetail 