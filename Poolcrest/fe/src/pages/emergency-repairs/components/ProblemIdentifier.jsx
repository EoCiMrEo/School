import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProblemIdentifier = ({ onProblemSelect }) => {
  const [selectedProblem, setSelectedProblem] = useState(null);

  const problems = [
    {
      id: 'water-issues',
      title: 'Water Problems',
      description: 'Green, cloudy, or discolored water',
      icon: 'Droplets',
      color: 'bg-emerald-500',
      urgency: 'High',
      immediateSteps: [
        'Stop swimming immediately',
        'Turn off pool equipment',
        'Take photos for our technician'
      ],
      commonCauses: ['Chemical imbalance', 'Algae growth', 'Filtration issues']
    },
    {
      id: 'equipment-failure',
      title: 'Equipment Failure',
      description: 'Pump, filter, or heater not working',
      icon: 'Settings',
      color: 'bg-blue-500',
      urgency: 'Critical',
      immediateSteps: [
        'Turn off main power to equipment',
        'Check for visible damage',
        'Note any unusual sounds or smells'
      ],
      commonCauses: ['Motor failure', 'Electrical issues', 'Wear and tear']
    },
    {
      id: 'safety-hazards',
      title: 'Safety Hazards',
      description: 'Broken tiles, sharp edges, or structural damage',
      icon: 'AlertTriangle',
      color: 'bg-red-500',
      urgency: 'Critical',
      immediateSteps: [
        'Keep everyone out of the pool',
        'Mark hazardous areas',
        'Call us immediately'
      ],
      commonCauses: ['Weather damage', 'Age-related wear', 'Impact damage']
    },
    {
      id: 'chemical-emergency',
      title: 'Chemical Issues',
      description: 'Burning eyes, skin irritation, or strong odors',
      icon: 'Beaker',
      color: 'bg-orange-500',
      urgency: 'High',
      immediateSteps: [
        'Exit pool immediately',
        'Rinse with fresh water',
        'Ventilate the area'
      ],
      commonCauses: ['Over-chlorination', 'pH imbalance', 'Chemical mixing errors']
    }
  ];

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    onProblemSelect(problem);
  };

  return (
    <div className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            What's Your Pool Emergency?
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Select your issue below for immediate guidance and to expedite our response
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className={`card p-6 cursor-pointer transition-smooth hover-lift ${
                selectedProblem?.id === problem.id 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleProblemSelect(problem)}
            >
              <div className="text-center">
                <div className={`w-16 h-16 ${problem.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon name={problem.icon} size={32} className="text-white" />
                </div>
                
                <h3 className="text-xl font-inter font-semibold text-text-primary mb-2">
                  {problem.title}
                </h3>
                
                <p className="text-text-secondary mb-4">
                  {problem.description}
                </p>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  problem.urgency === 'Critical' ?'bg-error-100 text-error-700' :'bg-warning-100 text-warning-700'
                }`}>
                  <Icon name="Clock" size={14} className="mr-1" />
                  {problem.urgency} Priority
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedProblem && (
          <div className="card p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-inter font-bold text-text-primary mb-4 flex items-center">
                  <Icon name="AlertCircle" size={24} className="text-warning mr-2" />
                  Immediate Steps
                </h3>
                <ul className="space-y-3">
                  {selectedProblem.immediateSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="text-text-primary">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-inter font-bold text-text-primary mb-4 flex items-center">
                  <Icon name="Info" size={24} className="text-secondary mr-2" />
                  Common Causes
                </h3>
                <ul className="space-y-3">
                  {selectedProblem.commonCauses.map((cause, index) => (
                    <li key={index} className="flex items-center">
                      <Icon name="ChevronRight" size={16} className="text-text-secondary mr-2" />
                      <span className="text-text-primary">{cause}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 p-4 bg-warning-50 rounded-lg border border-warning-200">
                  <p className="text-warning-800 font-medium flex items-center">
                    <Icon name="AlertTriangle" size={16} className="mr-2" />
                    Professional Help Recommended
                  </p>
                  <p className="text-warning-700 text-sm mt-1">
                    While these steps help immediately, professional diagnosis ensures proper resolution and prevents recurring issues.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button
                variant="primary"
                size="lg"
                iconName="Phone"
                iconPosition="left"
                className="font-inter font-semibold"
                onClick={() => window.location.href = 'tel:+15559111POOL'}
              >
                Get Professional Help Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemIdentifier;