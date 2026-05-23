import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuoteCalculator = ({ selectedServices, assessmentData, onQuoteUpdate }) => {
  const [quoteOptions, setQuoteOptions] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Base pricing factors
  const pricingFactors = {
    poolSize: {
      small: 1.0,
      medium: 1.2,
      large: 1.4,
      xlarge: 1.6
    },
    poolCondition: {
      'crystal-clear': 1.0,
      'slightly-cloudy': 1.1,
      'very-cloudy': 1.3,
      'green-algae': 1.5,
      'black-algae': 1.8
    },
    urgency: {
      emergency: 1.5,
      urgent: 1.2,
      soon: 1.0,
      flexible: 0.9
    },
    poolAge: {
      new: 1.0,
      recent: 1.0,
      established: 1.1,
      mature: 1.2,
      vintage: 1.3
    }
  };

  // Additional service costs
  const additionalCosts = {
    travelFee: 25,
    equipmentInspection: 45,
    chemicalTesting: 15,
    emergencyFee: 75,
    weekendSurcharge: 35
  };

  useEffect(() => {
    if (selectedServices.length > 0) {
      calculateQuoteOptions();
    }
  }, [selectedServices, assessmentData]);

  const calculateQuoteOptions = () => {
    const baseTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
    
    // Apply pricing factors
    const sizeMultiplier = pricingFactors.poolSize[assessmentData.poolSize] || 1.0;
    const conditionMultiplier = pricingFactors.poolCondition[assessmentData.waterCondition] || 1.0;
    const urgencyMultiplier = pricingFactors.urgency[assessmentData.serviceUrgency] || 1.0;
    const ageMultiplier = pricingFactors.poolAge[assessmentData.poolAge] || 1.0;

    const adjustedTotal = baseTotal * sizeMultiplier * conditionMultiplier * ageMultiplier;

    // Calculate different quote options
    const options = [
      {
        id: 'basic',
        name: 'Basic Service',
        description: 'Essential service with standard materials and basic warranty',
        basePrice: adjustedTotal,
        discount: 0,
        warranty: '30 days',
        features: [
          'Professional service completion',
          'Basic equipment check',
          '30-day service warranty',
          'Standard materials included'
        ],
        timeline: '1-2 business days'
      },
      {
        id: 'premium',
        name: 'Premium Service',
        description: 'Enhanced service with premium materials and extended warranty',
        basePrice: adjustedTotal * 1.25,
        discount: 0.1,
        warranty: '90 days',
        features: [
          'Premium materials and chemicals',
          'Comprehensive equipment inspection',
          '90-day service warranty',
          'Follow-up maintenance check',
          'Priority customer support'
        ],
        timeline: 'Same or next day',
        popular: true
      },
      {
        id: 'comprehensive',
        name: 'Comprehensive Care',
        description: 'Complete service package with ongoing maintenance plan',
        basePrice: adjustedTotal * 1.5,
        discount: 0.15,
        warranty: '6 months',
        features: [
          'Premium service completion',
          'Complete equipment overhaul',
          '6-month service warranty',
          '3 months of maintenance included',
          'Emergency service priority',
          'Seasonal preparation included'
        ],
        timeline: 'Same day available'
      }
    ];

    // Add additional costs based on assessment
    const finalOptions = options.map(option => {
      let additionalFees = 0;
      const feeBreakdown = [];

      // Travel fee for certain areas
      if (assessmentData.accessConcerns?.includes('narrow-access')) {
        additionalFees += additionalCosts.travelFee;
        feeBreakdown.push({ name: 'Access Fee', amount: additionalCosts.travelFee });
      }

      // Emergency fee
      if (assessmentData.serviceUrgency === 'emergency') {
        additionalFees += additionalCosts.emergencyFee;
        feeBreakdown.push({ name: 'Emergency Service Fee', amount: additionalCosts.emergencyFee });
      }

      // Equipment inspection for older pools
      if (['mature', 'vintage'].includes(assessmentData.poolAge)) {
        additionalFees += additionalCosts.equipmentInspection;
        feeBreakdown.push({ name: 'Equipment Inspection', amount: additionalCosts.equipmentInspection });
      }

      const discountAmount = option.basePrice * option.discount;
      const subtotal = option.basePrice - discountAmount + additionalFees;
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;

      return {
        ...option,
        additionalFees,
        feeBreakdown,
        discountAmount,
        subtotal,
        tax,
        total: Math.round(total)
      };
    });

    setQuoteOptions(finalOptions);
    onQuoteUpdate(finalOptions);
  };

  const handleQuoteSelect = (quote) => {
    setSelectedQuote(quote);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (selectedServices.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-border p-6">
        <div className="text-center py-8">
          <Icon name="Calculator" size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-inter font-semibold text-text-primary mb-2">
            Quote Calculator
          </h3>
          <p className="text-text-secondary">
            Select services and complete the pool assessment to see your personalized quote options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-xl font-inter font-semibold text-text-primary mb-2">
          Your Quote Options
        </h3>
        <p className="text-text-secondary">
          Choose the service level that best fits your needs and budget. All quotes include our satisfaction guarantee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {quoteOptions.map((quote) => (
          <div
            key={quote.id}
            className={`relative border rounded-xl p-6 cursor-pointer transition-smooth hover-lift ${
              selectedQuote?.id === quote.id
                ? 'border-primary bg-primary-50 shadow-lg'
                : 'border-border hover:border-primary-300'
            } ${quote.popular ? 'ring-2 ring-accent' : ''}`}
            onClick={() => handleQuoteSelect(quote)}
          >
            {quote.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-4">
              <h4 className="text-lg font-inter font-semibold text-text-primary mb-2">
                {quote.name}
              </h4>
              <p className="text-sm text-text-secondary mb-4">
                {quote.description}
              </p>
              
              <div className="mb-4">
                {quote.discount > 0 && (
                  <div className="text-sm text-text-secondary line-through mb-1">
                    {formatCurrency(quote.basePrice + quote.additionalFees)}
                  </div>
                )}
                <div className="text-3xl font-inter font-bold text-primary">
                  {formatCurrency(quote.total)}
                </div>
                {quote.discount > 0 && (
                  <div className="text-sm text-success font-medium">
                    Save {formatCurrency(quote.discountAmount)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {quote.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-text-primary">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border-light pt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-secondary">Warranty:</span>
                <span className="font-medium text-text-primary">{quote.warranty}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Timeline:</span>
                <span className="font-medium text-text-primary">{quote.timeline}</span>
              </div>
            </div>

            {selectedQuote?.id === quote.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={14} color="white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedQuote && (
        <div className="border-t border-border-light pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-inter font-semibold text-text-primary">
              Quote Breakdown
            </h4>
            <Button
              variant="ghost"
              size="sm"
              iconName={showBreakdown ? "ChevronUp" : "ChevronDown"}
              iconPosition="right"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              {showBreakdown ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          {showBreakdown && (
            <div className="bg-surface rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Base Services:</span>
                <span className="font-medium">{formatCurrency(selectedQuote.basePrice)}</span>
              </div>
              
              {selectedQuote.feeBreakdown.map((fee, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-text-secondary">{fee.name}:</span>
                  <span className="font-medium">{formatCurrency(fee.amount)}</span>
                </div>
              ))}
              
              {selectedQuote.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({(selectedQuote.discount * 100).toFixed(0)}%):</span>
                  <span className="font-medium">-{formatCurrency(selectedQuote.discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t border-border-light pt-2">
                <span className="text-text-secondary">Subtotal:</span>
                <span className="font-medium">{formatCurrency(selectedQuote.subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax (8%):</span>
                <span className="font-medium">{formatCurrency(selectedQuote.tax)}</span>
              </div>
              
              <div className="flex justify-between border-t border-border-light pt-2 text-lg font-semibold">
                <span className="text-text-primary">Total:</span>
                <span className="text-primary">{formatCurrency(selectedQuote.total)}</span>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Shield" size={20} className="text-success mt-0.5" />
              <div>
                <h5 className="font-inter font-semibold text-success-800 mb-1">
                  100% Satisfaction Guarantee
                </h5>
                <p className="text-sm text-success-700">
                  We stand behind our work with a {selectedQuote.warranty} warranty and our commitment to your complete satisfaction. If you're not happy, we'll make it right.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteCalculator;