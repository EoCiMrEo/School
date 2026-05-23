import React from 'react';
import Icon from '../../../components/AppIcon';

const PlanComparison = () => {
  const features = [
    {
      category: "Basic Services",
      items: [
        { name: "Weekly Pool Cleaning", essential: true, family: true, lifestyle: true },
        { name: "Chemical Testing & Balancing", essential: true, family: true, lifestyle: true },
        { name: "Skimmer & Basket Cleaning", essential: true, family: true, lifestyle: true },
        { name: "Brushing Walls & Steps", essential: true, family: true, lifestyle: true },
        { name: "Vacuuming Pool Floor", essential: false, family: true, lifestyle: true },
        { name: "Water Level Maintenance", essential: false, family: true, lifestyle: true }
      ]
    },
    {
      category: "Equipment & Safety",
      items: [
        { name: "Equipment Visual Inspection", essential: true, family: true, lifestyle: true },
        { name: "Filter Cleaning (Monthly)", essential: false, family: true, lifestyle: true },
        { name: "Equipment Performance Testing", essential: false, family: true, lifestyle: true },
        { name: "Child Safety Inspections", essential: false, family: true, lifestyle: true },
        { name: "Pool Cover Inspection", essential: false, family: false, lifestyle: true },
        { name: "Deck Safety Assessment", essential: false, family: false, lifestyle: true }
      ]
    },
    {
      category: "Support & Maintenance",
      items: [
        { name: "Basic Phone Support", essential: true, family: true, lifestyle: true },
        { name: "Service Reports & Photos", essential: false, family: true, lifestyle: true },
        { name: "Customer Portal Access", essential: false, family: true, lifestyle: true },
        { name: "Priority Emergency Service", essential: false, family: false, lifestyle: true },
        { name: "24/7 Expert Hotline", essential: false, family: false, lifestyle: true },
        { name: "Seasonal Transition Service", essential: false, family: false, lifestyle: true }
      ]
    },
    {
      category: "Additional Benefits",
      items: [
        { name: "10% Discount on Repairs", essential: true, family: true, lifestyle: true },
        { name: "Free Chemical Delivery", essential: false, family: true, lifestyle: true },
        { name: "Equipment Warranty Extension", essential: false, family: false, lifestyle: true },
        { name: "Complimentary Pool Parties Setup", essential: false, family: false, lifestyle: true },
        { name: "Annual Pool Equipment Tune-up", essential: false, family: false, lifestyle: true },
        { name: "Concierge Pool Services", essential: false, family: false, lifestyle: true }
      ]
    }
  ];

  const plans = [
    {
      name: "Essential Care",
      price: "$89",
      visits: "2",
      color: "blue",
      description: "Perfect for basic pool maintenance"
    },
    {
      name: "Family Protection",
      price: "$149",
      visits: "4",
      color: "amber",
      description: "Complete care with safety focus",
      popular: true
    },
    {
      name: "Lifestyle Premium",
      price: "$229",
      visits: "4+",
      color: "success",
      description: "Ultimate pool luxury experience"
    }
  ];

  const getFeatureIcon = (essential, family, lifestyle) => {
    if (essential && family && lifestyle) return "Check";
    if (!essential && family && lifestyle) return "Check";
    if (!essential && !family && lifestyle) return "Check";
    return "X";
  };

  const getFeatureColor = (essential, family, lifestyle, planType) => {
    if (planType === 'essential') return essential ? "text-success" : "text-text-muted";
    if (planType === 'family') return (essential || family) ? "text-success" : "text-text-muted";
    if (planType === 'lifestyle') return "text-success";
    return "text-text-muted";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
      <div className="bg-surface p-6 border-b border-border">
        <h3 className="text-2xl font-bold text-text-primary text-center mb-2">
          Compare Maintenance Plans
        </h3>
        <p className="text-text-secondary text-center">
          Choose the perfect level of care for your pool and family
        </p>
      </div>

      {/* Mobile-friendly comparison */}
      <div className="lg:hidden">
        {plans.map((plan, planIndex) => (
          <div key={plan.name} className="border-b border-border last:border-b-0">
            <div className={`p-4 ${plan.popular ? 'bg-primary/5' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-text-primary">{plan.name}</h4>
                  <p className="text-sm text-text-secondary">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-text-primary">{plan.price}</div>
                  <div className="text-sm text-text-secondary">/month</div>
                </div>
              </div>
              
              {features.map((category) => (
                <div key={category.category} className="mb-4">
                  <h5 className="font-semibold text-text-primary mb-2">{category.category}</h5>
                  <div className="space-y-2">
                    {category.items.map((item) => {
                      const hasFeature = planIndex === 0 ? item.essential : 
                                        planIndex === 1 ? (item.essential || item.family) : 
                                        true;
                      return (
                        <div key={item.name} className="flex items-center space-x-2">
                          <Icon 
                            name={hasFeature ? "Check" : "X"} 
                            size={16} 
                            className={hasFeature ? "text-success" : "text-text-muted"}
                          />
                          <span className={`text-sm ${hasFeature ? "text-text-primary" : "text-text-muted"}`}>
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop comparison table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-6 font-semibold text-text-primary">Features</th>
              {plans.map((plan) => (
                <th key={plan.name} className={`text-center p-6 ${plan.popular ? 'bg-primary/5' : ''}`}>
                  <div className="space-y-2">
                    <div className="font-bold text-text-primary">{plan.name}</div>
                    <div className="text-2xl font-bold text-text-primary">{plan.price}</div>
                    <div className="text-sm text-text-secondary">/month</div>
                    <div className="text-xs text-text-secondary">{plan.visits} visits</div>
                    {plan.popular && (
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((category) => (
              <React.Fragment key={category.category}>
                <tr className="bg-surface">
                  <td colSpan={4} className="p-4 font-semibold text-text-primary border-b border-border">
                    {category.category}
                  </td>
                </tr>
                {category.items.map((item) => (
                  <tr key={item.name} className="border-b border-border hover:bg-surface/50">
                    <td className="p-4 text-text-primary">{item.name}</td>
                    <td className="p-4 text-center">
                      <Icon 
                        name={item.essential ? "Check" : "X"} 
                        size={20} 
                        className={item.essential ? "text-success mx-auto" : "text-text-muted mx-auto"}
                      />
                    </td>
                    <td className={`p-4 text-center ${plans[1].popular ? 'bg-primary/5' : ''}`}>
                      <Icon 
                        name={(item.essential || item.family) ? "Check" : "X"} 
                        size={20} 
                        className={(item.essential || item.family) ? "text-success mx-auto" : "text-text-muted mx-auto"}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Icon 
                        name="Check" 
                        size={20} 
                        className="text-success mx-auto"
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom CTA */}
      <div className="bg-surface p-6 border-t border-border">
        <div className="text-center">
          <p className="text-text-secondary mb-4">
            All plans include our satisfaction guarantee and can be customized to your specific needs
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
            <Icon name="Shield" size={16} className="text-success" />
            <span>Fully Insured & Licensed</span>
            <span className="mx-2">•</span>
            <Icon name="Phone" size={16} className="text-primary" />
            <span>24/7 Emergency Support</span>
            <span className="mx-2">•</span>
            <Icon name="Users" size={16} className="text-accent" />
            <span>Family Safety Focused</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComparison;