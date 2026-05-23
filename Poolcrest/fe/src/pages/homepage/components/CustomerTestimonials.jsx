import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const CustomerTestimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah & Mike Johnson",
      location: "Riverside Estates",
      image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      poolImage: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      rating: 5,
      service: "Weekly Maintenance Plan",
      testimonial: `Poolcrest Pro has been a game-changer for our family. We used to spend every weekend cleaning and balancing chemicals, but now we can just enjoy our pool time with the kids. Their team is incredibly reliable and professional - they've never missed a scheduled service in over two years. Our pool has never looked better, and we have complete peace of mind knowing it's always safe for our children.`,
      highlight: "Complete peace of mind for our family",
      duration: "2+ years of service"
    },
    {
      id: 2,
      name: "David & Lisa Chen",
      location: "Oakwood Community",
      image: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      poolImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      rating: 5,
      service: "Emergency Repair Service",
      testimonial: `When our pool pump failed on a Friday evening before our daughter's birthday party, we thought the weekend was ruined. Poolcrest Pro had a technician at our house within 2 hours and had everything working perfectly by Saturday morning. The party was saved! Their emergency service is worth every penny - they truly understand that pools are where families create memories.`,
      highlight: "Saved our daughter\'s birthday party",
      duration: "Emergency response in 2 hours"
    },
    {
      id: 3,
      name: "Jennifer & Robert Martinez",
      location: "Sunset Hills",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      poolImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      rating: 5,
      service: "Seasonal Opening & Closing",
      testimonial: `As new pool owners, we were overwhelmed by the seasonal maintenance requirements. Poolcrest Pro's team walked us through everything, handled our spring opening flawlessly, and educated us on proper pool care. They treat our pool like it's their own family's pool. The attention to detail and genuine care they show is exceptional - we couldn't be happier with their service.`,
      highlight: "Exceptional care and education",
      duration: "3 seasons of perfect service"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const currentData = testimonials[currentTestimonial];

  return (
    <section className="py-16 lg:py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
            <Icon name="Heart" size={20} className="text-error" />
            <span className="text-sm font-inter font-semibold text-text-primary">
              Happy Families
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Trusted by Families Like Yours
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Real stories from real families who trust Poolcrest Pro to keep their pools perfect for life's best moments.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Images Side */}
          <div className="space-y-6">
            {/* Pool Image */}
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={currentData.poolImage}
                  alt={`${currentData.name}'s beautiful pool maintained by Poolcrest Pro`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Service Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-glass rounded-xl px-4 py-2 shadow-lg">
                <div className="text-sm font-inter font-semibold text-primary">
                  {currentData.service}
                </div>
              </div>
            </div>

            {/* Customer Image & Info */}
            <div className="flex items-center space-x-4 bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={currentData.image}
                  alt={`${currentData.name} - Happy Poolcrest Pro customer`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-inter font-bold text-text-primary">
                  {currentData.name}
                </h4>
                <p className="text-sm text-text-secondary">{currentData.location}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {[...Array(currentData.rating)].map((_, i) => (
                    <Icon key={i} name="Star" size={16} className="text-warning fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            {/* Quote */}
            <div className="relative">
              {/* Make quote icon less intrusive and add comfortable padding-left */}
              <Icon
                name="Quote"
                size={40}
                className="text-primary-200 absolute top-0 left-0 pointer-events-none"
              />
              <blockquote className="text-lg lg:text-xl text-text-primary leading-relaxed font-inter pl-12 md:pl-14">
                {currentData.testimonial}
              </blockquote>
            </div>

            {/* Highlight */}
            <div className="bg-primary-50 rounded-xl p-6 border-l-4 border-primary">
              <div className="flex items-center space-x-3">
                <Icon name="Heart" size={24} className="text-primary" />
                <div>
                  <div className="font-inter font-semibold text-primary text-lg">
                    "{currentData.highlight}"
                  </div>
                  <div className="text-sm text-primary-700 font-inter">
                    {currentData.duration}
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-inter font-bold text-success">100%</div>
                <div className="text-sm text-text-secondary">Satisfaction Rate</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-inter font-bold text-primary">2.5K+</div>
                <div className="text-sm text-text-secondary">Happy Families</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Navigation */}
        <div className="flex justify-center space-x-4 mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-smooth ${
                index === currentTestimonial ? 'bg-primary' : 'bg-border hover:bg-primary-300'
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Review Summary */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-inter font-bold text-primary mb-2">4.9/5</div>
              <div className="flex justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="Star" size={20} className="text-warning fill-current" />
                ))}
              </div>
              <div className="text-sm text-text-secondary">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-inter font-bold text-success mb-2">2,547</div>
              <div className="text-sm text-text-secondary">Total Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-inter font-bold text-warning mb-2">98%</div>
              <div className="text-sm text-text-secondary">Recommend Us</div>
            </div>
            <div>
              <div className="text-3xl font-inter font-bold text-error mb-2">24/7</div>
              <div className="text-sm text-text-secondary">Emergency Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;