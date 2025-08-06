import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ListingFilters, FOOD_CATEGORIES } from '../../lib/api'
import { CURRENCY } from '../../lib/currency'

interface ListingFiltersProps {
  filters: ListingFilters
  onFiltersChange: (filters: ListingFilters) => void
  isLoading?: boolean
}

const ListingFiltersComponent = ({ filters, onFiltersChange, isLoading }: ListingFiltersProps) => {
  const { t } = useTranslation()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value || undefined }
    onFiltersChange(newFilters)
  }

  const handleFilterChange = (key: keyof ListingFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsFilterOpen(false)
  }

  const resetFilters = () => {
    const resetFilters = { search: filters.search, hide_expired: true } // Keep search, set hide_expired to true
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    setIsFilterOpen(false)
  }

  const hasActiveFilters = !!(filters.category || filters.is_free !== undefined || filters.min_price || filters.max_price || filters.hide_expired !== true)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('components.listings.filters.search_placeholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-secondary'} relative`}
          disabled={isLoading}
        >
          <Filter size={16} className="mr-2" />
          {t('components.listings.filters.filters_label')}
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {isFilterOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="label">{t('components.listings.filters.category')}</label>
              <select
                className="input"
                value={localFilters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">{t('components.listings.filters.category_all')}</option>
                {FOOD_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="label">{t('components.listings.filters.min_price')} ({CURRENCY.CODE})</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                placeholder="0.00"
                value={localFilters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="label">{t('components.listings.filters.max_price')} ({CURRENCY.CODE})</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                placeholder="50.00"
                value={localFilters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            {/* Free Items */}
            <div>
              <label className="label">{t('components.listings.filters.type')}</label>
              <select
                className="input"
                value={localFilters.is_free === undefined ? '' : String(localFilters.is_free)}
                onChange={(e) => handleFilterChange('is_free', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">{t('components.listings.filters.price_all')}</option>
                <option value="true">{t('components.listings.filters.price_free')}</option>
                <option value="false">{t('components.listings.filters.price_paid')}</option>
              </select>
            </div>
          </div>

          {/* Expired Filter */}
          <div className="mt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox"
                checked={localFilters.hide_expired !== false}
                onChange={(e) => handleFilterChange('hide_expired', e.target.checked)}
              />
              <span className="text-sm text-gray-700">
                {t('components.listings.filters.hide_expired')}
              </span>
            </label>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={resetFilters}
              className="btn btn-secondary"
            >
              <X size={16} className="mr-2" />
              {t('components.listings.filters.reset')}
            </button>
            <button
              onClick={applyFilters}
              className="btn btn-primary"
            >
              {t('components.listings.filters.apply_filters')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListingFiltersComponent 