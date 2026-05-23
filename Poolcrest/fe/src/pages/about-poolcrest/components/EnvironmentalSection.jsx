import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const EnvironmentalSection = () => {
  const ecoInitiatives = [
    {
      id: 1,
      title: "Eco-Friendly Chemical Solutions",
      description: "We prioritize environmentally safe pool chemicals that are gentler on skin, eyes, and the environment while maintaining crystal-clear water.",
      icon: "Leaf",
      benefits: [
        "Reduced chemical runoff",
        "Safer for children and pets",
        "Biodegradable formulations",
        "Lower environmental impact"
      ],
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      title: "Energy-Efficient Equipment",
      description: "We recommend and install energy-efficient pumps, heaters, and LED lighting systems that reduce your pool's carbon footprint and energy costs.",
      icon: "Zap",
      benefits: [
        "Up to 70% energy savings",
        "Variable speed pump technology",
        "LED lighting systems",
        "Smart automation controls"
      ],
      image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      title: "Water Conservation Practices",
      description: "Our maintenance approach minimizes water waste through proper chemical balancing, leak detection, and efficient cleaning methods.",
      icon: "Droplets",
      benefits: [
        "Reduced water waste",
        "Leak detection services",
        "Optimal chemical balance",
        "Efficient cleaning methods"
      ],
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const sustainabilityStats = [
    {
      metric: "30%",
      description: "Average energy reduction with our recommended equipment upgrades",
      icon: "TrendingDown"
    },
    {
      metric: "25%",
      description: "Reduction in chemical usage with our eco-friendly approach",
      icon: "Leaf"
    },
    {
      metric: "40%",
      description: "Water savings through proper maintenance and leak prevention",
      icon: "Droplets"
    },
    {
      metric: "100%",
      description: "Of our service vehicles use eco-friendly maintenance practices",
      icon: "Truck"
    }
  ];

  const certifications = [
    {
      name: "EPA Green Partner",
      description: "Certified partner in environmental protection initiatives",
      icon: "Award"
    },
    {
      name: "Energy Star Certified",
      description: "Qualified to recommend and install Energy Star equipment",
      icon: "Star"
    },
    {
      name: "Green Business Certified",
      description: "Recognized for sustainable business practices",
      icon: "Leaf"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Icon name="Leaf" size={20} color="white" />
            </div>
            <span className="text-accent font-inter font-semibold text-lg">Environmental Responsibility</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Caring for Pools & Planet
          </h2>
          <p className="text-xl text-text-secondary font-inter max-w-3xl mx-auto leading-relaxed">
            We believe in providing exceptional pool care while protecting the environment for future generations. 
            Our eco-friendly approach benefits your family and our planet.
          </p>
        </div>

        {/* Eco Initiatives */}
        <div className="mb-16">
          <div className="space-y-12">
            {ecoInitiatives.map((initiative, index) => (
              <div key={initiative.id} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon name={initiative.icon} size={24} color="rgb(34, 197, 94)" />
                    </div>
                    <h3 className="text-2xl font-inter font-bold text-text-primary">{initiative.title}</h3>
                  </div>
                  
                  <p className="text-text-secondary font-inter leading-relaxed text-lg">
                    {initiative.description}
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-inter font-semibold text-text-primary">Key Benefits:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {initiative.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-2">
                          <Icon name="CheckCircle" size={16} color="rgb(34, 197, 94)" />
                          <span className="text-sm font-inter text-text-secondary">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="relative z-10">
                    <Image
                      src={initiative.image}
                      alt={initiative.title}
                      className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-lg"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-2xl -z-10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Stats */}
        <div className="mb-16">
          <h3 className="text-2xl font-inter font-bold text-text-primary mb-8 text-center">
            Our Environmental Impact
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sustainabilityStats.map((stat, index) => (
              <div key={index} className="bg-surface rounded-xl p-6 text-center border border-border-light hover:shadow-lg transition-smooth">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={stat.icon} size={24} color="rgb(34, 197, 94)" />
                </div>
                <div className="text-3xl font-inter font-bold text-green-600 mb-2">{stat.metric}</div>
                <p className="text-sm text-text-secondary font-inter leading-relaxed">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Certifications */}
        <div className="mb-16">
          <h3 className="text-2xl font-inter font-bold text-text-primary mb-8 text-center">
            Environmental Certifications
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-border-light text-center hover:shadow-xl transition-smooth">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={cert.icon} size={24} color="rgb(34, 197, 94)" />
                </div>
                <h4 className="font-inter font-semibold text-text-primary mb-2">{cert.name}</h4>
                <p className="text-sm text-text-secondary font-inter leading-relaxed">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Commitment */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Globe" size={32} color="white" />
            </div>
            <h3 className="text-2xl font-inter font-bold text-text-primary mb-4">
              Our Environmental Promise
            </h3>
            <p className="text-lg text-text-secondary font-inter leading-relaxed mb-6">
              We're committed to continuous improvement in our environmental practices. Every service call is an 
              opportunity to recommend more sustainable solutions that benefit both your family and our planet.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <h4 className="font-inter font-semibold text-text-primary flex items-center space-x-2">
                  <Icon name="Target" size={16} color="rgb(34, 197, 94)" />
                  <span>Our Goals</span>
                </h4>
                <ul className="space-y-2 text-sm text-text-secondary font-inter">
                  <li>• Reduce chemical usage by 50% by 2025</li>
                  <li>• Achieve carbon-neutral service operations</li>
                  <li>• Partner with eco-friendly suppliers</li>
                  <li>• Educate customers on sustainable practices</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-inter font-semibold text-text-primary flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} color="rgb(34, 197, 94)" />
                  <span>What We're Doing</span>
                </h4>
                <ul className="space-y-2 text-sm text-text-secondary font-inter">
                  <li>• Using electric and hybrid service vehicles</li>
                  <li>• Implementing digital service records</li>
                  <li>• Recycling pool equipment and chemicals</li>
                  <li>• Training staff on green practices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnvironmentalSection;