import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PlanCard = ({ plan, isPopular = false, onSelectPlan }) => {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
      isPopular ? 'border-primary ring-4 ring-primary/20' : 'border-border hover:border-primary/50'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            Most Popular
          </div>
        </div>
      )}
      
      <div className="p-8">
        {/* Plan Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            plan.color === 'blue' ? 'bg-primary/10' : 
            plan.color === 'amber'? 'bg-accent/10' : 'bg-success/10'
          }`}>
            <Icon 
              name={plan.icon} 
              size={32} 
              className={
                plan.color === 'blue' ? 'text-primary' : 
                plan.color === 'amber'? 'text-accent' : 'text-success'
              }
            />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
          <p className="text-text-secondary">{plan.subtitle}</p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center mb-2">
            <span className="text-4xl font-bold text-text-primary">${plan.price}</span>
            <span className="text-text-secondary ml-2">/month</span>
          </div>
          <div className="text-sm text-text-secondary">
            {plan.visits} visits per month • ${plan.yearlyPrice}/year
          </div>
          {plan.savings && (
            <div className="text-sm text-success font-semibold mt-1">
              Save ${plan.savings}/year
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Icon 
                name="Check" 
                size={20} 
                className="text-success mt-0.5 flex-shrink-0"
              />
              <span className="text-text-primary text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          variant={isPopular ? "primary" : "outline"}
          fullWidth
          className="font-semibold"
          onClick={() => onSelectPlan(plan)}
        >
          Choose {plan.name}
        </Button>

        {/* Additional Info */}
        {plan.additionalInfo && (
          <div className="mt-4 text-center">
            <p className="text-xs text-text-secondary">{plan.additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCard;