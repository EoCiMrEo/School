import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceGuarantees = () => {
  const guarantees = [
    {
      icon: 'Clock',
      title: '24-Hour Response',
      description: 'Emergency calls answered within 2 hours, guaranteed',
      details: [
        'Immediate dispatch notification',
        'Real-time technician tracking',
        'Response time guarantee or service call fee waived'
      ]
    },
    {
      icon: 'Shield',
      title: 'Licensed & Insured',
      description: 'Fully certified technicians with comprehensive coverage',
      details: [
        'State-licensed pool professionals',
        '$2M liability insurance coverage',
        'Bonded and background-checked staff'
      ]
    },
    {
      icon: 'Heart',
      title: 'Family Safety First',
      description: 'Your family\'s safety is our top priority',
      details: [
        'Child safety assessment included',
        'Hazard identification and mitigation',
        'Safety equipment recommendations'
      ]
    },
    {
      icon: 'Wrench',
      title: 'Complete Repair Solutions',
      description: 'From diagnosis to follow-up care',
      details: [
        'Comprehensive problem diagnosis',
        'Quality parts and materials',
        '90-day warranty on all repairs'
      ]
    },
    {
      icon: 'Phone',
      title: 'Follow-Up Care',
      description: 'We ensure your pool stays healthy',
      details: [
        '48-hour post-repair check-in',
        'Preventive maintenance recommendations',
        'Priority scheduling for future services'
      ]
    },
    {
      icon: 'DollarSign',
      title: 'Transparent Pricing',
      description: 'No hidden fees or surprise charges',
      details: [
        'Upfront cost estimates',
        'Written quotes before work begins',
        'Flexible payment options available'
      ]
    }
  ];

  const certifications = [
    {
      name: 'NSPF Certified',
      description: 'National Swimming Pool Foundation',
      icon: 'Award'
    },
    {
      name: 'CPO Certified',
      description: 'Certified Pool Operator',
      icon: 'Certificate'
    },
    {
      name: 'EPA Compliant',
      description: 'Environmental Protection Agency',
      icon: 'Leaf'
    },
    {
      name: 'OSHA Trained',
      description: 'Occupational Safety Standards',
      icon: 'HardHat'
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Our Service Guarantees
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            When you choose Poolcrest Pro for emergency repairs, you're choosing reliability, 
            expertise, and peace of mind backed by our comprehensive guarantees.
          </p>
        </div>

        {/* Main Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {guarantees.map((guarantee, index) => (
            <div key={index} className="card p-6 hover-lift transition-smooth">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={guarantee.icon} size={32} className="text-primary" />
                </div>
                
                <h3 className="text-xl font-inter font-semibold text-text-primary mb-2">
                  {guarantee.title}
                </h3>
                
                <p className="text-text-secondary mb-4">
                  {guarantee.description}
                </p>
              </div>
              
              <ul className="space-y-2">
                {guarantee.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start text-sm">
                    <Icon name="Check" size={16} className="text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="card p-8 bg-surface">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-inter font-bold text-text-primary mb-4">
              Professional Certifications
            </h3>
            <p className="text-text-secondary">
              Our technicians maintain the highest industry standards and certifications
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name={cert.icon} size={24} className="text-accent" />
                </div>
                
                <h4 className="font-inter font-semibold text-text-primary mb-1">
                  {cert.name}
                </h4>
                
                <p className="text-sm text-text-secondary">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Promise */}
        <div className="mt-16 text-center">
          <div className="card p-8 bg-gradient-to-r from-error-50 to-warning-50 border border-error-200">
            <div className="w-20 h-20 bg-error rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Heart" size={40} className="text-white" />
            </div>
            
            <h3 className="text-3xl font-inter font-bold text-text-primary mb-4">
              Our Emergency Promise
            </h3>
            
            <p className="text-lg text-text-secondary max-w-3xl mx-auto mb-6">
              "We understand that pool emergencies can disrupt your family's plans and potentially create safety hazards. That's why we've built our entire emergency response system around one simple promise: when you need us most, we'll be there."
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center">
                <Icon name="Clock" size={16} className="mr-2" />
                <span>Available 24/7/365</span>
              </div>
              <div className="flex items-center">
                <Icon name="MapPin" size={16} className="mr-2" />
                <span>Serving Greater Metro Area</span>
              </div>
              <div className="flex items-center">
                <Icon name="Phone" size={16} className="mr-2" />
                <span>Direct technician contact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceGuarantees;