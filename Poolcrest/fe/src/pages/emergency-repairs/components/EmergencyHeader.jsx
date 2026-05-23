import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmergencyHeader = ({ onCallNow, onBookEmergency }) => {
  return (
    <div className="bg-gradient-to-br from-error-500 via-error-600 to-error-700 text-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-glass">
              <Icon name="AlertTriangle" size={40} className="text-white animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-inter font-bold mb-4">
            Pool Emergency?
          </h1>
          <p className="text-xl lg:text-2xl font-inter font-medium mb-2 opacity-90">
            We're Here to Help 24/7
          </p>
          <p className="text-lg lg:text-xl opacity-80 mb-8 max-w-3xl mx-auto">
            Don't let pool problems ruin your day. Our certified technicians respond quickly to restore your pool's safety and functionality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="warning"
              size="xl"
              iconName="Phone"
              iconPosition="left"
              className="emergency-glow font-inter font-bold text-lg px-8 py-4 min-w-[200px]"
              onClick={onCallNow}
            >
              Call Now: (555) 911-POOL
            </Button>
            
            <Button
              variant="secondary"
              size="xl"
              iconName="Calendar"
              iconPosition="left"
              className="font-inter font-bold text-lg px-8 py-4 min-w-[200px] bg-white text-primary hover:bg-gray-50"
              onClick={onBookEmergency}
            >
              Book Emergency Service
            </Button>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={16} />
              <span>24-Hour Response</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={16} />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              <span>Family Safety Priority</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyHeader;