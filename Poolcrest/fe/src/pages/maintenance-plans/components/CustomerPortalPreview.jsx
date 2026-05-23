import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CustomerPortalPreview = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'schedule', label: 'Schedule', icon: 'Calendar' },
    { id: 'history', label: 'Service History', icon: 'History' },
    { id: 'communication', label: 'Messages', icon: 'MessageSquare' }
  ];

  const upcomingServices = [
    {
      id: 1,
      service: "Weekly Cleaning & Chemical Balance",
      date: "Tomorrow, 10:00 AM",
      technician: "Mike Rodriguez",
      status: "confirmed"
    },
    {
      id: 2,
      service: "Filter Cleaning & Equipment Check",
      date: "Friday, 2:00 PM",
      technician: "Sarah Chen",
      status: "scheduled"
    }
  ];

  const serviceHistory = [
    {
      id: 1,
      date: "March 15, 2024",
      service: "Weekly Maintenance",
      technician: "Mike Rodriguez",
      status: "completed",
      notes: "Pool chemistry balanced, skimmer cleaned, brushed walls and steps. Everything looks great!"
    },
    {
      id: 2,
      date: "March 8, 2024",
      service: "Equipment Inspection",
      technician: "Sarah Chen",
      status: "completed",
      notes: "Pump and filter system running efficiently. Recommended filter cleaning in 2 weeks."
    }
  ];

  const messages = [
    {
      id: 1,
      from: "Mike Rodriguez",
      subject: "Service Complete - March 15",
      preview: "Your weekly maintenance is complete. Pool is ready for the weekend!",
      time: "2 hours ago",
      unread: true
    },
    {
      id: 2,
      from: "Poolcrest Support",
      subject: "Spring Pool Opening Reminder",
      preview: "It\'s time to schedule your spring pool opening service...",
      time: "1 day ago",
      unread: false
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Pool Status */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-success/10 rounded-lg p-4 border border-success/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Droplets" size={20} className="text-success" />
            <span className="font-semibold text-text-primary">Water Quality</span>
          </div>
          <div className="text-2xl font-bold text-success">Excellent</div>
          <div className="text-sm text-text-secondary">Last tested: March 15</div>
        </div>
        
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Settings" size={20} className="text-primary" />
            <span className="font-semibold text-text-primary">Equipment</span>
          </div>
          <div className="text-2xl font-bold text-primary">Running</div>
          <div className="text-sm text-text-secondary">All systems normal</div>
        </div>
        
        <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Calendar" size={20} className="text-accent" />
            <span className="font-semibold text-text-primary">Next Service</span>
          </div>
          <div className="text-lg font-bold text-accent">Tomorrow</div>
          <div className="text-sm text-text-secondary">10:00 AM</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-lg p-4">
        <h4 className="font-semibold text-text-primary mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" size="sm" iconName="Calendar" iconPosition="left">
            Schedule Service
          </Button>
          <Button variant="outline" size="sm" iconName="MessageSquare" iconPosition="left">
            Contact Tech
          </Button>
          <Button variant="outline" size="sm" iconName="AlertTriangle" iconPosition="left">
            Report Issue
          </Button>
          <Button variant="outline" size="sm" iconName="FileText" iconPosition="left">
            View Reports
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-text-primary">Upcoming Services</h4>
      {upcomingServices.map((service) => (
        <div key={service.id} className="bg-surface rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-text-primary">{service.service}</h5>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              service.status === 'confirmed' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
            }`}>
              {service.status}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={16} />
              <span>{service.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="User" size={16} />
              <span>{service.technician}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-text-primary">Recent Services</h4>
      {serviceHistory.map((service) => (
        <div key={service.id} className="bg-surface rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-text-primary">{service.service}</h5>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
              {service.status}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-text-secondary mb-3">
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={16} />
              <span>{service.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="User" size={16} />
              <span>{service.technician}</span>
            </div>
          </div>
          <p className="text-sm text-text-primary bg-white rounded p-3 border border-border">
            {service.notes}
          </p>
        </div>
      ))}
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-text-primary">Messages</h4>
      {messages.map((message) => (
        <div key={message.id} className={`bg-surface rounded-lg p-4 border border-border ${
          message.unread ? 'ring-2 ring-primary/20' : ''
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h5 className="font-semibold text-text-primary">{message.from}</h5>
              {message.unread && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>
            <span className="text-xs text-text-secondary">{message.time}</span>
          </div>
          <h6 className="font-medium text-text-primary mb-1">{message.subject}</h6>
          <p className="text-sm text-text-secondary">{message.preview}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
      <div className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center space-x-3">
          <Icon name="Monitor" size={32} />
          <div>
            <h3 className="text-xl font-bold">Customer Portal Preview</h3>
            <p className="text-primary-200">Manage your pool service with ease</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5' :'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'communication' && renderMessages()}
      </div>

      {/* Portal CTA */}
      <div className="bg-surface p-6 border-t border-border">
        <div className="text-center">
          <p className="text-text-secondary mb-4">
            Get full access to your personalized customer portal with any maintenance plan
          </p>
          <Button variant="primary" iconName="ExternalLink" iconPosition="right">
            Explore Full Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortalPreview;