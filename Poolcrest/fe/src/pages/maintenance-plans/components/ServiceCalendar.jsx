import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ServiceCalendar = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const serviceSchedule = {
    0: { // January
      services: ['Pool Winterization Check', 'Equipment Inspection', 'Chemical Balance'],
      frequency: 'Bi-weekly',
      focus: 'Winter Maintenance'
    },
    1: { // February
      services: ['Equipment Maintenance', 'Cover Inspection', 'Water Level Check'],
      frequency: 'Bi-weekly',
      focus: 'Winter Protection'
    },
    2: { // March
      services: ['Spring Preparation', 'Equipment Testing', 'Chemical Adjustment'],
      frequency: 'Weekly',
      focus: 'Spring Prep'
    },
    3: { // April
      services: ['Pool Opening', 'Deep Cleaning', 'Equipment Startup', 'Safety Inspection'],
      frequency: 'Weekly',
      focus: 'Season Opening'
    },
    4: { // May
      services: ['Regular Cleaning', 'Chemical Balancing', 'Equipment Check', 'Filter Cleaning'],
      frequency: 'Weekly',
      focus: 'Active Season'
    },
    5: { // June
      services: ['Weekly Cleaning', 'Chemical Testing', 'Skimmer Service', 'Brush & Vacuum'],
      frequency: 'Weekly',
      focus: 'Peak Season'
    },
    6: { // July
      services: ['Intensive Cleaning', 'Chemical Balancing', 'Equipment Monitoring', 'Algae Prevention'],
      frequency: 'Weekly',
      focus: 'Summer Care'
    },
    7: { // August
      services: ['Deep Cleaning', 'Chemical Adjustment', 'Filter Maintenance', 'Equipment Service'],
      frequency: 'Weekly',
      focus: 'High Usage'
    },
    8: { // September
      services: ['Regular Maintenance', 'Chemical Balancing', 'Equipment Check', 'Leaf Removal'],
      frequency: 'Weekly',
      focus: 'Fall Transition'
    },
    9: { // October
      services: ['Fall Cleaning', 'Equipment Inspection', 'Chemical Adjustment', 'Winterization Prep'],
      frequency: 'Weekly',
      focus: 'Season End'
    },
    10: { // November
      services: ['Winterization Process', 'Equipment Shutdown', 'Cover Installation', 'Final Inspection'],
      frequency: 'Bi-weekly',
      focus: 'Winter Prep'
    },
    11: { // December
      services: ['Winter Monitoring', 'Cover Check', 'Equipment Storage', 'Planning Next Season'],
      frequency: 'Monthly',
      focus: 'Winter Storage'
    }
  };

  const currentSchedule = serviceSchedule[selectedMonth];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-text-primary">Service Calendar</h3>
        <div className="flex items-center space-x-2">
          <Icon name="Calendar" size={24} className="text-primary" />
          <span className="text-text-secondary">Year-round Care</span>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {months.map((month, index) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedMonth === index
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Selected Month Details */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-text-primary mb-4">
            {months[selectedMonth]} Services
          </h4>
          <div className="space-y-3">
            {currentSchedule.services.map((service, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-text-primary">{service}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Clock" size={20} className="text-accent" />
              <span className="font-semibold text-text-primary">Frequency</span>
            </div>
            <p className="text-text-secondary">{currentSchedule.frequency}</p>
          </div>

          <div className="bg-surface rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Target" size={20} className="text-success" />
              <span className="font-semibold text-text-primary">Focus Area</span>
            </div>
            <p className="text-text-secondary">{currentSchedule.focus}</p>
          </div>
        </div>
      </div>

      {/* Seasonal Note */}
      <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <p className="text-sm text-text-primary">
              <strong>Seasonal Adaptation:</strong> Our maintenance plans automatically adjust to seasonal needs, 
              ensuring your pool receives the right care at the right time throughout the year.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCalendar;