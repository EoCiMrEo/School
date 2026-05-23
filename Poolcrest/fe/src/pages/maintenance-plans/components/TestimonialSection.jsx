import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TestimonialSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "Westfield, NJ",
      plan: "Family Protection Plan",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      quote: `The peace of mind is incredible. Our pool is always ready for the kids' friends to come over, and I never worry about safety issues. Mike catches problems before they become expensive repairs.`,
      highlight: "Peace of mind for family time"
    },
    {
      id: 2,
      name: "David Chen",
      location: "Summit, NJ",
      plan: "Lifestyle Premium Plan",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: `Best investment we've made for our home. The priority service saved us during a pump failure right before our daughter's graduation party. Everything was perfect.`,
      highlight: "Saved our special event"
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      location: "Cranford, NJ",
      plan: "Essential Care Plan",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: `Even the basic plan gives us so much value. Our pool has never looked better, and we're actually saving money compared to calling for individual services.`,
      highlight: "Great value and savings"
    }
  ];

  const familyMoments = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
      caption: "Weekend family fun made possible by reliable pool care"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop",
      caption: "Birthday parties without pool worries"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      caption: "Crystal clear water for safe family swimming"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Customer Testimonials */}
      <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-text-primary mb-2">What Our Families Say</h3>
          <p className="text-text-secondary">Real stories from real customers about peace of mind and family enjoyment</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-surface rounded-xl p-6 border border-border">
              {/* Customer Info */}
              <div className="flex items-center space-x-4 mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-text-primary">{testimonial.name}</h4>
                  <p className="text-sm text-text-secondary">{testimonial.location}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Icon key={i} name="Star" size={16} className="text-accent fill-current" />
                ))}
              </div>

              {/* Plan Badge */}
              <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-4">
                {testimonial.plan}
              </div>

              {/* Quote */}
              <blockquote className="text-text-primary mb-4 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Highlight */}
              <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                <div className="flex items-center space-x-2">
                  <Icon name="Heart" size={16} className="text-accent" />
                  <span className="text-sm font-medium text-accent">{testimonial.highlight}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family Moments Gallery */}
      <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-text-primary mb-2">Enabling Family Memories</h3>
          <p className="text-text-secondary">When your pool is always ready, every moment becomes special</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {familyMoments.map((moment) => (
            <div key={moment.id} className="group relative overflow-hidden rounded-xl">
              <Image
                src={moment.image}
                alt={moment.caption}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium">{moment.caption}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Icon name="Users" size={24} className="text-primary" />
              <h4 className="text-lg font-semibold text-text-primary">Family-First Approach</h4>
            </div>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Our maintenance plans aren't just about clean water—they're about creating the perfect backdrop 
              for your family's most precious moments. When you never have to worry about pool maintenance, 
              you can focus on what matters most: making memories with the people you love.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Users" size={32} className="text-success" />
          </div>
          <div className="text-2xl font-bold text-text-primary">500+</div>
          <div className="text-sm text-text-secondary">Happy Families</div>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Star" size={32} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-text-primary">4.9/5</div>
          <div className="text-sm text-text-secondary">Customer Rating</div>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Calendar" size={32} className="text-accent" />
          </div>
          <div className="text-2xl font-bold text-text-primary">15+</div>
          <div className="text-sm text-text-secondary">Years Experience</div>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Shield" size={32} className="text-success" />
          </div>
          <div className="text-2xl font-bold text-text-primary">100%</div>
          <div className="text-sm text-text-secondary">Satisfaction Guarantee</div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;