import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ServiceCard from './ServiceCard';

const ServiceCategory = ({ category, services, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getCategoryIcon = (categoryType) => {
    switch (categoryType) {
      case 'emergency':
        return 'AlertTriangle';
      case 'maintenance':
        return 'Wrench';
      case 'cleaning':
        return 'Droplets';
      case 'repair':
        return 'Settings';
      case 'renovation':
        return 'Hammer';
      case 'seasonal':
        return 'Calendar';
      default:
        return 'Pool';
    }
  };

  const getCategoryColor = (categoryType) => {
    switch (categoryType) {
      case 'emergency':
        return 'text-error bg-error-50 border-error-200';
      case 'maintenance':
        return 'text-primary bg-primary-50 border-primary-200';
      case 'cleaning':
        return 'text-secondary bg-secondary-50 border-secondary-200';
      case 'repair':
        return 'text-warning bg-warning-50 border-warning-200';
      case 'renovation':
        return 'text-accent bg-accent-50 border-accent-200';
      case 'seasonal':
        return 'text-success bg-success-50 border-success-200';
      default:
        return 'text-text-secondary bg-surface border-border';
    }
  };

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 card hover-lift transition-smooth"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl border ${getCategoryColor(category.type)}`}>
            <Icon name={getCategoryIcon(category.type)} size={24} />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-text-primary font-inter">{category.title}</h2>
            <p className="text-text-secondary">{category.description}</p>
            <span className="text-sm text-primary font-medium">
              {services.length} service{services.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {category.type === 'emergency' && (
            <span className="bg-error text-error-foreground px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              24/7
            </span>
          )}
          <Icon 
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
            size={20} 
            className="text-text-secondary transition-smooth"
          />
        </div>
      </button>

      <div className={`transition-all duration-300 ease-smooth ${
        isExpanded ? 'max-h-none opacity-100 mt-6' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              featured={service.isPopular}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceCategory;