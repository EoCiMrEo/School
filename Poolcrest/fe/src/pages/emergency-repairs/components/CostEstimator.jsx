import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CostEstimator = () => {
  const [selectedService, setSelectedService] = useState('');
  const [poolSize, setPoolSize] = useState('');
  const [urgency, setUrgency] = useState('standard');
  const [estimate, setEstimate] = useState(null);

  const services = [
    {
      id: 'pump-repair',
      name: 'Pump Repair/Replacement',
      basePrice: 150,
      description: 'Motor issues, impeller problems, or complete replacement',
      timeRange: '2-4 hours'
    },
    {
      id: 'filter-cleaning',
      name: 'Filter System Repair',
      basePrice: 120,
      description: 'Cartridge, sand, or DE filter issues',
      timeRange: '1-3 hours'
    },
    {
      id: 'heater-repair',
      name: 'Heater Repair',
      basePrice: 200,
      description: 'Gas or electric heater troubleshooting and repair',
      timeRange: '2-5 hours'
    },
    {
      id: 'leak-detection',
      name: 'Leak Detection & Repair',
      basePrice: 180,
      description: 'Finding and fixing structural or equipment leaks',
      timeRange: '3-6 hours'
    },
    {
      id: 'chemical-balance',
      name: 'Emergency Chemical Balancing',
      basePrice: 80,
      description: 'Green water, algae treatment, pH correction',
      timeRange: '1-2 hours'
    },
    {
      id: 'equipment-electrical',
      name: 'Electrical Issues',
      basePrice: 250,
      description: 'GFCI problems, wiring issues, control panel repair',
      timeRange: '2-4 hours'
    }
  ];

  const poolSizes = [
    { id: 'small', name: 'Small (up to 15,000 gal)', multiplier: 0.8 },
    { id: 'medium', name: 'Medium (15,000-25,000 gal)', multiplier: 1.0 },
    { id: 'large', name: 'Large (25,000-40,000 gal)', multiplier: 1.3 },
    { id: 'xlarge', name: 'Extra Large (40,000+ gal)', multiplier: 1.6 }
  ];

  const urgencyLevels = [
    { id: 'standard', name: 'Standard Service', multiplier: 1.0, description: 'Next business day' },
    { id: 'priority', name: 'Priority Service', multiplier: 1.5, description: 'Same day service' },
    { id: 'emergency', name: 'Emergency Service', multiplier: 2.0, description: 'Within 2 hours' }
  ];

  const calculateEstimate = () => {
    if (!selectedService || !poolSize) return;

    const service = services.find(s => s.id === selectedService);
    const sizeMultiplier = poolSizes.find(s => s.id === poolSize)?.multiplier || 1;
    const urgencyMultiplier = urgencyLevels.find(u => u.id === urgency)?.multiplier || 1;

    const baseTotal = service.basePrice * sizeMultiplier * urgencyMultiplier;
    const serviceFee = urgency === 'emergency' ? 150 : urgency === 'priority' ? 75 : 50;
    const total = baseTotal + serviceFee;

    setEstimate({
      service: service.name,
      basePrice: service.basePrice,
      sizeAdjustment: (sizeMultiplier - 1) * service.basePrice,
      urgencyAdjustment: (urgencyMultiplier - 1) * service.basePrice * sizeMultiplier,
      serviceFee,
      total,
      timeRange: service.timeRange
    });
  };

  return (
    <div className="py-16 bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Emergency Repair Cost Estimator
          </h2>
          <p className="text-lg text-text-secondary">
            Get an instant estimate for your pool emergency repair. All prices include parts, labor, and service guarantee.
          </p>
        </div>

        <div className="card p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Selection */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-inter font-semibold text-text-primary mb-4 flex items-center">
                  <Icon name="Wrench" size={20} className="mr-2" />
                  Select Service Type
                </h3>
                
                <div className="space-y-3">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className={`block p-4 border rounded-lg cursor-pointer transition-smooth ${
                        selectedService === service.id
                          ? 'border-primary bg-primary-50' :'border-border hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={selectedService === service.id}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="sr-only"
                      />
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-inter font-medium text-text-primary">
                            {service.name}
                          </h4>
                          <p className="text-sm text-text-secondary mt-1">
                            {service.description}
                          </p>
                          <p className="text-xs text-text-secondary mt-1 flex items-center">
                            <Icon name="Clock" size={12} className="mr-1" />
                            {service.timeRange}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-inter font-semibold text-primary">
                            ${service.basePrice}+
                          </p>
                          <p className="text-xs text-text-secondary">
                            Starting at
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pool Size */}
              <div>
                <h3 className="text-xl font-inter font-semibold text-text-primary mb-4 flex items-center">
                  <Icon name="Waves" size={20} className="mr-2" />
                  Pool Size
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {poolSizes.map((size) => (
                    <label
                      key={size.id}
                      className={`block p-3 border rounded-lg cursor-pointer transition-smooth ${
                        poolSize === size.id
                          ? 'border-primary bg-primary-50' :'border-border hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="poolSize"
                        value={size.id}
                        checked={poolSize === size.id}
                        onChange={(e) => setPoolSize(e.target.value)}
                        className="sr-only"
                      />
                      
                      <div className="text-center">
                        <p className="font-inter font-medium text-text-primary">
                          {size.name}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {size.multiplier === 1 ? 'Standard pricing' : 
                           size.multiplier < 1 ? `${Math.round((1-size.multiplier)*100)}% discount` :
                           `${Math.round((size.multiplier-1)*100)}% additional`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Urgency Level */}
              <div>
                <h3 className="text-xl font-inter font-semibold text-text-primary mb-4 flex items-center">
                  <Icon name="Zap" size={20} className="mr-2" />
                  Service Urgency
                </h3>
                
                <div className="space-y-3">
                  {urgencyLevels.map((level) => (
                    <label
                      key={level.id}
                      className={`block p-3 border rounded-lg cursor-pointer transition-smooth ${
                        urgency === level.id
                          ? 'border-primary bg-primary-50' :'border-border hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level.id}
                        checked={urgency === level.id}
                        onChange={(e) => setUrgency(e.target.value)}
                        className="sr-only"
                      />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-inter font-medium text-text-primary">
                            {level.name}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {level.description}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            {level.multiplier === 1 ? 'Standard' : `${level.multiplier}x`}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                iconName="Calculator"
                iconPosition="left"
                fullWidth
                onClick={calculateEstimate}
                disabled={!selectedService || !poolSize}
                className="font-inter font-semibold"
              >
                Calculate Estimate
              </Button>
            </div>

            {/* Estimate Results */}
            <div className="space-y-6">
              {estimate ? (
                <div className="card-surface p-6">
                  <h3 className="text-xl font-inter font-semibold text-text-primary mb-6 flex items-center">
                    <Icon name="Receipt" size={20} className="mr-2" />
                    Your Estimate
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border-light">
                      <span className="text-text-secondary">Service</span>
                      <span className="font-medium text-text-primary">{estimate.service}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Base Price</span>
                      <span className="font-medium text-text-primary">${estimate.basePrice}</span>
                    </div>
                    
                    {estimate.sizeAdjustment !== 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Pool Size Adjustment</span>
                        <span className={`font-medium ${estimate.sizeAdjustment > 0 ? 'text-warning' : 'text-success'}`}>
                          {estimate.sizeAdjustment > 0 ? '+' : ''}${Math.round(estimate.sizeAdjustment)}
                        </span>
                      </div>
                    )}
                    
                    {estimate.urgencyAdjustment !== 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Urgency Adjustment</span>
                        <span className="font-medium text-warning">
                          +${Math.round(estimate.urgencyAdjustment)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Service Call Fee</span>
                      <span className="font-medium text-text-primary">${estimate.serviceFee}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-border text-lg">
                      <span className="font-inter font-semibold text-text-primary">Total Estimate</span>
                      <span className="font-inter font-bold text-primary text-xl">
                        ${Math.round(estimate.total)}
                      </span>
                    </div>
                    
                    <div className="bg-primary-50 p-4 rounded-lg mt-4">
                      <p className="text-sm text-primary-700 flex items-center">
                        <Icon name="Clock" size={16} className="mr-2" />
                        Estimated completion time: {estimate.timeRange}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      iconName="Phone"
                      iconPosition="left"
                      fullWidth
                      onClick={() => window.location.href = 'tel:+15559111POOL'}
                      className="font-inter font-semibold"
                    >
                      Call to Book This Service
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="lg"
                      iconName="Calendar"
                      iconPosition="left"
                      fullWidth
                      onClick={() => window.location.href = '/get-quote-book-service'}
                      className="font-inter font-semibold"
                    >
                      Schedule Online
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="card-surface p-6 text-center">
                  <Icon name="Calculator" size={48} className="text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-inter font-medium text-text-primary mb-2">
                    Ready to Calculate
                  </h3>
                  <p className="text-text-secondary">
                    Select your service type and pool size to get an instant estimate
                  </p>
                </div>
              )}
              
              {/* Pricing Notes */}
              <div className="card-surface p-6">
                <h4 className="font-inter font-semibold text-text-primary mb-4 flex items-center">
                  <Icon name="Info" size={18} className="mr-2" />
                  Pricing Notes
                </h4>
                
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start">
                    <Icon name="Check" size={14} className="text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>All estimates include parts, labor, and 90-day warranty</span>
                  </li>
                  <li className="flex items-start">
                    <Icon name="Check" size={14} className="text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>No hidden fees or surprise charges</span>
                  </li>
                  <li className="flex items-start">
                    <Icon name="Check" size={14} className="text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Written quote provided before work begins</span>
                  </li>
                  <li className="flex items-start">
                    <Icon name="Check" size={14} className="text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span>Flexible payment options available</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimator;