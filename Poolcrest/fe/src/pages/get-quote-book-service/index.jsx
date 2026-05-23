import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ServiceSelector from './components/ServiceSelector';
import PoolAssessment from './components/PoolAssessment';
import SchedulingCalendar from './components/SchedulingCalendar';
import QuoteCalculator from './components/QuoteCalculator';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';

const GetQuoteBookService = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [assessmentData, setAssessmentData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [quoteOptions, setQuoteOptions] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Select Services', icon: 'Package', description: 'Choose your pool services' },
    { id: 2, title: 'Pool Assessment', icon: 'CheckCircle', description: 'Tell us about your pool' },
    { id: 3, title: 'Get Quote', icon: 'Calculator', description: 'View pricing options' },
    { id: 4, title: 'Schedule Service', icon: 'Calendar', description: 'Pick date and time' },
    { id: 5, title: 'Book & Pay', icon: 'CreditCard', description: 'Complete your booking' }
  ];

  // Auto-advance to quote step when services are selected and assessment is complete
  useEffect(() => {
    if (selectedServices.length > 0 && Object.keys(assessmentData).length > 5 && currentStep < 3) {
      setCurrentStep(3);
    }
  }, [selectedServices, assessmentData, currentStep]);

  // Auto-advance to scheduling when quote is selected
  useEffect(() => {
    if (selectedQuote && currentStep < 4) {
      setCurrentStep(4);
    }
  }, [selectedQuote, currentStep]);

  const handleServiceChange = (services) => {
    setSelectedServices(services);
    if (services.length === 0) {
      setCurrentStep(1);
      setSelectedQuote(null);
    }
  };

  const handleAssessmentChange = (data) => {
    setAssessmentData(data);
  };

  const handleQuoteUpdate = (quotes) => {
    setQuoteOptions(quotes);
    // Auto-select the popular option
    const popularQuote = quotes.find(q => q.popular);
    if (popularQuote && !selectedQuote) {
      setSelectedQuote(popularQuote);
    }
  };

  const handleQuoteSelect = (quote) => {
    setSelectedQuote(quote);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const handleBookingSubmit = async (booking) => {
    setIsLoading(true);
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBookingData(booking);
      setCurrentStep(6); // Confirmation step
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewBooking = () => {
    setCurrentStep(1);
    setSelectedServices([]);
    setAssessmentData({});
    setSelectedDate(null);
    setSelectedTime('');
    setQuoteOptions([]);
    setSelectedQuote(null);
    setBookingData(null);
  };

  const canProceedToStep = (stepId) => {
    switch (stepId) {
      case 1:
        return true;
      case 2:
        return selectedServices.length > 0;
      case 3:
        return selectedServices.length > 0 && Object.keys(assessmentData).length > 3;
      case 4:
        return selectedQuote !== null;
      case 5:
        return selectedDate && selectedTime && selectedQuote;
      default:
        return false;
    }
  };

  const handleStepClick = (stepId) => {
    if (canProceedToStep(stepId) && stepId <= currentStep + 1) {
      setCurrentStep(stepId);
    }
  };

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    if (canProceedToStep(stepId)) return 'available';
    return 'disabled';
  };

  // If booking is confirmed, show confirmation page
  if (bookingData) {
    return (
      <>
        <Helmet>
          <title>Booking Confirmed - Poolcrest Pro</title>
          <meta name="description" content="Your pool service booking has been confirmed. View your booking details and prepare for your scheduled service." />
        </Helmet>
        <div className="min-h-screen bg-surface">
          <Header />
          <main className="pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <BookingConfirmation 
                bookingData={bookingData}
                onNewBooking={handleNewBooking}
              />
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Get Quote & Book Service - Poolcrest Pro</title>
        <meta name="description" content="Get an instant quote and book professional pool services. Choose from maintenance, repairs, and seasonal services with transparent pricing and expert technicians." />
        <meta name="keywords" content="pool service quote, book pool maintenance, pool repair booking, pool service scheduling" />
      </Helmet>

      <div className="min-h-screen bg-surface">
        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-inter font-bold text-text-primary mb-6">
                Get Your Pool Service Quote
              </h1>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
                Professional pool services with transparent pricing, expert technicians, and guaranteed satisfaction. 
                Get your personalized quote in minutes and schedule service at your convenience.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Icon name="Shield" size={16} className="text-success" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Star" size={16} className="text-accent" />
                  <span>4.9/5 Customer Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} className="text-primary" />
                  <span>Same-Day Service Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-4 overflow-x-auto pb-4">
                  {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    const isClickable = canProceedToStep(step.id) && step.id <= currentStep + 1;
                    
                    return (
                      <div key={step.id} className="flex items-center">
                        <button
                          onClick={() => handleStepClick(step.id)}
                          disabled={!isClickable}
                          className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-smooth min-w-0 ${
                            isClickable ? 'hover:bg-surface-100 cursor-pointer' : 'cursor-not-allowed'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-smooth ${
                            status === 'completed' 
                              ? 'bg-success text-success-foreground' 
                              : status === 'current' ?'bg-primary text-primary-foreground'
                              : status === 'available' ?'bg-surface-200 text-text-primary hover:bg-primary-100' :'bg-surface-100 text-text-muted'
                          }`}>
                            {status === 'completed' ? (
                              <Icon name="Check" size={20} />
                            ) : (
                              <Icon name={step.icon} size={20} />
                            )}
                          </div>
                          <div className="text-center">
                            <div className={`text-sm font-medium ${
                              status === 'current' ? 'text-primary' : 'text-text-primary'
                            }`}>
                              {step.title}
                            </div>
                            <div className="text-xs text-text-secondary hidden sm:block">
                              {step.description}
                            </div>
                          </div>
                        </button>
                        
                        {index < steps.length - 1 && (
                          <div className={`w-8 h-0.5 mx-2 ${
                            step.id < currentStep ? 'bg-success' : 'bg-surface-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="max-w-6xl mx-auto">
              {currentStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <ServiceSelector
                      selectedServices={selectedServices}
                      onServiceChange={handleServiceChange}
                    />
                  </div>
                  <div className="space-y-6">
                    <PoolAssessment
                      assessmentData={assessmentData}
                      onAssessmentChange={handleAssessmentChange}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <PoolAssessment
                      assessmentData={assessmentData}
                      onAssessmentChange={handleAssessmentChange}
                    />
                  </div>
                  <div>
                    <ServiceSelector
                      selectedServices={selectedServices}
                      onServiceChange={handleServiceChange}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <QuoteCalculator
                    selectedServices={selectedServices}
                    assessmentData={assessmentData}
                    onQuoteUpdate={handleQuoteUpdate}
                  />
                  
                  {quoteOptions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {quoteOptions.map((quote) => (
                        <button
                          key={quote.id}
                          onClick={() => handleQuoteSelect(quote)}
                          className={`p-4 rounded-lg border transition-smooth text-left ${
                            selectedQuote?.id === quote.id
                              ? 'border-primary bg-primary-50 shadow-md'
                              : 'border-border hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-text-primary">{quote.name}</h3>
                            {selectedQuote?.id === quote.id && (
                              <Icon name="Check" size={16} className="text-primary" />
                            )}
                          </div>
                          <div className="text-2xl font-bold text-primary mb-2">
                            ${quote.total.toLocaleString()}
                          </div>
                          <p className="text-sm text-text-secondary">{quote.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <SchedulingCalendar
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateChange={handleDateChange}
                    onTimeChange={handleTimeChange}
                  />
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-8">
                  <BookingForm
                    selectedQuote={selectedQuote}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onBookingSubmit={handleBookingSubmit}
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {currentStep < 5 && (
              <div className="flex justify-between mt-12 max-w-6xl mx-auto">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  iconName="ChevronLeft"
                  iconPosition="left"
                >
                  Previous
                </Button>

                <Button
                  variant="primary"
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  disabled={!canProceedToStep(currentStep + 1)}
                  iconName="ChevronRight"
                  iconPosition="right"
                >
                  {currentStep === 4 ? 'Review & Book' : 'Continue'}
                </Button>
              </div>
            )}

            {/* Emergency Service CTA */}
            <div className="mt-16 bg-warning-50 border border-warning-200 rounded-xl p-8 text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Icon name="AlertTriangle" size={32} className="text-warning" />
              </div>
              <h3 className="text-2xl font-inter font-bold text-warning-800 mb-4">
                Need Emergency Pool Service?
              </h3>
              <p className="text-warning-700 mb-6 max-w-2xl mx-auto">
                Don't wait for regular booking if you have a pool emergency. Our emergency response team is available 24/7 for urgent issues like equipment failures, green pools, or safety concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="warning"
                  size="lg"
                  iconName="Phone"
                  iconPosition="left"
                  className="emergency-glow"
                  onClick={() => window.location.href = 'tel:+1234567890'}
                >
                  Call Emergency Line: (555) 123-4567
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  iconName="MessageSquare"
                  iconPosition="left"
                  onClick={() => window.location.href = 'sms:+1234567890'}
                >
                  Text Emergency
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Processing Your Booking
              </h3>
              <p className="text-text-secondary">
                Please wait while we confirm your service appointment...
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GetQuoteBookService;