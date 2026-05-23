import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ROICalculator = () => {
  const [poolSize, setPoolSize] = useState('medium');
  const [usage, setUsage] = useState('regular');
  const [currentSpending, setCurrentSpending] = useState(0);

  const poolSizes = {
    small: { label: 'Small (< 15,000 gal)', multiplier: 0.8 },
    medium: { label: 'Medium (15,000-25,000 gal)', multiplier: 1.0 },
    large: { label: 'Large (> 25,000 gal)', multiplier: 1.3 }
  };

  const usagePatterns = {
    light: { label: 'Light Use (Occasional)', multiplier: 0.9 },
    regular: { label: 'Regular Use (Weekly)', multiplier: 1.0 },
    heavy: { label: 'Heavy Use (Daily)', multiplier: 1.2 }
  };

  const calculateSavings = () => {
    const baseAnnualCost = 2400; // Base annual individual service cost
    const sizeMultiplier = poolSizes[poolSize].multiplier;
    const usageMultiplier = usagePatterns[usage].multiplier;
    
    const individualServiceCost = baseAnnualCost * sizeMultiplier * usageMultiplier;
    const planCost = 1800; // Family Protection plan annual cost
    const equipmentSavings = 800; // Preventive maintenance equipment savings
    
    const totalSavings = individualServiceCost - planCost + equipmentSavings;
    const monthlyIndividual = individualServiceCost / 12;
    const monthlyPlan = planCost / 12;
    
    return {
      individualServiceCost,
      planCost,
      totalSavings,
      monthlyIndividual,
      monthlyPlan,
      equipmentSavings
    };
  };

  const savings = calculateSavings();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-text-primary mb-2">ROI Calculator</h3>
        <p className="text-text-secondary">See how much you can save with a maintenance plan</p>
      </div>

      {/* Input Controls */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">Pool Size</label>
          <div className="space-y-2">
            {Object.entries(poolSizes).map(([key, size]) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="poolSize"
                  value={key}
                  checked={poolSize === key}
                  onChange={(e) => setPoolSize(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-text-primary">{size.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-3">Usage Pattern</label>
          <div className="space-y-2">
            {Object.entries(usagePatterns).map(([key, pattern]) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="usage"
                  value={key}
                  checked={usage === key}
                  onChange={(e) => setUsage(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-text-primary">{pattern.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-surface rounded-xl p-6 mb-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Your Savings Breakdown</h4>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-white rounded-lg border border-border">
            <div className="text-2xl font-bold text-error mb-1">
              ${Math.round(savings.monthlyIndividual)}
            </div>
            <div className="text-sm text-text-secondary">Individual Services/Month</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-border">
            <div className="text-2xl font-bold text-primary mb-1">
              ${Math.round(savings.monthlyPlan)}
            </div>
            <div className="text-sm text-text-secondary">Maintenance Plan/Month</div>
          </div>
          
          <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="text-2xl font-bold text-success mb-1">
              ${Math.round(savings.totalSavings)}
            </div>
            <div className="text-sm text-success">Annual Savings</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-text-secondary">Individual Service Cost (Annual)</span>
            <span className="font-semibold text-text-primary">${Math.round(savings.individualServiceCost)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-text-secondary">Maintenance Plan Cost (Annual)</span>
            <span className="font-semibold text-primary">${Math.round(savings.planCost)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-text-secondary">Equipment Protection Savings</span>
            <span className="font-semibold text-success">+${savings.equipmentSavings}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-success/10 rounded-lg px-4">
            <span className="font-semibold text-text-primary">Total Annual Savings</span>
            <span className="text-xl font-bold text-success">${Math.round(savings.totalSavings)}</span>
          </div>
        </div>
      </div>

      {/* Additional Benefits */}
      <div className="bg-primary/5 rounded-lg p-4 mb-6">
        <h5 className="font-semibold text-text-primary mb-3">Additional Value Beyond Savings</h5>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={16} className="text-primary" />
            <span className="text-sm text-text-primary">Equipment warranty protection</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-primary" />
            <span className="text-sm text-text-primary">Priority emergency service</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={16} className="text-primary" />
            <span className="text-sm text-text-primary">Family safety inspections</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Phone" size={16} className="text-primary" />
            <span className="text-sm text-text-primary">24/7 expert support</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button variant="primary" size="lg" iconName="Calculator" iconPosition="left">
          Get Personalized Quote
        </Button>
      </div>
    </div>
  );
};

export default ROICalculator;