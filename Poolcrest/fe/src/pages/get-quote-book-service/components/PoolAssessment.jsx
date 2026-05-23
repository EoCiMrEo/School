import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const PoolAssessment = ({ assessmentData, onAssessmentChange }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const assessmentSteps = [
    {
      title: "Pool Basics",
      icon: "Waves",
      fields: [
        {
          key: "poolType",
          label: "Pool Type",
          type: "select",
          options: [
            { value: "inground", label: "In-Ground Pool" },
            { value: "aboveground", label: "Above-Ground Pool" },
            { value: "infinity", label: "Infinity Pool" },
            { value: "spa", label: "Spa/Hot Tub" }
          ]
        },
        {
          key: "poolSize",
          label: "Pool Size",
          type: "select",
          options: [
            { value: "small", label: "Small (up to 15,000 gallons)" },
            { value: "medium", label: "Medium (15,000 - 25,000 gallons)" },
            { value: "large", label: "Large (25,000 - 40,000 gallons)" },
            { value: "xlarge", label: "Extra Large (40,000+ gallons)" }
          ]
        },
        {
          key: "poolAge",
          label: "Pool Age",
          type: "select",
          options: [
            { value: "new", label: "Less than 2 years" },
            { value: "recent", label: "2-5 years" },
            { value: "established", label: "5-10 years" },
            { value: "mature", label: "10-20 years" },
            { value: "vintage", label: "Over 20 years" }
          ]
        }
      ]
    },
    {
      title: "Current Condition",
      icon: "CheckCircle",
      fields: [
        {
          key: "waterCondition",
          label: "Current Water Condition",
          type: "select",
          options: [
            { value: "crystal-clear", label: "Crystal Clear" },
            { value: "slightly-cloudy", label: "Slightly Cloudy" },
            { value: "very-cloudy", label: "Very Cloudy" },
            { value: "green-algae", label: "Green/Algae Present" },
            { value: "black-algae", label: "Black Algae Present" }
          ]
        },
        {
          key: "lastService",
          label: "Last Professional Service",
          type: "select",
          options: [
            { value: "this-week", label: "This Week" },
            { value: "this-month", label: "This Month" },
            { value: "3-months", label: "2-3 Months Ago" },
            { value: "6-months", label: "3-6 Months Ago" },
            { value: "over-6-months", label: "Over 6 Months Ago" },
            { value: "never", label: "Never" }
          ]
        },
        {
          key: "knownIssues",
          label: "Known Issues",
          type: "checkbox-group",
          options: [
            { value: "pump-problems", label: "Pump Problems" },
            { value: "filter-issues", label: "Filter Issues" },
            { value: "heater-problems", label: "Heater Problems" },
            { value: "leak-suspected", label: "Suspected Leak" },
            { value: "equipment-old", label: "Old Equipment" },
            { value: "chemical-imbalance", label: "Chemical Imbalance" }
          ]
        }
      ]
    },
    {
      title: "Equipment & Features",
      icon: "Settings",
      fields: [
        {
          key: "poolEquipment",
          label: "Pool Equipment",
          type: "checkbox-group",
          options: [
            { value: "automatic-cleaner", label: "Automatic Pool Cleaner" },
            { value: "pool-heater", label: "Pool Heater" },
            { value: "salt-system", label: "Salt Water System" },
            { value: "pool-cover", label: "Pool Cover" },
            { value: "lighting", label: "Pool Lighting" },
            { value: "water-features", label: "Water Features" }
          ]
        },
        {
          key: "filterType",
          label: "Filter Type",
          type: "select",
          options: [
            { value: "sand", label: "Sand Filter" },
            { value: "cartridge", label: "Cartridge Filter" },
            { value: "de", label: "Diatomaceous Earth (DE)" },
            { value: "unknown", label: "Not Sure" }
          ]
        },
        {
          key: "accessConcerns",
          label: "Property Access",
          type: "checkbox-group",
          options: [
            { value: "locked-gate", label: "Locked Gate/Fence" },
            { value: "narrow-access", label: "Narrow Side Yard" },
            { value: "stairs-required", label: "Stairs Required" },
            { value: "dog-present", label: "Dog on Property" },
            { value: "security-system", label: "Security System" }
          ]
        }
      ]
    },
    {
      title: "Service Preferences",
      icon: "Calendar",
      fields: [
        {
          key: "serviceUrgency",
          label: "Service Urgency",
          type: "select",
          options: [
            { value: "emergency", label: "Emergency (Within 24 hours)" },
            { value: "urgent", label: "Urgent (Within 3 days)" },
            { value: "soon", label: "Soon (Within 1 week)" },
            { value: "flexible", label: "Flexible (Within 2 weeks)" }
          ]
        },
        {
          key: "preferredDays",
          label: "Preferred Service Days",
          type: "checkbox-group",
          options: [
            { value: "monday", label: "Monday" },
            { value: "tuesday", label: "Tuesday" },
            { value: "wednesday", label: "Wednesday" },
            { value: "thursday", label: "Thursday" },
            { value: "friday", label: "Friday" },
            { value: "saturday", label: "Saturday" }
          ]
        },
        {
          key: "preferredTime",
          label: "Preferred Time",
          type: "select",
          options: [
            { value: "morning", label: "Morning (8 AM - 12 PM)" },
            { value: "afternoon", label: "Afternoon (12 PM - 4 PM)" },
            { value: "evening", label: "Evening (4 PM - 6 PM)" },
            { value: "flexible", label: "Flexible" }
          ]
        }
      ]
    }
  ];

  const handleFieldChange = (fieldKey, value) => {
    onAssessmentChange({
      ...assessmentData,
      [fieldKey]: value
    });
  };

  const handleNext = () => {
    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderField = (field) => {
    const value = assessmentData[field.key] || (field.type === 'checkbox-group' ? [] : '');

    switch (field.type) {
      case 'select':
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              {field.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth"
            >
              <option value="">Select {field.label}</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox-group':
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-3">
              {field.label}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {field.options.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFieldChange(field.key, [...value, option.value]);
                      } else {
                        handleFieldChange(field.key, value.filter(v => v !== option.value));
                      }
                    }}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-text-primary">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              {field.label}
            </label>
            <Input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className="w-full"
            />
          </div>
        );
    }
  };

  const currentStepData = assessmentSteps[currentStep];
  const progress = ((currentStep + 1) / assessmentSteps.length) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-inter font-semibold text-text-primary">
            Pool Assessment
          </h3>
          <div className="text-sm text-text-secondary">
            Step {currentStep + 1} of {assessmentSteps.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-surface rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-6">
          {assessmentSteps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-surface text-text-muted'
              }`}>
                {index < currentStep ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <Icon name={step.icon} size={16} />
                )}
              </div>
              <span className="text-xs font-medium text-center hidden sm:block">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Icon name={currentStepData.icon} size={20} className="text-primary" />
          </div>
          <h4 className="text-lg font-inter font-semibold text-text-primary">
            {currentStepData.title}
          </h4>
        </div>

        <div className="space-y-4">
          {currentStepData.fields.map(renderField)}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          iconName="ChevronLeft"
          iconPosition="left"
        >
          Previous
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={currentStep === assessmentSteps.length - 1}
          iconName="ChevronRight"
          iconPosition="right"
        >
          {currentStep === assessmentSteps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default PoolAssessment;