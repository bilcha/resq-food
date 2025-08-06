import { Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import { Listing } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../lib/currency';
import i18n from '../../lib/i18n';

interface ListingCardProps {
  listing: Listing;
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
    businesses,
  } = listing;
  const { t } = useTranslation();

  const formatTimeRemaining = (until: string) => {
    try {
      const now = new Date();
      const expiryDate = new Date(until);

      // If the listing has already expired
      if (expiryDate <= now) {
        return { text: t('components.listings.card.expired'), isExpired: true };
      }

      // Calculate time remaining with custom translation
      const timeRemaining = formatDistanceToNow(expiryDate, {
        addSuffix: false,
      });
      return { text: translateTimeRemaining(timeRemaining), isExpired: false };
    } catch {
      return { text: 'Invalid date', isExpired: false };
    }
  };

  const translateTimeRemaining = (timeString: string) => {
    // Handle special cases first
    if (timeString.includes('less than')) {
      const match = timeString.match(/less than (\d+)\s+(.+)/);
      if (match) {
        const count = parseInt(match[1]);
        const unit = match[2];
        const unitMap: Record<string, string> = {
          minute: 'less_than_x_minutes',
          minutes: 'less_than_x_minutes',
        };
        const translationKey = unitMap[unit];
        if (translationKey) {
          const params = getTimeParams(count, unit);
          return t(
            `components.listings.card.time_remaining.${translationKey}`,
            params,
          );
        }
      }
    }

    if (timeString.includes('about')) {
      const match = timeString.match(/about (\d+)\s+(.+)/);
      if (match) {
        const count = parseInt(match[1]);
        const unit = match[2];
        const unitMap: Record<string, string> = {
          hour: 'about_x_hours',
          hours: 'about_x_hours',
          month: 'about_x_months',
          months: 'about_x_months',
          year: 'about_x_years',
          years: 'about_x_years',
        };
        const translationKey = unitMap[unit];
        if (translationKey) {
          const params = getTimeParams(count, unit);
          return t(
            `components.listings.card.time_remaining.${translationKey}`,
            params,
          );
        }
      }
    }

    // Parse the time string and translate it
    const match = timeString.match(/(\d+)\s+(.+)/);
    if (!match) return timeString;

    const count = parseInt(match[1]);
    const unit = match[2];

    // Map English units to translation keys
    const unitMap: Record<string, string> = {
      minute: 'x_minutes',
      minutes: 'x_minutes',
      hour: 'x_hours',
      hours: 'x_hours',
      day: 'x_days',
      days: 'x_days',
      month: 'x_months',
      months: 'x_months',
      year: 'x_years',
      years: 'x_years',
    };

    const translationKey = unitMap[unit];
    if (translationKey) {
      const params = getTimeParams(count, unit);
      return t(
        `components.listings.card.time_remaining.${translationKey}`,
        params,
      );
    }

    return timeString;
  };

  const getTimeParams = (count: number, unit: string): Record<string, any> => {
    const params: Record<string, any> = { count };

    // Get current language
    const currentLang = i18n.language;

    if (currentLang === 'uk') {
      // Ukrainian grammatical cases for time units
      if (unit.includes('minute')) {
        if (count === 1) params.minutes = 'хвилина';
        else if (count >= 2 && count <= 4) params.minutes = 'хвилини';
        else params.minutes = 'хвилин';
      } else if (unit.includes('hour')) {
        if (count === 1) params.hours = 'година';
        else if (count >= 2 && count <= 4) params.hours = 'години';
        else params.hours = 'годин';
      } else if (unit.includes('day')) {
        if (count === 1) params.days = 'день';
        else if (count >= 2 && count <= 4) params.days = 'дні';
        else params.days = 'днів';
      } else if (unit.includes('month')) {
        if (count === 1) params.months = 'місяць';
        else if (count >= 2 && count <= 4) params.months = 'місяці';
        else params.months = 'місяців';
      } else if (unit.includes('year')) {
        if (count === 1) params.years = 'рік';
        else if (count >= 2 && count <= 4) params.years = 'роки';
        else params.years = 'років';
      }
    } else {
      // English time units
      if (unit.includes('minute')) {
        params.minutes = count === 1 ? 'minute' : 'minutes';
      } else if (unit.includes('hour')) {
        params.hours = count === 1 ? 'hour' : 'hours';
      } else if (unit.includes('day')) {
        params.days = count === 1 ? 'day' : 'days';
      } else if (unit.includes('month')) {
        params.months = count === 1 ? 'month' : 'months';
      } else if (unit.includes('year')) {
        params.years = count === 1 ? 'year' : 'years';
      }
    }

    return params;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Bakery: 'bg-orange-100 text-orange-800',
      'Fruits & Vegetables': 'bg-green-100 text-green-800',
      Dairy: 'bg-blue-100 text-blue-800',
      'Meat & Fish': 'bg-red-100 text-red-800',
      'Prepared Foods': 'bg-purple-100 text-purple-800',
      Desserts: 'bg-pink-100 text-pink-800',
      Beverages: 'bg-cyan-100 text-cyan-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['Other'];
  };

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
                {t('listing_detail.free')}
              </span>
            ) : (
              <span className="badge bg-white text-gray-900 font-semibold shadow-sm">
                {formatPrice(price, false)}
              </span>
            )}
          </div>

          {/* Quantity Badge */}
          {quantity > 1 && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-primary-600 text-white">
                {quantity} {t('listing_detail.available')}
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
          <p className="text-gray-600 text-sm line-clamp-2">{description}</p>

          {/* Business Info */}
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <MapPin size={14} />
              <span className="truncate">
                {businesses?.name ||
                  t('components.listings.card.unknown_business')}
              </span>
            </div>
            {businesses?.google_rating && (
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span>{businesses.google_rating}</span>
              </div>
            )}
          </div>

          {/* Time Remaining */}
          <div
            className={`flex items-center text-sm space-x-1 ${formatTimeRemaining(available_until).isExpired ? 'text-orange-600' : 'text-green-600'}`}
          >
            <Clock size={14} />
            <span>
              {!formatTimeRemaining(available_until).isExpired &&
                `${t('components.listings.card.available_until')} `}
              {formatTimeRemaining(available_until).text}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
