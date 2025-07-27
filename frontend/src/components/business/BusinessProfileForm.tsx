/// <reference types="google.maps" />
import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Loader } from '@googlemaps/js-api-loader'
import { Business, BusinessUpdateData, businessApi } from '../../lib/offline-api'
import { useAuthStore } from '../../store/auth'
import { MapPin, Save, Loader2, AlertCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface BusinessProfileFormProps {
  business: Business
  onUpdate?: (updatedBusiness: Business) => void
}

interface FormData {
  name: string
  phone: string
  address: string
  description: string
}

const BusinessProfileForm = ({ business, onUpdate }: BusinessProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(null)
  const [useManualAddress, setUseManualAddress] = useState(false)
  const { t } = useTranslation()
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<FormData>({
    defaultValues: {
      name: business.name || '',
      phone: business.phone || '',
      address: business.address || '',
      description: business.description || ''
    }
  })

  const watchedAddress = watch('address')

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        })

        await loader.load()
        
        if (!mapRef.current) return

        // Use business location if available, otherwise default location
        const initialLocation = business.latitude && business.longitude
          ? { lat: business.latitude, lng: business.longitude }
          : { lat: 50.1109, lng: 8.6821 } // Frankfurt, Germany

        const map = new google.maps.Map(mapRef.current, {
          zoom: business.latitude && business.longitude ? 15 : 10,
          center: initialLocation,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })

        mapInstanceRef.current = map

        // Add initial marker if business has location
        if (business.latitude && business.longitude) {
          const marker = new google.maps.Marker({
            position: initialLocation,
            map: map,
            draggable: true,
            title: business.name
          })

          markerRef.current = marker

          // Handle marker drag
          marker.addListener('dragend', () => {
            const position = marker.getPosition()
            if (position) {
              reverseGeocode(position.lat(), position.lng())
            }
          })

          setSelectedLocation({
            lat: business.latitude,
            lng: business.longitude,
            address: business.address || ''
          })
        }

        // Handle map clicks
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            addMarker(event.latLng.lat(), event.latLng.lng())
            reverseGeocode(event.latLng.lat(), event.latLng.lng())
          }
        })

        // Initialize Places Autocomplete
        if (addressInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
            types: ['establishment', 'geocode'],
            fields: ['place_id', 'geometry', 'formatted_address', 'name']
          })

          autocompleteRef.current = autocomplete

          // Enable autocomplete even on read-only input
          // addressInputRef.current.addEventListener('focus', () => {
          //   if (addressInputRef.current) {
          //     addressInputRef.current.removeAttribute('readonly')
          //   }
          // })

          // addressInputRef.current.addEventListener('blur', () => {
          //   if (addressInputRef.current && !useManualAddress) {
          //     addressInputRef.current.setAttribute('readonly', 'true')
          //   }
          // })

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place.geometry?.location && place.formatted_address) {
              const lat = place.geometry.location.lat()
              const lng = place.geometry.location.lng()
              
              addMarker(lat, lng)
              map.setCenter({ lat, lng })
              map.setZoom(15)
              
              setSelectedLocation({
                lat,
                lng,
                address: place.formatted_address
              })
              
              setValue('address', place.formatted_address, { 
                shouldDirty: true, 
                shouldTouch: true 
              })
              
              // Ensure input becomes read-only again after selection
              if (addressInputRef.current) {
                addressInputRef.current.setAttribute('readonly', 'true')
              }
            }
          })
        }

        setIsMapLoaded(true)
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        toast.error('Failed to load map. You can still update your profile using manual address entry.')
      }
    }

    if (!useManualAddress) {
      initMap()
    }
  }, [business, useManualAddress])

  const addMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    // Add new marker
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      draggable: true,
      title: 'Business Location'
    })

    markerRef.current = marker

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker.getPosition()
      if (position) {
        reverseGeocode(position.lat(), position.lng())
      }
    })
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder()
      const response = await geocoder.geocode({
        location: { lat, lng }
      })

      if (response.results.length > 0) {
        const address = response.results[0].formatted_address
        setSelectedLocation({ lat, lng, address })
        setValue('address', address, { 
          shouldDirty: true, 
          shouldTouch: true 
        })
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    
    try {
      const updateData: BusinessUpdateData = {
        name: data.name,
        phone: data.phone || undefined,
        description: data.description || undefined
      }

      // If using map and location is selected, include address
      if (!useManualAddress && selectedLocation) {
        updateData.address = selectedLocation.address
      } else if (useManualAddress && data.address) {
        updateData.address = data.address
      }

      const updatedBusiness = await businessApi.updateProfile(updateData)
      
      // Reset form with updated values to mark it as clean
      reset({
        name: updatedBusiness.name || '',
        phone: updatedBusiness.phone || '',
        address: updatedBusiness.address || '',
        description: updatedBusiness.description || ''
      })
      
      toast.success(t('components.business.profile_form.success_message'))
      onUpdate?.(updatedBusiness)
      
    } catch (error) {
      console.error('Error updating business profile:', error)
      toast.error(t('components.business.profile_form.error_message'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('components.business.profile_form.title')}
        </h2>
        <p className="text-gray-600">
          {t('components.business.profile_form.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            {t('components.business.profile_form.business_name')} *
          </label>
          <input
            {...register('name', { 
              required: t('components.business.profile_form.validation.name_required'),
              maxLength: { value: 255, message: t('components.business.profile_form.validation.name_max_length') }
            })}
            type="text"
            id="name"
            className={`input w-full ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder={t('components.business.profile_form.placeholders.business_name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('components.business.profile_form.email_address')}
          </label>
          <input
            type="email"
            id="email"
            value={business.email}
            disabled
            className="input w-full bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('components.business.profile_form.email_readonly')}
          </p>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t('components.business.profile_form.phone_number')}
          </label>
          <input
            {...register('phone', {
              maxLength: { value: 50, message: t('components.business.profile_form.validation.phone_invalid') }
            })}
            type="tel"
            id="phone"
            className={`input w-full ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder={t('components.business.profile_form.placeholders.phone')}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Location Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {t('components.business.profile_form.business_location')}
            </label>
            <button
              type="button"
              onClick={() => setUseManualAddress(!useManualAddress)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {useManualAddress ? t('components.business.profile_form.use_map_instead') : t('components.business.profile_form.enter_manually')}
            </button>
          </div>

          {useManualAddress ? (
            // Manual Address Input
            <div>
              <input
                {...register('address')}
                type="text"
                placeholder={t('components.business.profile_form.placeholders.address')}
                className="input w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                {t('components.business.profile_form.enter_complete_address')}
              </p>
            </div>
          ) : (
            // Map Interface
            <div className="space-y-4">
              {/* Address Search Input */}
              <div>
                <input
                  {...register('address')}
                  ref={(element) => {
                    if (element) {
                      (addressInputRef as any).current = element
                    }
                  }}
                  type="text"
                  placeholder="Search for your business address..."
                  className="input w-full bg-gray-50"
                  disabled
                  value={watchedAddress || ''}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Search for your address or click on the map to select a location.
                </p>
              </div>

              {/* Map */}
              <div className="relative">
                <div 
                  ref={mapRef} 
                  className="w-full h-64 rounded-lg border border-gray-200"
                />
                
                {!isMapLoaded && (
                  <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                      <p>{t('components.business.profile_form.loading_map')}</p>
                    </div>
                  </div>
                )}

                {/* Selected Location Info */}
                {selectedLocation && (
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3 max-w-xs">
                    <div className="flex items-start space-x-2">
                      <MapPin size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{t('components.business.profile_form.selected_location')}</p>
                        <p className="text-gray-600 mt-1">{selectedLocation.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            {t('components.business.profile_form.business_description')}
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={4}
            className="input w-full resize-none"
            placeholder={t('components.business.profile_form.placeholders.description')}
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('components.business.profile_form.describe_business')}
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {isDirty && `• ${t('components.business.profile_form.no_changes')}`}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {t('components.business.profile_form.saving')}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {t('components.business.profile_form.save_changes')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BusinessProfileForm 