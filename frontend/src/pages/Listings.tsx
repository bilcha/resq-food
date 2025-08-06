import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Grid, Map, AlertCircle, Loader2 } from 'lucide-react';
import { listingsApi, ListingFilters, Listing } from '../lib/offline-api';
import ListingCard from '../components/listings/ListingCard';
import ListingFiltersComponent from '../components/listings/ListingFilters';
import ListingsMap from '../components/listings/ListingsMap';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../lib/currency';

const Listings = () => {
  const [filters, setFilters] = useState<ListingFilters>({
    hide_expired: true,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const { t } = useTranslation();

  // Fetch listings with React Query
  const {
    data: listings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount) => {
      // Don't retry if offline or if we already have local data
      if (!navigator.onLine) return false;
      // Only retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    networkMode: 'offlineFirst', // Use cached data when offline
  });

  // Update filters
  const handleFiltersChange = (newFilters: ListingFilters) => {
    setFilters(newFilters);
  };

  // Handle listing selection from map
  const handleListingSelect = (listing: Listing) => {
    setSelectedListing(listing);
    if (viewMode === 'map') {
      // Scroll to show the selected listing info
      const element = document.getElementById(`listing-${listing.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Auto-switch to grid view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'map') {
        setViewMode('grid');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount

    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  return (
    <>
      <Helmet>
        <title>{t('listings.title')}</title>
        <meta name="description" content={t('listings.meta_description')} />
      </Helmet>

      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('listings.page_title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('listings.page_subtitle')}
            </p>
          </div>

          {/* Filters */}
          <ListingFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />

          {/* View Toggle & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span className="text-sm text-gray-600">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('listings.loading')}</span>
                  </div>
                ) : (
                  `${listings.length} ${listings.length !== 1 ? t('listings.listings_found') : t('listings.listing_found')}`
                )}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {t('listings.view_label')}
              </span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid size={16} className="sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t('listings.grid_view')}
                  </span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 text-sm font-medium transition-colors hidden sm:flex items-center ${
                    viewMode === 'map'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Map size={16} className="mr-2" />
                  {t('listings.map_view')}
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <AlertCircle className="text-red-500 mt-0.5 mr-3" size={20} />
                <div>
                  <h3 className="text-red-800 font-medium">
                    {t('listings.error_loading')}
                  </h3>
                  <p className="text-red-700 text-sm mt-1">
                    {error instanceof Error
                      ? error.message
                      : t('listings.error_message')}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="btn btn-sm mt-3 bg-red-600 text-white hover:bg-red-700"
                  >
                    {t('listings.try_again')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {viewMode === 'grid' ? (
            // Grid View
            <div>
              {isLoading ? (
                // Loading skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="card">
                      <div className="skeleton h-48 mb-4"></div>
                      <div className="space-y-3">
                        <div className="skeleton h-4 w-20"></div>
                        <div className="skeleton h-6 w-full"></div>
                        <div className="skeleton h-4 w-3/4"></div>
                        <div className="skeleton h-4 w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                // Empty State
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {t('listings.no_listings')}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {t('listings.no_listings_message')}
                  </p>
                  <button
                    onClick={() => setFilters({})}
                    className="btn btn-primary"
                  >
                    {t('listings.clear_filters')}
                  </button>
                </div>
              ) : (
                // Listings Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      id={`listing-${listing.id}`}
                      className={`${
                        selectedListing?.id === listing.id
                          ? 'ring-2 ring-primary-500 ring-offset-2'
                          : ''
                      }`}
                    >
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Map View
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
                {/* Map */}
                <div className="lg:col-span-2">
                  <ListingsMap
                    listings={listings}
                    onListingSelect={handleListingSelect}
                    className="h-full"
                  />
                </div>

                {/* Sidebar with listings */}
                <div className="border-l border-gray-200 bg-gray-50">
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <h3 className="font-semibold text-gray-900">
                      {listings.length} Listing
                      {listings.length !== 1 ? 's' : ''}
                    </h3>
                  </div>

                  <div className="overflow-y-auto h-full pb-4">
                    {isLoading ? (
                      <div className="p-4 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="card">
                            <div className="skeleton h-20 mb-3"></div>
                            <div className="skeleton h-4 w-3/4 mb-2"></div>
                            <div className="skeleton h-3 w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : listings.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>No listings to display on map</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        {listings.map((listing) => (
                          <div
                            key={listing.id}
                            id={`listing-${listing.id}`}
                            className={`card card-hover cursor-pointer transition-all ${
                              selectedListing?.id === listing.id
                                ? 'ring-2 ring-primary-500 bg-primary-50'
                                : ''
                            }`}
                            onClick={() => handleListingSelect(listing)}
                          >
                            <div className="flex space-x-3">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {listing.image_url ? (
                                  <img
                                    src={listing.image_url}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    🍽️
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {listing.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {listing.businesses?.name ||
                                    'Unknown Business'}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span
                                    className={`text-xs font-medium ${
                                      listing.is_free
                                        ? 'text-green-600'
                                        : 'text-gray-900'
                                    }`}
                                  >
                                    {listing.is_free
                                      ? t('listing_detail.free')
                                      : formatPrice(listing.price, false)}
                                  </span>
                                  {listing.businesses?.google_rating && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <span className="text-yellow-400 mr-1">
                                        ★
                                      </span>
                                      {listing.businesses.google_rating}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Listings;
