import { Link } from 'react-router-dom'
import { MapPin, Clock, Star, Euro } from 'lucide-react'
import { Listing } from '../../lib/api'
import { formatDistanceToNow } from 'date-fns'

interface ListingCardProps {
  listing: Listing
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const {
    id,
    title,
    description,
    category,
    price,
    is_free,
    image_url,
    available_until,
    quantity,
    businesses
  } = listing

  const formatTimeRemaining = (until: string) => {
    try {
      return formatDistanceToNow(new Date(until), { addSuffix: true })
    } catch {
      return 'Invalid date'
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

  return (
    <Link to={`/listings/${id}`} className="block group">
      <div className="card card-hover h-full overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-3 left-3">
            {is_free ? (
              <span className="badge bg-green-600 text-white font-semibold">
                FREE
              </span>
            ) : (
              <span className="badge bg-white text-gray-900 font-semibold shadow-sm">
                <Euro size={12} className="mr-1" />
                {price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quantity Badge */}
          {quantity > 1 && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-primary-600 text-white">
                {quantity} available
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Category */}
          <span className={`badge ${getCategoryColor(category)}`}>
            {category}
          </span>

          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>

          {/* Business Info */}
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <MapPin size={14} />
              <span className="truncate">{businesses?.name || 'Unknown Business'}</span>
            </div>
            {businesses?.google_rating && (
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span>{businesses.google_rating}</span>
              </div>
            )}
          </div>

          {/* Time Remaining */}
          <div className="flex items-center text-sm text-orange-600 space-x-1">
            <Clock size={14} />
            <span>Available {formatTimeRemaining(available_until)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard 