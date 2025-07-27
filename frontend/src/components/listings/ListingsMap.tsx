import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from '../../lib/google-maps-loader'
import { useTranslation } from 'react-i18next'
import { Listing } from '../../lib/api'
import { MapPin, Euro, Star } from 'lucide-react'

interface ListingsMapProps {
  listings: Listing[]
  onListingSelect?: (listing: Listing) => void
  className?: string
}

const ListingsMap = ({ listings, onListingSelect, className = '' }: ListingsMapProps) => {
  const { t } = useTranslation()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMaps()
        
        if (!mapRef.current) return

        // Default to Ukraine center if no listings
        const defaultCenter = { lat: 50.4501, lng: 30.5234 } // Kyiv, Ukraine

        const map = new google.maps.Map(mapRef.current, {
          zoom: 10,
          center: defaultCenter,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        mapInstanceRef.current = map
        setIsLoaded(true)

      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError(t('components.listings.map.load_error'))
      }
    }

    initMap()
  }, [t])

  // Update markers when listings change
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    if (listings.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    const infoWindow = new google.maps.InfoWindow()

    listings.forEach(listing => {
      const { businesses } = listing
      if (!businesses?.latitude || !businesses?.longitude) return

      const position = {
        lat: businesses.latitude,
        lng: businesses.longitude
      }

      // Create custom marker
      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: listing.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: listing.is_free ? '#22c55e' : '#16a34a',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      // Create info window content
      const infoContent = `
        <div class="p-3 max-w-xs">
          <h3 class="font-semibold text-gray-900 mb-2">${listing.title}</h3>
          <p class="text-sm text-gray-600 mb-2">${listing.description}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-1 text-sm text-gray-500">
              <span>${businesses?.name || t('components.listings.card.unknown_business')}</span>
              ${businesses?.google_rating ? `
                <div class="flex items-center space-x-1 ml-2">
                  <span class="text-yellow-400">★</span>
                  <span>${businesses.google_rating}</span>
                </div>
              ` : ''}
            </div>
            <div class="text-sm font-semibold ${listing.is_free ? 'text-green-600' : 'text-gray-900'}">
              ${listing.is_free ? t('listing_detail.free') : `€${listing.price.toFixed(2)}`}
            </div>
          </div>
        </div>
      `

      marker.addListener('click', () => {
        infoWindow.setContent(infoContent)
        infoWindow.open(mapInstanceRef.current, marker)
        onListingSelect?.(listing)
      })

      markersRef.current.push(marker)
      bounds.extend(position)
    })

    // Fit map to show all markers
    if (listings.length > 0) {
      mapInstanceRef.current.fitBounds(bounds)
      
      // Prevent over-zooming for single marker
      google.maps.event.addListenerOnce(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current && mapInstanceRef.current.getZoom()! > 15) {
          mapInstanceRef.current.setZoom(15)
        }
      })
    }
  }, [listings, isLoaded, onListingSelect, t])

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <MapPin size={48} className="mx-auto mb-2 opacity-50" />
          <p>{t('components.listings.map.unable_to_load')}</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="loading-spinner w-8 h-8 mx-auto mb-2" />
            <p>{t('components.listings.map.loading')}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {isLoaded && listings.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm p-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>{t('components.listings.map.legend.free_items')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary-600"></div>
              <span>{t('components.listings.map.legend.paid_items')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListingsMap 