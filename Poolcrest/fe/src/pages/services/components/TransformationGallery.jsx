import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TransformationGallery = () => {
  const [selectedTransformation, setSelectedTransformation] = useState(0);

  const transformations = [
    {
      id: 1,
      title: "Green Pool Recovery",
      location: "Riverside Estate",
      duration: "3 days",
      beforeImage: "https://images.pexels.com/photos/2736499/pexels-photo-2736499.jpeg",
      afterImage: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg",
      customerName: "Sarah Johnson",
      customerImage: "https://randomuser.me/api/portraits/women/32.jpg",
      testimonial: `Poolcrest transformed our disaster into a family oasis. The team worked tirelessly to bring our green, neglected pool back to crystal clear perfection. Now our kids can safely enjoy swimming again!`,
      services: ["Algae Treatment", "Chemical Balancing", "Deep Cleaning", "Equipment Repair"],
      cost: "$850",
      rating: 5
    },
    {
      id: 2,
      title: "Complete Pool Renovation",
      location: "Oakwood Hills",
      duration: "2 weeks",
      beforeImage: "https://images.pexels.com/photos/2736499/pexels-photo-2736499.jpeg",
      afterImage: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg",
      customerName: "Michael Rodriguez",
      customerImage: "https://randomuser.me/api/portraits/men/45.jpg",
      testimonial: `From cracked tiles to outdated equipment, Poolcrest gave us a complete makeover. The attention to detail and professionalism exceeded our expectations. Our backyard is now the neighborhood gathering spot!`,
      services: ["Tile Replacement", "Equipment Upgrade", "Lighting Installation", "Deck Refinishing"],
      cost: "$12,500",
      rating: 5
    },
    {
      id: 3,
      title: "Emergency Equipment Repair",
      location: "Sunset Valley",
      duration: "Same day",
      beforeImage: "https://images.pexels.com/photos/2736499/pexels-photo-2736499.jpeg",
      afterImage: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg",
      customerName: "Lisa Chen",
      customerImage: "https://randomuser.me/api/portraits/women/28.jpg",
      testimonial: `Our pool pump failed right before our daughter's birthday party. Poolcrest's emergency team arrived within 2 hours and had everything running perfectly. They saved the day and made 20 kids very happy!`,
      services: ["Pump Replacement", "Filter Cleaning", "System Testing", "Warranty Service"],
      cost: "$650",
      rating: 5
    },
    {
      id: 4,
      title: "Seasonal Opening Service",
      location: "Maple Ridge",
      duration: "1 day",
      beforeImage: "https://images.pexels.com/photos/2736499/pexels-photo-2736499.jpeg",
      afterImage: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg",
      customerName: "David Thompson",
      customerImage: "https://randomuser.me/api/portraits/men/38.jpg",
      testimonial: `After a harsh winter, our pool looked terrible. Poolcrest's spring opening service was thorough and efficient. They had us swimming within days, and the water has never been clearer!`,
      services: ["Cover Removal", "Deep Cleaning", "Chemical Startup", "Equipment Inspection"],
      cost: "$425",
      rating: 5
    }
  ];

  const currentTransformation = transformations[selectedTransformation];

  return (
    <div className="card p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-accent-50 rounded-xl">
          <Icon name="Camera" size={24} className="text-accent" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-text-primary font-inter">Transformation Gallery</h3>
          <p className="text-text-secondary">Real results from real customers</p>
        </div>
      </div>

      {/* Transformation Selector */}
      <div className="flex overflow-x-auto space-x-3 mb-6 pb-2">
        {transformations.map((transformation, index) => (
          <button
            key={transformation.id}
            onClick={() => setSelectedTransformation(index)}
            className={`flex-shrink-0 p-3 rounded-lg border-2 transition-smooth ${
              selectedTransformation === index
                ? 'border-primary bg-primary-50' :'border-border hover:border-primary-300'
            }`}
          >
            <div className="text-sm font-medium text-left min-w-[120px]">
              {transformation.title}
            </div>
            <div className="text-xs text-text-secondary">
              {transformation.location}
            </div>
          </button>
        ))}
      </div>

      {/* Main Transformation Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Before/After Images */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute top-2 left-2 bg-error text-error-foreground px-2 py-1 rounded text-xs font-semibold z-10">
                Before
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image
                  src={currentTransformation.beforeImage}
                  alt={`Before - ${currentTransformation.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-2 left-2 bg-success text-success-foreground px-2 py-1 rounded text-xs font-semibold z-10">
                After
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image
                  src={currentTransformation.afterImage}
                  alt={`After - ${currentTransformation.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="card-surface p-4">
            <h4 className="font-semibold text-text-primary mb-2">{currentTransformation.title}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Location:</span>
                <span className="ml-2 font-medium">{currentTransformation.location}</span>
              </div>
              <div>
                <span className="text-text-secondary">Duration:</span>
                <span className="ml-2 font-medium">{currentTransformation.duration}</span>
              </div>
              <div>
                <span className="text-text-secondary">Investment:</span>
                <span className="ml-2 font-medium text-primary">{currentTransformation.cost}</span>
              </div>
              <div className="flex items-center">
                <span className="text-text-secondary">Rating:</span>
                <div className="flex items-center ml-2">
                  {[...Array(currentTransformation.rating)].map((_, i) => (
                    <Icon key={i} name="Star" size={14} className="text-accent fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Story & Services */}
        <div className="space-y-6">
          {/* Customer Testimonial */}
          <div className="card-surface p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 overflow-hidden rounded-full">
                <Image
                  src={currentTransformation.customerImage}
                  alt={currentTransformation.customerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h5 className="font-semibold text-text-primary">{currentTransformation.customerName}</h5>
                <div className="flex items-center">
                  {[...Array(currentTransformation.rating)].map((_, i) => (
                    <Icon key={i} name="Star" size={14} className="text-accent fill-current" />
                  ))}
                </div>
              </div>
            </div>
            
            <blockquote className="text-text-secondary italic">
              "{currentTransformation.testimonial}"
            </blockquote>
          </div>

          {/* Services Included */}
          <div className="card-surface p-6">
            <h5 className="font-semibold text-text-primary mb-4 flex items-center">
              <Icon name="CheckCircle" size={18} className="text-success mr-2" />
              Services Included
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentTransformation.services.map((service, index) => (
                <div key={index} className="flex items-center text-sm">
                  <Icon name="Check" size={14} className="text-success mr-2 flex-shrink-0" />
                  {service}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              iconName="Calendar"
              iconPosition="left"
              className="flex-1"
            >
              Get Similar Results
            </Button>
            <Button
              variant="outline"
              iconName="MessageCircle"
              iconPosition="left"
              className="flex-1"
            >
              Ask Questions
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2 mt-8">
        {transformations.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedTransformation(index)}
            className={`w-3 h-3 rounded-full transition-smooth ${
              selectedTransformation === index
                ? 'bg-primary' :'bg-border hover:bg-primary-300'
            }`}
            aria-label={`View transformation ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TransformationGallery;