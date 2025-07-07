import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { ListingFilters, FOOD_CATEGORIES } from '../../lib/api'

interface ListingFiltersProps {
  filters: ListingFilters
  onFiltersChange: (filters: ListingFilters) => void
  isLoading?: boolean
}

const ListingFiltersComponent = ({ filters, onFiltersChange, isLoading }: ListingFiltersProps) => {
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
    const resetFilters = { search: filters.search } // Keep search
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    setIsFilterOpen(false)
  }

  const hasActiveFilters = !!(filters.category || filters.is_free !== undefined || filters.min_price || filters.max_price)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings, businesses..."
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
          Filters
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
              <label className="label">Category</label>
              <select
                className="input"
                value={localFilters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {FOOD_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="label">Min Price (€)</label>
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
              <label className="label">Max Price (€)</label>
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
              <label className="label">Type</label>
              <select
                className="input"
                value={localFilters.is_free === undefined ? '' : String(localFilters.is_free)}
                onChange={(e) => handleFilterChange('is_free', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">All Items</option>
                <option value="true">Free Only</option>
                <option value="false">Paid Only</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={resetFilters}
              className="btn btn-secondary"
            >
              <X size={16} className="mr-2" />
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="btn btn-primary"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListingFiltersComponent 