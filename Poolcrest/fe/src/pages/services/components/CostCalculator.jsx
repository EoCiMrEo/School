import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const CostCalculator = () => {
  const [calculatorData, setCalculatorData] = useState({
    poolSize: '',
    serviceType: '',
    frequency: '',
    additionalServices: []
  });
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const poolSizes = [
    { value: 'small', label: 'Small (up to 15,000 gal)', multiplier: 1 },
    { value: 'medium', label: 'Medium (15,000-25,000 gal)', multiplier: 1.3 },
    { value: 'large', label: 'Large (25,000-40,000 gal)', multiplier: 1.6 },
    { value: 'xlarge', label: 'Extra Large (40,000+ gal)', multiplier: 2 }
  ];

  const serviceTypes = [
    { value: 'basic', label: 'Basic Cleaning', basePrice: 120 },
    { value: 'maintenance', label: 'Full Maintenance', basePrice: 180 },
    { value: 'premium', label: 'Premium Care', basePrice: 250 },
    { value: 'seasonal', label: 'Seasonal Service', basePrice: 350 }
  ];

  const frequencies = [
    { value: 'weekly', label: 'Weekly', multiplier: 4 },
    { value: 'biweekly', label: 'Bi-weekly', multiplier: 2 },
    { value: 'monthly', label: 'Monthly', multiplier: 1 },
    { value: 'seasonal', label: 'Seasonal', multiplier: 0.25 }
  ];

  const additionalServices = [
    { id: 'chemical', label: 'Chemical Balancing', price: 45 },
    { id: 'equipment', label: 'Equipment Check', price: 35 },
    { id: 'filter', label: 'Filter Cleaning', price: 25 },
    { id: 'vacuum', label: 'Deep Vacuum', price: 40 },
    { id: 'brush', label: 'Wall Brushing', price: 30 },
    { id: 'skimmer', label: 'Skimmer Service', price: 20 }
  ];

  const handleInputChange = (field, value) => {
    setCalculatorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdditionalServiceToggle = (serviceId) => {
    setCalculatorData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(serviceId)
        ? prev.additionalServices.filter(id => id !== serviceId)
        : [...prev.additionalServices, serviceId]
    }));
  };

  const calculateCost = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const poolSize = poolSizes.find(p => p.value === calculatorData.poolSize);
      const serviceType = serviceTypes.find(s => s.value === calculatorData.serviceType);
      const frequency = frequencies.find(f => f.value === calculatorData.frequency);
      
      if (!poolSize || !serviceType || !frequency) {
        setIsCalculating(false);
        return;
      }

      let baseCost = serviceType.basePrice * poolSize.multiplier;
      let monthlyCost = baseCost * frequency.multiplier;
      
      const additionalCost = calculatorData.additionalServices.reduce((total, serviceId) => {
        const service = additionalServices.find(s => s.id === serviceId);
        return total + (service ? service.price * frequency.multiplier : 0);
      }, 0);

      monthlyCost += additionalCost;

      setEstimatedCost({
        monthly: Math.round(monthlyCost),
        annual: Math.round(monthlyCost * 12 * 0.9), // 10% annual discount
        perService: Math.round(baseCost + (additionalCost / frequency.multiplier))
      });
      
      setIsCalculating(false);
    }, 1500);
  };

  const resetCalculator = () => {
    setCalculatorData({
      poolSize: '',
      serviceType: '',
      frequency: '',
      additionalServices: []
    });
    setEstimatedCost(null);
  };

  return (
    <div className="card p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-primary-50 rounded-xl">
          <Icon name="Calculator" size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-text-primary font-inter">Cost Calculator</h3>
          <p className="text-text-secondary">Get an instant estimate for your pool service needs</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Pool Size Selection */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">Pool Size</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {poolSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleInputChange('poolSize', size.value)}
                className={`p-4 rounded-lg border-2 text-left transition-smooth ${
                  calculatorData.poolSize === size.value
                    ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-300'
                }`}
              >
                <div className="font-medium">{size.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Service Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">Service Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceTypes.map((service) => (
              <button
                key={service.value}
                onClick={() => handleInputChange('serviceType', service.value)}
                className={`p-4 rounded-lg border-2 text-left transition-smooth ${
                  calculatorData.serviceType === service.value
                    ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-300'
                }`}
              >
                <div className="font-medium">{service.label}</div>
                <div className="text-sm text-text-secondary">Starting at ${service.basePrice}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">Service Frequency</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {frequencies.map((freq) => (
              <button
                key={freq.value}
                onClick={() => handleInputChange('frequency', freq.value)}
                className={`p-3 rounded-lg border-2 text-center transition-smooth ${
                  calculatorData.frequency === freq.value
                    ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-300'
                }`}
              >
                <div className="font-medium text-sm">{freq.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">Additional Services</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {additionalServices.map((service) => (
              <button
                key={service.id}
                onClick={() => handleAdditionalServiceToggle(service.id)}
                className={`p-3 rounded-lg border-2 text-left transition-smooth ${
                  calculatorData.additionalServices.includes(service.id)
                    ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{service.label}</span>
                  <span className="text-xs">+${service.price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            iconName="Calculator"
            iconPosition="left"
            onClick={calculateCost}
            loading={isCalculating}
            disabled={!calculatorData.poolSize || !calculatorData.serviceType || !calculatorData.frequency}
            className="flex-1"
          >
            Calculate Cost
          </Button>
          
          <Button
            variant="outline"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={resetCalculator}
            className="flex-1 sm:flex-none"
          >
            Reset
          </Button>
        </div>

        {/* Results */}
        {estimatedCost && (
          <div className="mt-6 p-6 bg-success-50 border border-success-200 rounded-lg">
            <h4 className="text-lg font-semibold text-success-800 mb-4 flex items-center">
              <Icon name="CheckCircle" size={20} className="mr-2" />
              Your Estimated Costs
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success-700">${estimatedCost.perService}</div>
                <div className="text-sm text-success-600">Per Service</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-700">${estimatedCost.monthly}</div>
                <div className="text-sm text-success-600">Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-700">${estimatedCost.annual}</div>
                <div className="text-sm text-success-600">Annual (10% savings)</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button
                variant="success"
                iconName="Calendar"
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                Book This Service
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostCalculator;