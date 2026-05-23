import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const BookingForm = ({ selectedQuote, selectedDate, selectedTime, onBookingSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyAccess: '',
    specialInstructions: '',
    emergencyContact: '',
    emergencyPhone: '',
    communicationPreference: 'email',
    marketingConsent: false,
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ZIP code validation
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingData = {
        ...formData,
        quote: selectedQuote,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        bookingId: `PCP-${Date.now()}`,
        status: 'confirmed'
      };
      
      onBookingSubmit(bookingData);
    } catch (error) {
      console.error('Booking submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-xl font-inter font-semibold text-text-primary mb-2">
          Complete Your Booking
        </h3>
        <p className="text-text-secondary">
          Please provide your contact information and service details to confirm your appointment.
        </p>
      </div>

      {/* Booking Summary */}
      {selectedQuote && selectedDate && selectedTime && (
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <h4 className="font-inter font-semibold text-primary-800 mb-3">
            Booking Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-primary-600 font-medium">Service Package:</span>
              <p className="text-primary-800">{selectedQuote.name}</p>
            </div>
            <div>
              <span className="text-primary-600 font-medium">Date & Time:</span>
              <p className="text-primary-800">
                {selectedDate.toLocaleDateString()} at {selectedTime}
              </p>
            </div>
            <div>
              <span className="text-primary-600 font-medium">Total Cost:</span>
              <p className="text-primary-800 font-bold">
                ${selectedQuote.total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h4 className="text-lg font-inter font-semibold text-text-primary mb-4">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                First Name *
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className={errors.firstName ? 'border-error' : ''}
              />
              {errors.firstName && (
                <p className="text-error text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Last Name *
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className={errors.lastName ? 'border-error' : ''}
              />
              {errors.lastName && (
                <p className="text-error text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={errors.email ? 'border-error' : ''}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={errors.phone ? 'border-error' : ''}
              />
              {errors.phone && (
                <p className="text-error text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Service Address */}
        <div>
          <h4 className="text-lg font-inter font-semibold text-text-primary mb-4">
            Service Address
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Street Address *
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your street address"
                className={errors.address ? 'border-error' : ''}
              />
              {errors.address && (
                <p className="text-error text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  City *
                </label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                  className={errors.city ? 'border-error' : ''}
                />
                {errors.city && (
                  <p className="text-error text-sm mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth ${
                    errors.state ? 'border-error' : 'border-border'
                  }`}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-error text-sm mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  ZIP Code *
                </label>
                <Input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="12345"
                  className={errors.zipCode ? 'border-error' : ''}
                />
                {errors.zipCode && (
                  <p className="text-error text-sm mt-1">{errors.zipCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h4 className="text-lg font-inter font-semibold text-text-primary mb-4">
            Additional Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Property Access Instructions
              </label>
              <textarea
                value={formData.propertyAccess}
                onChange={(e) => handleInputChange('propertyAccess', e.target.value)}
                placeholder="Gate codes, key location, parking instructions, etc."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Special Instructions or Concerns
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                placeholder="Any specific concerns, pool issues, or special requests..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Emergency Contact Name
                </label>
                <Input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Emergency Contact Phone
                </label>
                <Input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Communication Preferences */}
        <div>
          <h4 className="text-lg font-inter font-semibold text-text-primary mb-4">
            Communication Preferences
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Preferred Communication Method
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'email', label: 'Email', icon: 'Mail' },
                  { value: 'phone', label: 'Phone Call', icon: 'Phone' },
                  { value: 'text', label: 'Text Message', icon: 'MessageSquare' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="communicationPreference"
                      value={option.value}
                      checked={formData.communicationPreference === option.value}
                      onChange={(e) => handleInputChange('communicationPreference', e.target.value)}
                      className="w-4 h-4 text-primary border-border focus:ring-primary-500"
                    />
                    <Icon name={option.icon} size={16} className="text-text-secondary" />
                    <span className="text-sm text-text-primary">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="marketingConsent"
                checked={formData.marketingConsent}
                onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500 mt-0.5"
              />
              <label htmlFor="marketingConsent" className="text-sm text-text-primary cursor-pointer">
                I would like to receive seasonal pool care tips, maintenance reminders, and special offers from Poolcrest Pro.
              </label>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t border-border-light pt-6">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="termsAccepted"
              checked={formData.termsAccepted}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500 mt-0.5"
            />
            <label htmlFor="termsAccepted" className="text-sm text-text-primary cursor-pointer">
              I accept the{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              . I understand that a service agreement will be provided before work begins.
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="text-error text-sm mt-1 ml-6">{errors.termsAccepted}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="border-t border-border-light pt-6">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            iconName="Calendar"
            iconPosition="left"
            className="font-inter font-semibold"
          >
            {isSubmitting ? 'Confirming Booking...' : 'Confirm Booking'}
          </Button>
          
          <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Shield" size={20} className="text-success mt-0.5" />
              <div>
                <h5 className="font-inter font-semibold text-success-800 mb-1">
                  Secure Booking Process
                </h5>
                <p className="text-sm text-success-700">
                  Your information is protected with bank-level security. You'll receive a confirmation email with all service details and our technician's contact information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;