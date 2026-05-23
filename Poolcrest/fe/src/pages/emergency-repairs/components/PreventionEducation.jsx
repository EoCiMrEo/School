import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PreventionEducation = () => {
  const [activeTab, setActiveTab] = useState('prevention');

  const preventionTips = [
    {
      category: "Equipment Maintenance",
      icon: "Settings",
      tips: [
        {
          title: "Weekly Pump Inspection",
          description: "Check for unusual noises, vibrations, or leaks around the pump housing",
          frequency: "Weekly",
          difficulty: "Easy"
        },
        {
          title: "Filter Cleaning Schedule",
          description: "Clean cartridge filters every 2-4 weeks, backwash sand filters monthly",
          frequency: "Bi-weekly",
          difficulty: "Easy"
        },
        {
          title: "Skimmer Basket Maintenance",
          description: "Empty skimmer baskets weekly to prevent pump strain and equipment damage",
          frequency: "Weekly",
          difficulty: "Easy"
        }
      ]
    },
    {
      category: "Water Chemistry",
      icon: "Beaker",
      tips: [
        {
          title: "Daily Chemical Testing",
          description: "Test chlorine and pH levels daily during swimming season",
          frequency: "Daily",
          difficulty: "Easy"
        },
        {
          title: "Shock Treatment Schedule",
          description: "Shock your pool weekly or after heavy use to prevent algae growth",
          frequency: "Weekly",
          difficulty: "Moderate"
        },
        {
          title: "Alkalinity Balance",
          description: "Check total alkalinity monthly to prevent pH fluctuations",
          frequency: "Monthly",
          difficulty: "Moderate"
        }
      ]
    },
    {
      category: "Seasonal Care",
      icon: "Calendar",
      tips: [
        {
          title: "Spring Opening Checklist",
          description: "Proper opening prevents equipment damage and water quality issues",
          frequency: "Annually",
          difficulty: "Hard"
        },
        {
          title: "Winter Preparation",
          description: "Thorough winterization prevents freeze damage to equipment and plumbing",
          frequency: "Annually",
          difficulty: "Hard"
        },
        {
          title: "Storm Preparation",
          description: "Secure equipment and balance chemicals before severe weather",
          frequency: "As needed",
          difficulty: "Moderate"
        }
      ]
    }
  ];

  const emergencyScenarios = [
    {
      scenario: "Green Water Overnight",
      diyApproach: {
        canDIY: false,
        reason: "Requires professional chemical balancing and equipment inspection",
        immediateSteps: [
          "Stop swimming immediately",
          "Turn off automatic pool cleaner",
          "Take photos for technician",
          "Call professional service"
        ]
      },
      professionalNeeded: true,
      riskLevel: "High",
      consequences: "Potential health risks, equipment damage, expensive chemical costs"
    },
    {
      scenario: "Pump Making Loud Noises",
      diyApproach: {
        canDIY: false,
        reason: "Motor issues require professional diagnosis to prevent further damage",
        immediateSteps: [
          "Turn off pump immediately",
          "Check for visible obstructions",
          "Note type of noise (grinding, squealing, etc.)",
          "Call technician before restarting"
        ]
      },
      professionalNeeded: true,
      riskLevel: "Critical",
      consequences: "Complete motor failure, expensive replacement, potential electrical hazards"
    },
    {
      scenario: "Cloudy Water",
      diyApproach: {
        canDIY: true,
        reason: "Often caused by filtration or chemical imbalance",
        immediateSteps: [
          "Test water chemistry",
          "Clean or replace filter",
          "Run pump continuously for 24 hours",
          "Add clarifier if needed"
        ]
      },
      professionalNeeded: false,
      riskLevel: "Low",
      consequences: "Usually cosmetic, but can indicate underlying issues if persistent"
    },
    {
      scenario: "Equipment Electrical Issues",
      diyApproach: {
        canDIY: false,
        reason: "Electrical work around water requires licensed professional",
        immediateSteps: [
          "Turn off power at breaker",
          "Keep everyone away from equipment",
          "Check for visible damage or burning smells",
          "Call licensed electrician immediately"
        ]
      },
      professionalNeeded: true,
      riskLevel: "Critical",
      consequences: "Electrocution risk, fire hazard, equipment damage, code violations"
    }
  ];

  const warningSignsChecklist = [
    {
      category: "Equipment Warning Signs",
      signs: [
        { sign: "Unusual pump noises", urgency: "High", action: "Stop use, call professional" },
        { sign: "Reduced water flow", urgency: "Medium", action: "Check filters, inspect system" },
        { sign: "Equipment cycling on/off", urgency: "High", action: "Electrical inspection needed" },
        { sign: "Visible leaks or cracks", urgency: "High", action: "Professional assessment required" }
      ]
    },
    {
      category: "Water Quality Indicators",
      signs: [
        { sign: "Green or black water", urgency: "High", action: "Stop swimming, professional treatment" },
        { sign: "Strong chemical odors", urgency: "High", action: "Ventilate area, test chemicals" },
        { sign: "Persistent cloudiness", urgency: "Medium", action: "Filter check, chemical balance" },
        { sign: "Skin/eye irritation", urgency: "High", action: "Exit pool, test pH and chlorine" }
      ]
    }
  ];

  return (
    <div className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Pool Emergency Prevention & Education
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Learn how to prevent common pool emergencies and when to call professionals versus attempting DIY solutions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: 'prevention', label: 'Prevention Tips', icon: 'Shield' },
            { id: 'diy-vs-pro', label: 'DIY vs Professional', icon: 'Users' },
            { id: 'warning-signs', label: 'Warning Signs', icon: 'AlertTriangle' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-inter font-medium transition-smooth ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-white text-text-primary hover:bg-primary-100'
              }`}
            >
              <Icon name={tab.icon} size={20} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Prevention Tips Tab */}
        {activeTab === 'prevention' && (
          <div className="space-y-8">
            {preventionTips.map((category, index) => (
              <div key={index} className="card p-8">
                <h3 className="text-2xl font-inter font-bold text-text-primary mb-6 flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <Icon name={category.icon} size={24} className="text-primary" />
                  </div>
                  {category.category}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="card-surface p-6">
                      <h4 className="text-lg font-inter font-semibold text-text-primary mb-3">
                        {tip.title}
                      </h4>
                      
                      <p className="text-text-secondary mb-4">
                        {tip.description}
                      </p>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Icon name="Clock" size={14} className="text-text-secondary mr-1" />
                          <span className="text-text-secondary">{tip.frequency}</span>
                        </div>
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tip.difficulty === 'Easy' ? 'bg-success-100 text-success-700' :
                          tip.difficulty === 'Moderate'? 'bg-warning-100 text-warning-700' : 'bg-error-100 text-error-700'
                        }`}>
                          {tip.difficulty}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIY vs Professional Tab */}
        {activeTab === 'diy-vs-pro' && (
          <div className="space-y-8">
            <div className="card p-8">
              <h3 className="text-2xl font-inter font-bold text-text-primary mb-6 text-center">
                When to DIY vs Call a Professional
              </h3>
              
              <div className="space-y-6">
                {emergencyScenarios.map((scenario, index) => (
                  <div key={index} className="border border-border rounded-lg p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <h4 className="text-xl font-inter font-semibold text-text-primary mb-2 lg:mb-0">
                        {scenario.scenario}
                      </h4>
                      
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          scenario.riskLevel === 'Low' ? 'bg-success-100 text-success-700' :
                          scenario.riskLevel === 'Medium'? 'bg-warning-100 text-warning-700' : 'bg-error-100 text-error-700'
                        }`}>
                          {scenario.riskLevel} Risk
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          scenario.diyApproach.canDIY 
                            ? 'bg-primary-100 text-primary-700' :'bg-secondary-100 text-secondary-700'
                        }`}>
                          {scenario.diyApproach.canDIY ? 'DIY Possible' : 'Professional Required'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-inter font-semibold text-text-primary mb-3 flex items-center">
                          <Icon name="AlertCircle" size={18} className="mr-2" />
                          Immediate Steps
                        </h5>
                        <ul className="space-y-2">
                          {scenario.diyApproach.immediateSteps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start text-sm">
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                                <span className="text-white text-xs font-bold">{stepIndex + 1}</span>
                              </div>
                              <span className="text-text-secondary">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-inter font-semibold text-text-primary mb-3 flex items-center">
                          <Icon name="Info" size={18} className="mr-2" />
                          Why Professional Help?
                        </h5>
                        <p className="text-text-secondary mb-4">
                          {scenario.diyApproach.reason}
                        </p>
                        
                        <div className="bg-warning-50 p-4 rounded-lg border border-warning-200">
                          <p className="text-warning-800 font-medium text-sm mb-1">
                            Consequences of Delay:
                          </p>
                          <p className="text-warning-700 text-sm">
                            {scenario.consequences}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Warning Signs Tab */}
        {activeTab === 'warning-signs' && (
          <div className="space-y-8">
            {warningSignsChecklist.map((category, index) => (
              <div key={index} className="card p-8">
                <h3 className="text-2xl font-inter font-bold text-text-primary mb-6">
                  {category.category}
                </h3>
                
                <div className="space-y-4">
                  {category.signs.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-4 ${
                          item.urgency === 'High' ? 'bg-error animate-pulse' :
                          item.urgency === 'Medium' ? 'bg-warning' : 'bg-success'
                        }`}></div>
                        
                        <div>
                          <p className="font-inter font-medium text-text-primary">
                            {item.sign}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {item.action}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.urgency === 'High' ? 'bg-error-100 text-error-700' :
                        item.urgency === 'Medium'? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700'
                      }`}>
                        {item.urgency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency Contact CTA */}
        <div className="mt-16 text-center">
          <div className="card p-8 bg-gradient-to-r from-error-50 to-warning-50 border border-error-200">
            <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Phone" size={32} className="text-white" />
            </div>
            
            <h3 className="text-2xl font-inter font-bold text-text-primary mb-4">
              When in Doubt, Call the Professionals
            </h3>
            
            <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
              Pool emergencies can escalate quickly and become expensive if not handled properly. 
              Our experienced technicians can diagnose and resolve issues safely and efficiently.
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
                Emergency Hotline: (555) 911-POOL
              </Button>
              
              <Button
                variant="primary"
                size="lg"
                iconName="MessageCircle"
                iconPosition="left"
                className="font-inter font-bold"
                onClick={() => window.location.href = '/get-quote-book-service'}
              >
                Get Expert Advice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreventionEducation;