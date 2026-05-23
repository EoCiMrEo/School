import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TechnicianAvailability = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const technicians = [
    {
      id: 1,
      name: "Mike Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      specialties: ["Equipment Repair", "Chemical Balancing"],
      rating: 4.9,
      responseTime: "45 minutes",
      status: "available",
      location: "Downtown Area"
    },
    {
      id: 2,
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      specialties: ["Leak Detection", "Structural Repairs"],
      rating: 4.8,
      responseTime: "1 hour 15 minutes",
      status: "available",
      location: "North Side"
    },
    {
      id: 3,
      name: "David Thompson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      specialties: ["Pump Systems", "Filtration"],
      rating: 4.9,
      responseTime: "2 hours",
      status: "busy",
      nextAvailable: "3:30 PM",
      location: "South District"
    }
  ];

  const timeSlots = [
    { time: "ASAP", label: "Emergency Response", available: true, price: "$150" },
    { time: "2:00 PM", label: "Today Afternoon", available: true, price: "$120" },
    { time: "4:00 PM", label: "Today Evening", available: true, price: "$120" },
    { time: "8:00 AM", label: "Tomorrow Morning", available: true, price: "$100" },
    { time: "12:00 PM", label: "Tomorrow Afternoon", available: true, price: "$100" },
    { time: "6:00 PM", label: "Tomorrow Evening", available: false, price: "$100" }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Real-Time Technician Availability
          </h2>
          <p className="text-lg text-text-secondary mb-2">
            Current Time: {formatTime(currentTime)}
          </p>
          <p className="text-text-secondary">
            See who's available now and book your preferred time slot
          </p>
        </div>

        {/* Available Technicians */}
        <div className="mb-12">
          <h3 className="text-2xl font-inter font-semibold text-text-primary mb-6 flex items-center">
            <Icon name="Users" size={24} className="mr-2" />
            Available Technicians
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicians.map((tech) => (
              <div key={tech.id} className="card p-6 relative">
                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                  tech.status === 'available' ? 'bg-success animate-pulse' : 'bg-warning'
                }`}></div>
                
                <div className="flex items-center mb-4">
                  <img
                    src={tech.avatar}
                    alt={tech.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-inter font-semibold text-text-primary">
                      {tech.name}
                    </h4>
                    <div className="flex items-center text-sm text-text-secondary">
                      <Icon name="Star" size={14} className="text-accent mr-1" />
                      <span>{tech.rating}</span>
                      <span className="mx-2">•</span>
                      <Icon name="MapPin" size={14} className="mr-1" />
                      <span>{tech.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-text-primary mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {tech.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {tech.status === 'available' ? 'Available Now' : 'Next Available'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      ETA: {tech.status === 'available' ? tech.responseTime : tech.nextAvailable}
                    </p>
                  </div>
                  
                  <Button
                    variant={tech.status === 'available' ? 'primary' : 'secondary'}
                    size="sm"
                    iconName={tech.status === 'available' ? 'Phone' : 'Clock'}
                    iconPosition="left"
                    disabled={tech.status !== 'available'}
                  >
                    {tech.status === 'available' ? 'Book Now' : 'Schedule'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-12">
          <h3 className="text-2xl font-inter font-semibold text-text-primary mb-6 flex items-center">
            <Icon name="Calendar" size={24} className="mr-2" />
            Available Time Slots
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className={`card p-4 cursor-pointer transition-smooth ${
                  !slot.available 
                    ? 'opacity-50 cursor-not-allowed' 
                    : selectedTimeSlot === index
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'hover:shadow-md hover-lift'
                }`}
                onClick={() => slot.available && setSelectedTimeSlot(index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-inter font-semibold text-text-primary">
                      {slot.time}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {slot.label}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-inter font-bold text-primary">
                      {slot.price}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Service Call
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className={`flex items-center text-sm ${
                    slot.available ? 'text-success' : 'text-error'
                  }`}>
                    <Icon 
                      name={slot.available ? 'CheckCircle' : 'XCircle'} 
                      size={16} 
                      className="mr-1" 
                    />
                    <span>{slot.available ? 'Available' : 'Booked'}</span>
                  </div>
                  
                  {slot.time === 'ASAP' && (
                    <div className="flex items-center text-xs text-warning">
                      <Icon name="Zap" size={14} className="mr-1" />
                      <span>Priority</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time Guarantee */}
        <div className="card p-8 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Shield" size={32} className="text-white" />
            </div>
            
            <h3 className="text-2xl font-inter font-bold text-text-primary mb-4">
              Our Response Time Guarantee
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-inter font-bold text-primary mb-2">
                  &lt; 2 Hours
                </div>
                <p className="text-text-secondary">
                  Emergency Response Time
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-inter font-bold text-primary mb-2">
                  24/7
                </div>
                <p className="text-text-secondary">
                  Available Every Day
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-inter font-bold text-primary mb-2">
                  100%
                </div>
                <p className="text-text-secondary">
                  Licensed & Insured
                </p>
              </div>
            </div>
            
            <p className="text-text-secondary mt-6 max-w-2xl mx-auto">
              If we don't meet our response time guarantee, your service call fee is waived. 
              Your pool emergency is our priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianAvailability;