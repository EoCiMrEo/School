import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const ServiceSelector = ({ selectedServices, onServiceChange }) => {
  const [activeCategory, setActiveCategory] = useState('maintenance');

  const serviceCategories = {
    maintenance: {
      title: "Pool Maintenance",
      icon: "Wrench",
      color: "text-primary",
      services: [
        {
          id: "weekly-cleaning",
          name: "Weekly Pool Cleaning",
          description: "Complete pool cleaning including skimming, vacuuming, and chemical balancing",
          price: 125,
          duration: "2-3 hours",
          frequency: "Weekly"
        },
        {
          id: "bi-weekly-cleaning",
          name: "Bi-Weekly Pool Cleaning",
          description: "Regular maintenance service every two weeks with full cleaning and chemical check",
          price: 95,
          duration: "2-3 hours",
          frequency: "Bi-weekly"
        },
        {
          id: "monthly-maintenance",
          name: "Monthly Deep Clean",
          description: "Comprehensive monthly service including equipment inspection and deep cleaning",
          price: 185,
          duration: "3-4 hours",
          frequency: "Monthly"
        }
      ]
    },
    repairs: {
      title: "Pool Repairs",
      icon: "Settings",
      color: "text-warning",
      services: [
        {
          id: "pump-repair",
          name: "Pool Pump Repair",
          description: "Diagnosis and repair of pool pump issues including motor and impeller problems",
          price: 275,
          duration: "2-4 hours",
          frequency: "One-time"
        },
        {
          id: "filter-replacement",
          name: "Filter System Service",
          description: "Filter cleaning, replacement, and system optimization for better water quality",
          price: 165,
          duration: "1-2 hours",
          frequency: "One-time"
        },
        {
          id: "heater-service",
          name: "Pool Heater Service",
          description: "Complete heater inspection, cleaning, and repair for optimal performance",
          price: 325,
          duration: "3-5 hours",
          frequency: "One-time"
        }
      ]
    },
    seasonal: {
      title: "Seasonal Services",
      icon: "Calendar",
      color: "text-accent",
      services: [
        {
          id: "pool-opening",
          name: "Spring Pool Opening",
          description: "Complete pool opening service including equipment startup and chemical balancing",
          price: 295,
          duration: "4-6 hours",
          frequency: "Seasonal"
        },
        {
          id: "pool-closing",
          name: "Winter Pool Closing",
          description: "Professional winterization service to protect your pool during cold months",
          price: 345,
          duration: "4-6 hours",
          frequency: "Seasonal"
        },
        {
          id: "equipment-winterization",
          name: "Equipment Winterization",
          description: "Specialized winterization for pumps, heaters, and filtration systems",
          price: 225,
          duration: "2-3 hours",
          frequency: "Seasonal"
        }
      ]
    },
    emergency: {
      title: "Emergency Services",
      icon: "AlertTriangle",
      color: "text-error",
      services: [
        {
          id: "green-pool-rescue",
          name: "Green Pool Recovery",
          description: "Emergency algae treatment and water restoration for severely neglected pools",
          price: 425,
          duration: "6-8 hours",
          frequency: "One-time"
        },
        {
          id: "equipment-failure",
          name: "Equipment Emergency Repair",
          description: "Same-day emergency repair service for critical pool equipment failures",
          price: 385,
          duration: "2-6 hours",
          frequency: "One-time"
        },
        {
          id: "leak-detection",
          name: "Pool Leak Detection",
          description: "Professional leak detection and emergency repair to prevent water loss",
          price: 295,
          duration: "3-5 hours",
          frequency: "One-time"
        }
      ]
    }
  };

  const handleServiceToggle = (serviceId, service) => {
    const isSelected = selectedServices.some(s => s.id === serviceId);
    if (isSelected) {
      onServiceChange(selectedServices.filter(s => s.id !== serviceId));
    } else {
      onServiceChange([...selectedServices, { ...service, id: serviceId }]);
    }
  };

  const isServiceSelected = (serviceId) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-xl font-inter font-semibold text-text-primary mb-2">
          Select Your Services
        </h3>
        <p className="text-text-secondary">
          Choose from our comprehensive range of pool services. You can select multiple services for a complete package.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border-light pb-4">
        {Object.entries(serviceCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-inter font-medium transition-smooth ${
              activeCategory === key
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-text-secondary hover:bg-surface hover:text-primary'
            }`}
          >
            <Icon 
              name={category.icon} 
              size={16} 
              className={activeCategory === key ? 'text-primary-foreground' : category.color}
            />
            <span className="text-sm">{category.title}</span>
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceCategories[activeCategory].services.map((service) => (
          <div
            key={service.id}
            className={`border rounded-lg p-4 transition-smooth cursor-pointer hover-lift ${
              isServiceSelected(service.id)
                ? 'border-primary bg-primary-50 shadow-md'
                : 'border-border hover:border-primary-300'
            }`}
            onClick={() => handleServiceToggle(service.id, service)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-inter font-semibold text-text-primary mb-1">
                  {service.name}
                </h4>
                <p className="text-sm text-text-secondary mb-2">
                  {service.description}
                </p>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ml-3 ${
                isServiceSelected(service.id)
                  ? 'bg-primary border-primary' :'border-border-dark'
              }`}>
                {isServiceSelected(service.id) && (
                  <Icon name="Check" size={12} color="white" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-text-secondary">
                  <Icon name="Clock" size={14} className="inline mr-1" />
                  {service.duration}
                </span>
                <span className="text-text-secondary">
                  <Icon name="Repeat" size={14} className="inline mr-1" />
                  {service.frequency}
                </span>
              </div>
              <div className="font-inter font-bold text-primary">
                ${service.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="mt-6 p-4 bg-surface rounded-lg border border-border-light">
          <h4 className="font-inter font-semibold text-text-primary mb-3">
            Selected Services ({selectedServices.length})
          </h4>
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between">
                <span className="text-sm text-text-primary">{service.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-primary">${service.price}</span>
                  <button
                    onClick={() => handleServiceToggle(service.id, service)}
                    className="text-error hover:bg-error-50 rounded p-1 transition-smooth"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border-light mt-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-inter font-semibold text-text-primary">Total Estimate:</span>
              <span className="font-inter font-bold text-lg text-primary">
                ${selectedServices.reduce((total, service) => total + service.price, 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;