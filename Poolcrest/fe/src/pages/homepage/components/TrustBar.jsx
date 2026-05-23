import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustBar = () => {
  const trustItems = [
    {
      icon: "Shield",
      title: "Licensed & Insured",
      description: "Fully licensed pool service contractor with comprehensive liability insurance coverage"
    },
    {
      icon: "Award",
      title: "BBB A+ Rating",
      description: "Better Business Bureau accredited with A+ rating and zero unresolved complaints"
    },
    {
      icon: "Clock",
      title: "15+ Years Experience",
      description: "Over 15 years serving local families with professional pool care and maintenance"
    },
    {
      icon: "Users",
      title: "2,500+ Happy Families",
      description: "Trusted by thousands of local homeowners for reliable pool service and repairs"
    },
    {
      icon: "Phone",
      title: "24/7 Emergency Service",
      description: "Round-the-clock emergency response for urgent pool equipment failures and issues"
    },
    {
      icon: "CheckCircle",
      title: "100% Satisfaction Guarantee",
      description: "We stand behind our work with a complete satisfaction guarantee on all services"
    }
  ];

  return (
    <section className="py-12 bg-white border-y border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-inter font-bold text-text-primary mb-4">
            Why Families Trust Poolcrest Pro
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Your pool is where your family creates memories. We're committed to keeping it safe, clean, and always ready for life's best moments.
          </p>
        </div>

        {/* Trust Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-4 group">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg transition-smooth">
                  <Icon 
                    name={item.icon} 
                    size={24} 
                    className="text-primary group-hover:text-primary-foreground transition-smooth" 
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-inter font-semibold text-text-primary mb-2 group-hover:text-primary transition-smooth">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-border-light">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {/* License Badge */}
            <div className="flex items-center space-x-2">
              <Icon name="FileText" size={20} className="text-text-secondary" />
              <span className="text-sm font-inter font-medium text-text-secondary">
                License #PC-2024-001
              </span>
            </div>
            
            {/* Insurance Badge */}
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={20} className="text-text-secondary" />
              <span className="text-sm font-inter font-medium text-text-secondary">
                $2M Liability Coverage
              </span>
            </div>
            
            {/* Certification Badge */}
            <div className="flex items-center space-x-2">
              <Icon name="Award" size={20} className="text-text-secondary" />
              <span className="text-sm font-inter font-medium text-text-secondary">
                NSPF Certified
              </span>
            </div>
            
            {/* Local Badge */}
            <div className="flex items-center space-x-2">
              <Icon name="MapPin" size={20} className="text-text-secondary" />
              <span className="text-sm font-inter font-medium text-text-secondary">
                Locally Owned & Operated
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;