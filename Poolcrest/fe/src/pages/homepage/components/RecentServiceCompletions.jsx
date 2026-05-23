import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const RecentServiceCompletions = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const recentServices = [
    {
      id: 1,
      customerName: "The Williams Family",
      location: "Maple Grove",
      service: "Emergency Pump Repair",
      technician: "Mike Rodriguez",
      technicianImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      completedAt: new Date(Date.now() - 1800000), // 30 minutes ago
      status: "completed",
      rating: 5,
      beforeImage: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400",
      afterImage: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400",
      issue: "Pool pump motor failure",
      solution: "Replaced motor and tested system",
      priority: "high"
    },
    {
      id: 2,
      customerName: "Johnson Residence",
      location: "Oak Hills",
      service: "Weekly Maintenance",
      technician: "Sarah Chen",
      technicianImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      completedAt: new Date(Date.now() - 3600000), // 1 hour ago
      status: "completed",
      rating: 5,
      beforeImage: "https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=400",
      afterImage: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400",
      issue: "Routine cleaning and chemical balancing",
      solution: "Cleaned, balanced chemicals, checked equipment",
      priority: "routine"
    },
    {
      id: 3,
      customerName: "Davis Pool",
      location: "Riverside",
      service: "Filter Replacement",
      technician: "Alex Thompson",
      technicianImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      completedAt: new Date(Date.now() - 7200000), // 2 hours ago
      status: "completed",
      rating: 5,
      beforeImage: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400",
      afterImage: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400",
      issue: "Clogged filter reducing water flow",
      solution: "Installed new high-efficiency filter",
      priority: "medium"
    }
  ];

  const getTimeAgo = (date) => {
    const now = currentTime;
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error-100 text-error border-error-200';
      case 'medium': return 'bg-warning-100 text-warning border-warning-200';
      case 'routine': return 'bg-success-100 text-success border-success-200';
      default: return 'bg-surface text-text-secondary border-border';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'Clock';
      case 'routine': return 'CheckCircle';
      default: return 'Info';
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-inter font-semibold text-text-primary">
              Live Service Updates
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Recently Completed Services
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            See real-time updates of our team's work across the community. Your neighbors trust us - you can too.
          </p>
        </div>

        {/* Service Cards */}
        <div className="space-y-6">
          {recentServices.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover-lift transition-smooth">
              <div className="grid lg:grid-cols-4 gap-6 items-center">
                {/* Service Info */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs font-inter font-semibold border ${getPriorityColor(service.priority)}`}>
                      <div className="flex items-center space-x-1">
                        <Icon name={getPriorityIcon(service.priority)} size={12} />
                        <span>{service.priority.charAt(0).toUpperCase() + service.priority.slice(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-success">
                      <Icon name="CheckCircle" size={16} />
                      <span className="text-xs font-inter font-medium">Completed</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-inter font-bold text-text-primary text-lg mb-1">
                      {service.customerName}
                    </h3>
                    <p className="text-sm text-text-secondary flex items-center space-x-1">
                      <Icon name="MapPin" size={14} />
                      <span>{service.location}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-inter font-semibold text-primary">{service.service}</span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      {getTimeAgo(service.completedAt)}
                    </div>
                  </div>
                </div>

                {/* Before/After Images */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-xs font-inter font-semibold text-text-secondary uppercase tracking-wide">
                        Before
                      </div>
                      <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden">
                        <Image
                          src={service.beforeImage}
                          alt={`Before ${service.service} at ${service.customerName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-inter font-semibold text-success uppercase tracking-wide">
                        After
                      </div>
                      <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden">
                        <Image
                          src={service.afterImage}
                          alt={`After ${service.service} at ${service.customerName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technician & Details */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={service.technicianImage}
                        alt={`${service.technician} - Poolcrest Pro technician`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-inter font-semibold text-text-primary text-sm">
                        {service.technician}
                      </div>
                      <div className="text-xs text-text-secondary">
                        Certified Technician
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-inter font-medium text-text-secondary">Issue:</span>
                      <p className="text-text-primary">{service.issue}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-inter font-medium text-text-secondary">Solution:</span>
                      <p className="text-text-primary">{service.solution}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {[...Array(service.rating)].map((_, i) => (
                      <Icon key={i} name="Star" size={16} className="text-warning fill-current" />
                    ))}
                    <span className="text-sm text-text-secondary ml-2">
                      {service.rating}.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Stats */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-inter font-bold text-success mb-2">
                {recentServices.length}
              </div>
              <div className="text-sm text-text-secondary">
                Services Today
              </div>
            </div>
            <div>
              <div className="text-3xl font-inter font-bold text-primary mb-2">
                100%
              </div>
              <div className="text-sm text-text-secondary">
                Completion Rate
              </div>
            </div>
            <div>
              <div className="text-3xl font-inter font-bold text-warning mb-2">
                4.9
              </div>
              <div className="text-sm text-text-secondary">
                Average Rating
              </div>
            </div>
            <div>
              <div className="text-3xl font-inter font-bold text-error mb-2">
                &lt;2hr
              </div>
              <div className="text-sm text-text-secondary">
                Emergency Response
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg text-text-secondary mb-6">
            Join thousands of satisfied customers who trust Poolcrest Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary px-8 py-3 rounded-xl font-inter font-semibold flex items-center justify-center space-x-2 hover-lift transition-smooth">
              <Icon name="Calendar" size={20} />
              <span>Schedule Service</span>
            </button>
            <button className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-xl font-inter font-semibold flex items-center justify-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-smooth">
              <Icon name="Phone" size={20} />
              <span>Call Now</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentServiceCompletions;