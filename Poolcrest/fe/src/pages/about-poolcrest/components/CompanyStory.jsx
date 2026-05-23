import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CompanyStory = () => {
  const milestones = [
    {
      year: "2008",
      title: "Founded with Family Values",
      description: "Started as a family business with a simple mission: provide pool care that lets families focus on making memories, not maintenance worries.",
      icon: "Home"
    },
    {
      year: "2012",
      title: "Community Trust Built",
      description: "Expanded to serve over 500 local families, establishing our reputation for reliability and genuine care in the community.",
      icon: "Users"
    },
    {
      year: "2016",
      title: "Technology Integration",
      description: "Pioneered smart pool monitoring and customer portal systems, making pool care more transparent and convenient.",
      icon: "Smartphone"
    },
    {
      year: "2020",
      title: "Emergency Response Excellence",
      description: "Launched 24/7 emergency services during challenging times, proving our commitment to being there when families need us most.",
      icon: "Clock"
    },
    {
      year: "2023",
      title: "Comprehensive Care Ecosystem",
      description: "Evolved into a complete pool care partner, offering everything from routine maintenance to safety education and environmental solutions.",
      icon: "Award"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 pool-gradient rounded-lg flex items-center justify-center">
              <Icon name="BookOpen" size={20} color="white" />
            </div>
            <span className="text-accent font-inter font-semibold text-lg">Our Story</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            From Neighbors to Pool Care Experts
          </h2>
          <p className="text-xl text-text-secondary font-inter max-w-3xl mx-auto leading-relaxed">
            What started as helping neighbors with their pools has grown into a comprehensive care ecosystem, 
            but our core values remain unchanged: family first, quality always, and trust earned daily.
          </p>
        </div>

        {/* Story Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-inter font-bold text-text-primary">
                Built on Family Values
              </h3>
              <p className="text-text-secondary font-inter leading-relaxed">
                Poolcrest began when our founder, a father of three, realized that pool maintenance was keeping families 
                from enjoying their pools. Too many weekends were spent fighting algae instead of creating memories.
              </p>
              <p className="text-text-secondary font-inter leading-relaxed">
                We set out to change that by becoming the trusted neighbor who takes care of the technical stuff, 
                so families can focus on what matters most – time together, celebrations, and the simple joy of a 
                perfectly maintained pool that's always ready when you are.
              </p>
            </div>

            {/* Core Values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon name="Heart" size={16} color="var(--color-primary)" />
                </div>
                <span className="font-inter font-medium text-text-primary">Family First</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={16} color="var(--color-primary)" />
                </div>
                <span className="font-inter font-medium text-text-primary">Safety Always</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon name="Star" size={16} color="var(--color-primary)" />
                </div>
                <span className="font-inter font-medium text-text-primary">Quality Guaranteed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon name="Handshake" size={16} color="var(--color-primary)" />
                </div>
                <span className="font-inter font-medium text-text-primary">Trust Earned</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="Family enjoying their pool together"
              className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-accent-100 to-warning-100 rounded-2xl -z-10"></div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          <h3 className="text-2xl font-inter font-bold text-text-primary text-center mb-12">
            Our Journey of Growth
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary hidden lg:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="relative flex items-start space-x-6">
                  {/* Timeline Dot */}
                  <div className="hidden lg:flex w-16 h-16 pool-gradient rounded-full items-center justify-center shadow-lg relative z-10">
                    <Icon name={milestone.icon} size={24} color="white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-surface rounded-xl p-6 shadow-sm border border-border-light hover:shadow-md transition-smooth">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="lg:hidden w-12 h-12 pool-gradient rounded-lg flex items-center justify-center">
                        <Icon name={milestone.icon} size={20} color="white" />
                      </div>
                      <div>
                        <span className="text-2xl font-inter font-bold text-primary">{milestone.year}</span>
                        <h4 className="text-xl font-inter font-semibold text-text-primary">{milestone.title}</h4>
                      </div>
                    </div>
                    <p className="text-text-secondary font-inter leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyStory;