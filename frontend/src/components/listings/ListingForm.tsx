import { useState, useRef } from 'react'
import { Calendar, Upload, X, Loader2, Euro, Package, Clock } from 'lucide-react'
import { FOOD_CATEGORIES, CreateListingData, UpdateListingData, uploadApi } from '../../lib/api'

interface ListingFormProps {
  initialData?: Partial<CreateListingData>
  onSubmit: (data: CreateListingData | UpdateListingData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

export default function ListingForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Create Listing'
}: ListingFormProps) {
  const [formData, setFormData] = useState<CreateListingData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    price: initialData?.price || 0,
    is_free: initialData?.is_free || false,
    image_url: initialData?.image_url || '',
    available_from: initialData?.available_from || '',
    available_until: initialData?.available_until || '',
    quantity: initialData?.quantity || 1,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (!formData.is_free && (!formData.price || formData.price <= 0)) {
      newErrors.price = 'Price must be greater than 0 for paid listings'
    }
    if (!formData.available_from) {
      newErrors.available_from = 'Available from date is required'
    }
    if (!formData.available_until) {
      newErrors.available_until = 'Available until date is required'
    }
    if (formData.available_from && formData.available_until && 
        new Date(formData.available_from) >= new Date(formData.available_until)) {
      newErrors.available_until = 'End date must be after start date'
    }
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleImageUpload = async (file: File) => {
    setImageUploading(true)
    try {
      const { imageUrl } = await uploadApi.uploadImage(file, 'listings')
      setFormData(prev => ({ ...prev, image_url: imageUrl }))
    } catch (error) {
      console.error('Image upload error:', error)
      setErrors(prev => ({ ...prev, image_url: 'Failed to upload image' }))
    } finally {
      setImageUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image_url: 'Image must be less than 5MB' }))
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image_url: 'Please select a valid image file' }))
        return
      }

      handleImageUpload(file)
    }
  }

  const removeImage = async () => {
    if (formData.image_url) {
      try {
        await uploadApi.deleteImage(formData.image_url)
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
      setFormData(prev => ({ ...prev, image_url: '' }))
    }
  }

  const formatDateTime = (value: string) => {
    if (!value) return ''
    const date = new Date(value)
    return date.toISOString().slice(0, 16)
  }

  const handleDateTimeChange = (field: 'available_from' | 'available_until', value: string) => {
    if (!value) return
    const isoString = new Date(value).toISOString()
    setFormData(prev => ({ ...prev, [field]: isoString }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Listing Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Fresh Bakery Surprise Box"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe what's included in this surprise package..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {FOOD_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={formData.is_free}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                is_free: e.target.checked,
                price: e.target.checked ? 0 : prev.price
              }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>Free listing</span>
          </label>
        </div>
        
        {!formData.is_free && (
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (€) *
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity Available *
        </label>
        <div className="relative">
          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="number"
            id="quantity"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="1"
          />
        </div>
        {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
      </div>

      {/* Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="available_from" className="block text-sm font-medium text-gray-700 mb-1">
            Available From *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="datetime-local"
              id="available_from"
              value={formatDateTime(formData.available_from)}
              onChange={(e) => handleDateTimeChange('available_from', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.available_from ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.available_from && <p className="text-red-500 text-sm mt-1">{errors.available_from}</p>}
        </div>

        <div>
          <label htmlFor="available_until" className="block text-sm font-medium text-gray-700 mb-1">
            Available Until *
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="datetime-local"
              id="available_until"
              value={formatDateTime(formData.available_until)}
              onChange={(e) => handleDateTimeChange('available_until', e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.available_until ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.available_until && <p className="text-red-500 text-sm mt-1">{errors.available_until}</p>}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Listing Image
        </label>
        
        {formData.image_url ? (
          <div className="relative inline-block">
            <img
              src={formData.image_url}
              alt="Listing preview"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {imageUploading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Upload size={24} />
              )}
              <span className="text-sm">
                {imageUploading ? 'Uploading...' : 'Click to upload image'}
              </span>
            </button>
          </div>
        )}
        {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>}
        <p className="text-xs text-gray-500 mt-1">
          Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || imageUploading}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading && <Loader2 className="animate-spin" size={16} />}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  )
} 