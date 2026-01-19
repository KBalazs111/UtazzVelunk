import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { TravelPackage } from '../../types';
import { Card, Badge, Button } from '../ui';
import { 
  formatCurrency, 
  formatDate, 
  getCategoryLabel, 
  calculateDiscount,
  formatDuration 
} from '../../utils/helpers';

interface PackageCardProps {
  package: TravelPackage;
  variant?: 'default' | 'compact' | 'horizontal';
}

const PackageCard: React.FC<PackageCardProps> = ({ 
  package: pkg, 
  variant = 'default' 
}) => {
  const discount = calculateDiscount(pkg.originalPrice || 0, pkg.price);

  if (variant === 'compact') {
    return (
      <Link to={`/packages/${pkg.slug}`}>
        <Card hover className="group">
          <div className="relative h-40 overflow-hidden">
            <img
              src={pkg.coverImage}
              alt={pkg.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {discount > 0 && (
              <div className="absolute top-3 left-3">
                <Badge variant="danger">-{discount}%</Badge>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {pkg.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              {pkg.destination}, {pkg.country}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="font-bold text-primary-600">
                {formatCurrency(pkg.price)}
              </span>
              <span className="text-sm text-gray-500">{pkg.duration} nap</span>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/packages/${pkg.slug}`}>
        <Card hover className="group flex flex-col md:flex-row">
          <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden flex-shrink-0">
            <img
              src={pkg.coverImage}
              alt={pkg.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {discount > 0 && (
              <div className="absolute top-3 left-3">
                <Badge variant="danger">-{discount}%</Badge>
              </div>
            )}
          </div>
          <div className="p-6 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">{getCategoryLabel(pkg.category)}</Badge>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{pkg.rating}</span>
                </div>
              </div>
              <h3 className="text-xl font-display font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {pkg.title}
              </h3>
              <p className="text-gray-600 mt-2 line-clamp-2">{pkg.shortDescription}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {pkg.destination}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(pkg.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Max {pkg.maxGroupSize} fő
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div>
                {pkg.originalPrice && (
                  <span className="text-sm text-gray-400 line-through mr-2">
                    {formatCurrency(pkg.originalPrice)}
                  </span>
                )}
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(pkg.price)}
                </span>
                <span className="text-gray-500 text-sm"> / fő</span>
              </div>
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Részletek
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/packages/${pkg.slug}`}>
      <Card hover className="group h-full flex flex-col">
        <div className="relative h-56 overflow-hidden">
          <img
            src={pkg.coverImage}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {discount > 0 && (
              <Badge variant="danger">-{discount}%</Badge>
            )}
            {pkg.isFeatured && (
              <Badge variant="warning">Kiemelt</Badge>
            )}
          </div>
          
          {/* Rating */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 flex items-center gap-1 shadow-sm">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span className="text-sm font-bold text-gray-800">{pkg.rating}</span>
          </div>
          
          {/* Location */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-medium">{pkg.destination}, {pkg.country}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" size="sm">
              {getCategoryLabel(pkg.category)}
            </Badge>
          </div>
          
          <h3 className="text-lg font-display font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
            {pkg.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
            {pkg.shortDescription}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {pkg.duration} nap
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Max {pkg.maxGroupSize}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {pkg.originalPrice && (
                <span className="text-sm text-gray-400 line-through block">
                  {formatCurrency(pkg.originalPrice)}
                </span>
              )}
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(pkg.price)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Indulás: {formatDate(pkg.departureDate, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PackageCard;
