import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServiceFilters = ({ onFilterChange, activeFilters }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterCategories = [
    {
      id: 'urgency',
      label: 'Service Urgency',
      options: [
        { value: 'emergency', label: 'Emergency (24/7)', icon: 'AlertTriangle', color: 'text-error' },
        { value: 'seasonal', label: 'Seasonal', icon: 'Calendar', color: 'text-warning' },
        { value: 'routine', label: 'Routine', icon: 'Clock', color: 'text-success' }
      ]
    },
    {
      id: 'category',
      label: 'Service Type',
      options: [
        { value: 'maintenance', label: 'Maintenance', icon: 'Wrench', color: 'text-primary' },
        { value: 'cleaning', label: 'Cleaning', icon: 'Droplets', color: 'text-secondary' },
        { value: 'repair', label: 'Repair', icon: 'Settings', color: 'text-warning' },
        { value: 'renovation', label: 'Renovation', icon: 'Hammer', color: 'text-accent' }
      ]
    },
    {
      id: 'priceRange',
      label: 'Price Range',
      options: [
        { value: 'budget', label: 'Under $200', icon: 'DollarSign', color: 'text-success' },
        { value: 'standard', label: '$200 - $500', icon: 'DollarSign', color: 'text-primary' },
        { value: 'premium', label: '$500 - $1000', icon: 'DollarSign', color: 'text-warning' },
        { value: 'luxury', label: '$1000+', icon: 'DollarSign', color: 'text-accent' }
      ]
    },
    {
      id: 'duration',
      label: 'Service Duration',
      options: [
        { value: 'quick', label: 'Same Day', icon: 'Zap', color: 'text-error' },
        { value: 'standard', label: '1-3 Days', icon: 'Clock', color: 'text-primary' },
        { value: 'extended', label: '1 Week+', icon: 'Calendar', color: 'text-warning' }
      ]
    }
  ];

  const handleFilterToggle = (category, value) => {
    const currentFilters = activeFilters[category] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(f => f !== value)
      : [...currentFilters, value];
    
    onFilterChange(category, newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange('clear', null);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((count, filters) => count + filters.length, 0);
  };

  return (
    <div className="card p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Icon name="Filter" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary font-inter">Filter Services</h3>
            <p className="text-sm text-text-secondary">
              Find the perfect service for your needs
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getActiveFilterCount() > 0 && (
            <Button
              variant="outline"
              size="sm"
              iconName="X"
              iconPosition="left"
              onClick={clearAllFilters}
            >
              Clear All ({getActiveFilterCount()})
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            iconName={isFilterOpen ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden"
          >
            Filters
          </Button>
        </div>
      </div>

      <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filterCategories.map((category) => (
            <div key={category.id}>
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                {category.label}
              </h4>
              <div className="space-y-2">
                {category.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterToggle(category.id, option.value)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-smooth text-left ${
                      activeFilters[category.id]?.includes(option.value)
                        ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-300 hover:bg-surface'
                    }`}
                  >
                    <Icon 
                      name={option.icon} 
                      size={16} 
                      className={activeFilters[category.id]?.includes(option.value) 
                        ? 'text-primary' 
                        : option.color
                      } 
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                    {activeFilters[category.id]?.includes(option.value) && (
                      <Icon name="Check" size={14} className="text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Filter Chips */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold text-text-primary mb-3">Quick Filters</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Emergency Only', filters: { urgency: ['emergency'] } },
              { label: 'Budget Friendly', filters: { priceRange: ['budget'] } },
              { label: 'Same Day Service', filters: { duration: ['quick'] } },
              { label: 'Maintenance Plans', filters: { category: ['maintenance'] } },
              { label: 'Cleaning Services', filters: { category: ['cleaning'] } }
            ].map((quickFilter, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  Object.entries(quickFilter.filters).forEach(([category, values]) => {
                    onFilterChange(category, values);
                  });
                }}
                className="text-xs"
              >
                {quickFilter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFilters;