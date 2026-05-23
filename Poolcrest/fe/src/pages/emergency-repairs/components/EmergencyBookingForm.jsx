import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const EmergencyBookingForm = ({ selectedProblem }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    poolType: '',
    issueDescription: '',
    preferredTime: '',
    photos: null,
    urgencyLevel: 'high'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const poolTypes = [
    'In-ground Chlorine',
    'In-ground Saltwater',
    'Above-ground Chlorine',
    'Above-ground Saltwater',
    'Hot Tub/Spa',
    'Natural/Eco Pool'
  ];

  const timeSlots = [
    'ASAP (Within 2 hours)',
    'Today (Within 4 hours)',
    'Tomorrow Morning',
    'Tomorrow Afternoon',
    'Within 48 hours'
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  if (submitSuccess) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={40} className="text-success-600" />
          </div>
          
          <h2 className="text-3xl font-inter font-bold text-text-primary mb-4">
            Emergency Service Booked!
          </h2>
          
          <p className="text-lg text-text-secondary mb-6">
            Your emergency service request has been received. Our dispatch team will contact you within 15 minutes to confirm details and provide technician ETA.
          </p>
          
          <div className="card p-6 mb-8">
            <h3 className="text-xl font-inter font-semibold text-text-primary mb-4">
              What Happens Next:
            </h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Immediate Confirmation</p>
                  <p className="text-text-secondary text-sm">Dispatch call within 15 minutes</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Technician Dispatch</p>
                  <p className="text-text-secondary text-sm">Licensed professional en route</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Problem Resolution</p>
                  <p className="text-text-secondary text-sm">Expert diagnosis and repair</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              iconName="Phone"
              iconPosition="left"
              onClick={() => window.location.href = 'tel:+15559111POOL'}
            >
              Call for Updates
            </Button>
            <Button
              variant="secondary"
              iconName="Home"
              iconPosition="left"
              onClick={() => window.location.href = '/homepage'}
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Book Emergency Service
          </h2>
          <p className="text-lg text-text-secondary">
            Fill out this form for fastest response. Our dispatch team will contact you immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-inter font-semibold text-text-primary flex items-center">
                <Icon name="User" size={20} className="mr-2" />
                Contact Information
              </h3>
              
              <Input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full"
              />
              
              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full"
              />
              
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full"
              />
              
              <Input
                type="text"
                name="address"
                placeholder="Pool Address *"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            {/* Pool & Issue Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-inter font-semibold text-text-primary flex items-center">
                <Icon name="Waves" size={20} className="mr-2" />
                Pool Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Pool Type *
                </label>
                <select
                  name="poolType"
                  value={formData.poolType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Pool Type</option>
                  {poolTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Preferred Response Time *
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select Time Frame</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Upload Photos (Optional)
                </label>
                <Input
                  type="file"
                  name="photos"
                  accept="image/*"
                  multiple
                  onChange={handleInputChange}
                  className="w-full"
                />
                <p className="text-sm text-text-secondary mt-1">
                  Photos help our technicians prepare the right tools and parts
                </p>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Describe the Problem *
            </label>
            <textarea
              name="issueDescription"
              value={formData.issueDescription}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder={selectedProblem ? 
                `Describe your ${selectedProblem.title.toLowerCase()} issue in detail...` : 
                "Please describe the emergency situation, what you've observed, and any immediate safety concerns..."
              }
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          {/* Urgency Level */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-primary mb-3">
              Urgency Level
            </label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'critical', label: 'Critical - Safety Risk', color: 'error' },
                { value: 'high', label: 'High - Pool Unusable', color: 'warning' },
                { value: 'medium', label: 'Medium - Needs Attention', color: 'secondary' }
              ].map((level) => (
                <label key={level.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="urgencyLevel"
                    value={level.value}
                    checked={formData.urgencyLevel === level.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                    formData.urgencyLevel === level.value
                      ? `bg-${level.color} border-${level.color}`
                      : 'border-border'
                  }`}>
                    {formData.urgencyLevel === level.value && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <span className="text-text-primary">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <Button
              type="submit"
              variant="primary"
              size="xl"
              iconName="Send"
              iconPosition="left"
              loading={isSubmitting}
              className="font-inter font-bold px-12 py-4"
            >
              {isSubmitting ? 'Submitting Emergency Request...' : 'Submit Emergency Request'}
            </Button>
            
            <p className="text-sm text-text-secondary mt-4">
              By submitting this form, you agree to our emergency service terms. 
              Our dispatch team will contact you within 15 minutes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyBookingForm;