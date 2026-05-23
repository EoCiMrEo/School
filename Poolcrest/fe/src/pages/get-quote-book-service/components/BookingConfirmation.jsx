import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const BookingConfirmation = ({ bookingData, onNewBooking }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mock technician data based on booking
  const assignedTechnician = {
    name: "Mike Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    phone: "(555) 123-4567",
    email: "mike.rodriguez@poolcrestpro.com",
    rating: 4.9,
    experience: "8 years"
  };

  const preparationSteps = [
    {
      icon: "Key",
      title: "Ensure Property Access",
      description: "Make sure gates are unlocked and our technician can access your pool area"
    },
    {
      icon: "Car",
      title: "Clear Parking Space",
      description: "Provide a parking spot close to your pool for our service vehicle"
    },
    {
      icon: "Dog",
      title: "Secure Pets",
      description: "Please secure any pets that might interfere with the service"
    },
    {
      icon: "Zap",
      title: "Pool Equipment Access",
      description: "Ensure our technician can access all pool equipment and electrical panels"
    }
  ];

  const nextSteps = [
    {
      icon: "Mail",
      title: "Confirmation Email",
      description: "You\'ll receive a detailed confirmation email within 5 minutes",
      status: "pending"
    },
    {
      icon: "Phone",
      title: "Pre-Service Call",
      description: "Our technician will call 30 minutes before arrival",
      status: "scheduled"
    },
    {
      icon: "Wrench",
      title: "Service Completion",
      description: "Professional service with detailed report and recommendations",
      status: "scheduled"
    },
    {
      icon: "Star",
      title: "Follow-up",
      description: "We\'ll follow up to ensure your complete satisfaction",
      status: "scheduled"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="bg-white rounded-xl shadow-lg border border-border p-8 text-center">
        <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="CheckCircle" size={40} className="text-success" />
        </div>
        <h1 className="text-3xl font-inter font-bold text-text-primary mb-4">
          Booking Confirmed!
        </h1>
        <p className="text-lg text-text-secondary mb-6">
          Your pool service has been successfully scheduled. We're excited to help you maintain your perfect pool!
        </p>
        <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary px-4 py-2 rounded-full">
          <Icon name="Calendar" size={16} />
          <span className="font-medium">Booking ID: {bookingData.bookingId}</span>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-xl shadow-lg border border-border p-6">
        <h2 className="text-xl font-inter font-semibold text-text-primary mb-6">
          Service Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Icon name="Calendar" size={20} className="text-primary mt-1" />
              <div>
                <h3 className="font-medium text-text-primary">Scheduled Date & Time</h3>
                <p className="text-text-secondary">
                  {formatDate(bookingData.scheduledDate)} at {bookingData.scheduledTime}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Icon name="Package" size={20} className="text-primary mt-1" />
              <div>
                <h3 className="font-medium text-text-primary">Service Package</h3>
                <p className="text-text-secondary">{bookingData.quote.name}</p>
                <p className="text-sm text-text-muted">{bookingData.quote.description}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Icon name="MapPin" size={20} className="text-primary mt-1" />
              <div>
                <h3 className="font-medium text-text-primary">Service Address</h3>
                <p className="text-text-secondary">
                  {bookingData.address}<br />
                  {bookingData.city}, {bookingData.state} {bookingData.zipCode}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Icon name="DollarSign" size={20} className="text-primary mt-1" />
              <div>
                <h3 className="font-medium text-text-primary">Total Cost</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(bookingData.quote.total)}
                </p>
                <p className="text-sm text-text-muted">
                  Includes {bookingData.quote.warranty} warranty
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Icon name="User" size={20} className="text-primary mt-1" />
              <div>
                <h3 className="font-medium text-text-primary">Customer</h3>
                <p className="text-text-secondary">
                  {bookingData.firstName} {bookingData.lastName}
                </p>
                <p className="text-sm text-text-muted">{bookingData.email}</p>
                <p className="text-sm text-text-muted">{bookingData.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Technician */}
      <div className="bg-white rounded-xl shadow-lg border border-border p-6">
        <h2 className="text-xl font-inter font-semibold text-text-primary mb-6">
          Your Assigned Technician
        </h2>
        
        <div className="flex items-center space-x-4 p-4 bg-surface rounded-lg">
          <div className="relative">
            <Image
              src={assignedTechnician.avatar}
              alt={assignedTechnician.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white flex items-center justify-center">
              <Icon name="Check" size={12} color="white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-inter font-semibold text-text-primary">
              {assignedTechnician.name}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                <Icon name="Star" size={14} className="text-accent fill-current" />
                <span className="text-sm font-medium text-text-primary ml-1">
                  {assignedTechnician.rating}
                </span>
              </div>
              <span className="text-sm text-text-secondary">
                • {assignedTechnician.experience} experience
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <a
                href={`tel:${assignedTechnician.phone}`}
                className="flex items-center space-x-1 text-primary hover:underline"
              >
                <Icon name="Phone" size={14} />
                <span>{assignedTechnician.phone}</span>
              </a>
              <a
                href={`mailto:${assignedTechnician.email}`}
                className="flex items-center space-x-1 text-primary hover:underline"
              >
                <Icon name="Mail" size={14} />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Preparation Steps */}
      <div className="bg-white rounded-xl shadow-lg border border-border p-6">
        <h2 className="text-xl font-inter font-semibold text-text-primary mb-6">
          Prepare for Your Service
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preparationSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-surface rounded-lg">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={step.icon} size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-1">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-xl shadow-lg border border-border p-6">
        <h2 className="text-xl font-inter font-semibold text-text-primary mb-6">
          What Happens Next
        </h2>
        
        <div className="space-y-4">
          {nextSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.status === 'pending' ?'bg-accent text-accent-foreground' :'bg-surface text-text-secondary'
              }`}>
                <Icon name={step.icon} size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </div>
              {step.status === 'pending' && (
                <div className="flex items-center space-x-1 text-accent text-sm font-medium">
                  <Icon name="Clock" size={14} />
                  <span>In Progress</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-lg border border-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="primary"
            size="lg"
            iconName="Calendar"
            iconPosition="left"
            className="flex-1"
            onClick={() => window.print()}
          >
            Print Confirmation
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            iconName="Plus"
            iconPosition="left"
            className="flex-1"
            onClick={onNewBooking}
          >
            Book Another Service
          </Button>
          
          <Button
            variant="success"
            size="lg"
            iconName="Phone"
            iconPosition="left"
            className="flex-1"
            onClick={() => window.location.href = 'tel:+1234567890'}
          >
            Contact Support
          </Button>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-warning-50 border border-warning-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={24} className="text-warning mt-1" />
          <div>
            <h3 className="font-inter font-semibold text-warning-800 mb-2">
              Need to Make Changes or Have an Emergency?
            </h3>
            <p className="text-warning-700 mb-4">
              If you need to reschedule, cancel, or have an urgent pool emergency before your scheduled service, please contact us immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="warning"
                size="sm"
                iconName="Phone"
                iconPosition="left"
                onClick={() => window.location.href = 'tel:+1234567890'}
              >
                Emergency: (555) 123-4567
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Mail"
                iconPosition="left"
                onClick={() => window.location.href = 'mailto:support@poolcrestpro.com'}
              >
                Email Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;