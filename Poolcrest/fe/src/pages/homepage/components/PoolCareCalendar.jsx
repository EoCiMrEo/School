import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PoolCareCalendar = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const seasonalTasks = {
    0: { // January
      season: 'Winter',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tasks: [
        { task: 'Monitor pool cover for damage', priority: 'high', icon: 'Eye' },
        { task: 'Check equipment storage area', priority: 'medium', icon: 'Package' },
        { task: 'Plan spring opening service', priority: 'low', icon: 'Calendar' }
      ]
    },
    1: { // February
      season: 'Winter',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tasks: [
        { task: 'Inspect pool cover integrity', priority: 'high', icon: 'Shield' },
        { task: 'Schedule spring opening appointment', priority: 'medium', icon: 'Phone' },
        { task: 'Review maintenance plan options', priority: 'low', icon: 'FileText' }
      ]
    },
    2: { // March
      season: 'Spring Prep',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      tasks: [
        { task: 'Professional spring opening service', priority: 'high', icon: 'Play' },
        { task: 'Equipment startup and inspection', priority: 'high', icon: 'Settings' },
        { task: 'Initial water chemistry balancing', priority: 'high', icon: 'Droplets' }
      ]
    },
    3: { // April
      season: 'Spring Opening',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      tasks: [
        { task: 'Complete system startup', priority: 'high', icon: 'Power' },
        { task: 'Begin weekly maintenance schedule', priority: 'high', icon: 'Calendar' },
        { task: 'Safety equipment installation', priority: 'medium', icon: 'Shield' }
      ]
    },
    4: { // May
      season: 'Swimming Season',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tasks: [
        { task: 'Weekly cleaning and skimming', priority: 'high', icon: 'Waves' },
        { task: 'Chemical balancing and testing', priority: 'high', icon: 'TestTube' },
        { task: 'Filter cleaning and maintenance', priority: 'medium', icon: 'Filter' }
      ]
    },
    5: { // June
      season: 'Peak Season',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      tasks: [
        { task: 'Increased cleaning frequency', priority: 'high', icon: 'RotateCcw' },
        { task: 'Monitor heavy usage impact', priority: 'high', icon: 'TrendingUp' },
        { task: 'Equipment performance checks', priority: 'medium', icon: 'Gauge' }
      ]
    },
    6: { // July
      season: 'Peak Season',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      tasks: [
        { task: 'Daily skimming and cleaning', priority: 'high', icon: 'Sun' },
        { task: 'Algae prevention treatments', priority: 'high', icon: 'Zap' },
        { task: 'Water level monitoring', priority: 'medium', icon: 'BarChart3' }
      ]
    },
    7: { // August
      season: 'Peak Season',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      tasks: [
        { task: 'Intensive cleaning schedule', priority: 'high', icon: 'Sparkles' },
        { task: 'Equipment stress monitoring', priority: 'high', icon: 'Activity' },
        { task: 'Chemical usage optimization', priority: 'medium', icon: 'Beaker' }
      ]
    },
    8: { // September
      season: 'Fall Transition',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      tasks: [
        { task: 'Reduce maintenance frequency', priority: 'medium', icon: 'TrendingDown' },
        { task: 'Leaf removal and skimming', priority: 'high', icon: 'Leaf' },
        { task: 'Plan winterization service', priority: 'low', icon: 'Snowflake' }
      ]
    },
    9: { // October
      season: 'Fall Maintenance',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      tasks: [
        { task: 'Heavy leaf removal', priority: 'high', icon: 'Wind' },
        { task: 'Schedule winterization service', priority: 'high', icon: 'Calendar' },
        { task: 'Equipment preparation for winter', priority: 'medium', icon: 'Package' }
      ]
    },
    10: { // November
      season: 'Winterization',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      tasks: [
        { task: 'Professional winterization service', priority: 'high', icon: 'Snowflake' },
        { task: 'Pool cover installation', priority: 'high', icon: 'Shield' },
        { task: 'Equipment storage and protection', priority: 'high', icon: 'Archive' }
      ]
    },
    11: { // December
      season: 'Winter Storage',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      tasks: [
        { task: 'Monitor pool cover condition', priority: 'medium', icon: 'Eye' },
        { task: 'Check for winter damage', priority: 'medium', icon: 'AlertTriangle' },
        { task: 'Plan next year maintenance', priority: 'low', icon: 'Calendar' }
      ]
    }
  };

  const currentMonthData = seasonalTasks[selectedMonth];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error bg-error-50 border-error-200';
      case 'medium': return 'text-warning bg-warning-50 border-warning-200';
      case 'low': return 'text-success bg-success-50 border-success-200';
      default: return 'text-text-secondary bg-surface border-border';
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-surface rounded-full px-4 py-2 shadow-sm mb-4">
            <Icon name="Calendar" size={20} className="text-primary" />
            <span className="text-sm font-inter font-semibold text-text-primary">
              Interactive Pool Care Calendar
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Year-Round Pool Care Schedule
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Discover what your pool needs each month to stay crystal clear and family-safe. Our seasonal care approach ensures optimal performance year-round.
          </p>
        </div>

        {/* Calendar Interface */}
        <div className="bg-surface rounded-2xl p-8 lg:p-12 shadow-lg">
          {/* Month Selector */}
          <div className="mb-8">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {months.map((month, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMonth(index)}
                  className={`px-4 py-3 rounded-xl font-inter font-medium transition-smooth ${
                    selectedMonth === index
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-white text-text-secondary hover:text-primary hover:bg-primary-50'
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Month Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Month Info */}
            <div className="lg:col-span-1">
              <div className={`${currentMonthData.bgColor} ${currentMonthData.borderColor} border-2 rounded-2xl p-6`}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-inter font-bold text-text-primary mb-2">
                    {months[selectedMonth]}
                  </h3>
                  <div className={`inline-flex items-center space-x-2 ${currentMonthData.color} bg-white rounded-full px-4 py-2 shadow-sm`}>
                    <Icon name="Leaf" size={20} />
                    <span className="font-inter font-semibold">
                      {currentMonthData.season}
                    </span>
                  </div>
                </div>

                {/* Season Description */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {selectedMonth >= 2 && selectedMonth <= 4 ? '🌱' :
                       selectedMonth >= 5 && selectedMonth <= 8 ? '☀️' :
                       selectedMonth >= 9 && selectedMonth <= 10 ? '🍂' : '❄️'}
                    </div>
                    <p className="text-sm text-text-secondary">
                      {selectedMonth >= 2 && selectedMonth <= 4 ? 'Spring preparation and opening season' :
                       selectedMonth >= 5 && selectedMonth <= 8 ? 'Peak swimming and maintenance season' :
                       selectedMonth >= 9 && selectedMonth <= 10 ? 'Fall cleanup and winterization prep' : 'Winter protection and monitoring'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="lg:col-span-2">
              <h4 className="text-xl font-inter font-bold text-text-primary mb-6">
                Essential Tasks for {months[selectedMonth]}
              </h4>
              <div className="space-y-4">
                {currentMonthData.tasks.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-border-light hover-lift transition-smooth">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Icon name={item.icon} size={24} className="text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <h5 className="font-inter font-semibold text-text-primary">
                            {item.task}
                          </h5>
                          <div
                            className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-inter font-semibold border whitespace-nowrap ${getPriorityColor(item.priority)}`}
                          >
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {item.priority === 'high' ? 'Critical for pool safety and functionality' :
                           item.priority === 'medium' ? 'Important for optimal pool performance' :
                           'Recommended for long-term pool health'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 pt-8 border-t border-border-light text-center">
            <h4 className="text-xl font-inter font-bold text-text-primary mb-4">
              Let Us Handle Your Seasonal Pool Care
            </h4>
            <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
              Don't worry about remembering every seasonal task. Our maintenance plans include all essential services scheduled at the perfect time for your pool's needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-3 rounded-xl font-inter font-semibold flex items-center justify-center space-x-2 hover-lift transition-smooth">
                <Icon name="Calendar" size={20} />
                <span>View Maintenance Plans</span>
              </button>
              <button className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-xl font-inter font-semibold flex items-center justify-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Icon name="Download" size={20} />
                <span>Download Care Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PoolCareCalendar;