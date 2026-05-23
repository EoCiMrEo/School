import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CustomerSuccessStories = () => {
  const [selectedStory, setSelectedStory] = useState(0);

  const successStories = [
    {
      id: 1,
      customerName: "The Johnson Family",
      location: "Westfield Neighborhood",
      issue: "Green Pool Emergency",
      urgency: "High Priority",
      responseTime: "1 hour 15 minutes",
      beforeImage: "https://images.pexels.com/photos/2343465/pexels-photo-2343465.jpeg?auto=compress&cs=tinysrgb&w=600",
      afterImage: "https://images.pexels.com/photos/1166644/pexels-photo-1166644.jpeg?auto=compress&cs=tinysrgb&w=600",
      customerPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      testimonial: `"Our pool turned completely green overnight before our daughter's birthday party. We were devastated! Poolcrest Pro responded within an hour and had our pool crystal clear by the next morning. The kids had their party as planned, and we couldn't be more grateful. Mike was professional, explained everything clearly, and even gave us tips to prevent this from happening again."`,
      problemDescription: "Severe algae bloom caused by equipment failure during vacation",
      solutionSteps: [
        "Emergency chemical shock treatment",
        "Pump and filter system repair",
        "24-hour filtration and monitoring",
        "Final water balance and safety check"
      ],
      timeToResolution: "18 hours",
      cost: "$285",
      rating: 5,
      date: "March 2024"
    },
    {
      id: 2,
      customerName: "Maria & Carlos Rodriguez",
      location: "Oak Hills Community",
      issue: "Pump Motor Failure",
      urgency: "Critical",
      responseTime: "45 minutes",
      beforeImage: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=600",
      afterImage: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=600",
      customerPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      testimonial: `"The pump motor died on a Friday evening, and we had family coming for the weekend. Sarah arrived quickly, diagnosed the problem, and had a replacement motor installed the same night. She even stayed late to make sure everything was running perfectly. Our pool was ready for the family gathering, and everyone was impressed with the crystal-clear water."`,
      problemDescription: "Complete motor failure with burning smell and electrical issues",
      solutionSteps: [
        "Emergency electrical safety assessment",
        "Motor replacement with upgraded model",
        "System testing and calibration",
        "Safety inspection and certification"
      ],
      timeToResolution: "4 hours",
      cost: "$425",
      rating: 5,
      date: "February 2024"
    },
    {
      id: 3,
      customerName: "The Thompson Family",
      location: "Riverside Estates",
      issue: "Chemical Burn Emergency",
      urgency: "Critical Safety",
      responseTime: "30 minutes",
      beforeImage: "https://images.pexels.com/photos/2343465/pexels-photo-2343465.jpeg?auto=compress&cs=tinysrgb&w=600",
      afterImage: "https://images.pexels.com/photos/1166644/pexels-photo-1166644.jpeg?auto=compress&cs=tinysrgb&w=600",
      customerPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      testimonial: `"We accidentally over-chlorinated our pool, and the kids got chemical burns. David arrived within 30 minutes, immediately neutralized the water, and made sure it was safe. He explained what went wrong and set up a foolproof system so it won't happen again. His quick response prevented a serious family emergency from getting worse."`,
      problemDescription: "Severe over-chlorination causing skin and eye irritation",
      solutionSteps: [
        "Immediate water neutralization",
        "Complete chemical rebalancing",
        "Safety equipment installation",
        "Family safety education session"
      ],
      timeToResolution: "3 hours",
      cost: "$195",
      rating: 5,
      date: "January 2024"
    }
  ];

  const currentStory = successStories[selectedStory];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Real Emergency Success Stories
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            See how we've helped families restore their pool safety and enjoyment during critical emergencies
          </p>
        </div>

        {/* Story Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {successStories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(index)}
              className={`px-4 py-2 rounded-lg font-inter font-medium transition-smooth ${
                selectedStory === index
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-surface text-text-primary hover:bg-primary-100'
              }`}
            >
              {story.customerName}
            </button>
          ))}
        </div>

        {/* Featured Story */}
        <div className="card p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Story Details */}
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src={currentStory.customerPhoto}
                  alt={currentStory.customerName}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-xl font-inter font-semibold text-text-primary">
                    {currentStory.customerName}
                  </h3>
                  <p className="text-text-secondary flex items-center">
                    <Icon name="MapPin" size={14} className="mr-1" />
                    {currentStory.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-error-50 rounded-lg">
                  <p className="text-sm font-medium text-error-700">Emergency Type</p>
                  <p className="text-lg font-inter font-semibold text-error-800">
                    {currentStory.issue}
                  </p>
                </div>
                <div className="text-center p-3 bg-success-50 rounded-lg">
                  <p className="text-sm font-medium text-success-700">Response Time</p>
                  <p className="text-lg font-inter font-semibold text-success-800">
                    {currentStory.responseTime}
                  </p>
                </div>
              </div>

              <blockquote className="text-text-primary italic mb-6 p-4 bg-surface rounded-lg border-l-4 border-primary">
                {currentStory.testimonial}
              </blockquote>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {[...Array(currentStory.rating)].map((_, i) => (
                    <Icon key={i} name="Star" size={20} className="text-accent mr-1" />
                  ))}
                  <span className="ml-2 text-text-secondary">
                    {currentStory.rating}/5 Stars
                  </span>
                </div>
                <div className="text-text-secondary text-sm">
                  {currentStory.date}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-text-primary mb-1">Resolution Time</p>
                  <p className="text-text-secondary">{currentStory.timeToResolution}</p>
                </div>
                <div>
                  <p className="font-medium text-text-primary mb-1">Total Cost</p>
                  <p className="text-primary font-semibold">{currentStory.cost}</p>
                </div>
              </div>
            </div>

            {/* Before/After Images */}
            <div>
              <h4 className="text-lg font-inter font-semibold text-text-primary mb-4">
                Before & After
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-text-primary mb-2">Before</p>
                  <div className="relative overflow-hidden rounded-lg h-48">
                    <Image
                      src={currentStory.beforeImage}
                      alt="Pool before repair"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-error text-white px-2 py-1 rounded text-xs font-medium">
                      Emergency
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-text-primary mb-2">After</p>
                  <div className="relative overflow-hidden rounded-lg h-48">
                    <Image
                      src={currentStory.afterImage}
                      alt="Pool after repair"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-success text-white px-2 py-1 rounded text-xs font-medium">
                      Restored
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-surface p-4">
                <h5 className="font-inter font-semibold text-text-primary mb-3">
                  Solution Steps
                </h5>
                <ol className="space-y-2">
                  {currentStory.solutionSteps.map((step, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-text-secondary">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-inter font-bold text-primary mb-2">98%</div>
            <p className="text-text-secondary">Same-Day Resolution</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-inter font-bold text-primary mb-2">&lt; 2hrs</div>
            <p className="text-text-secondary">Average Response Time</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-inter font-bold text-primary mb-2">4.9/5</div>
            <p className="text-text-secondary">Customer Satisfaction</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-inter font-bold text-primary mb-2">500+</div>
            <p className="text-text-secondary">Emergencies Resolved</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="card p-8 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
            <h3 className="text-2xl font-inter font-bold text-text-primary mb-4">
              Need Emergency Pool Service?
            </h3>
            <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
              Don't let pool problems ruin your family's plans. Our emergency response team 
              is standing by to restore your pool's safety and functionality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="warning"
                size="lg"
                iconName="Phone"
                iconPosition="left"
                className="emergency-glow font-inter font-bold"
                onClick={() => window.location.href = 'tel:+15559111POOL'}
              >
                Call Emergency Line
              </Button>
              
              <Button
                variant="primary"
                size="lg"
                iconName="Calendar"
                iconPosition="left"
                className="font-inter font-bold"
                onClick={() => window.location.href = '/get-quote-book-service'}
              >
                Book Service Online
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSuccessStories;