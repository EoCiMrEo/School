import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const SchedulingCalendar = ({ selectedDate, selectedTime, onDateChange, onTimeChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // Mock technician data
  const technicians = [
    {
      id: 1,
      name: "Mike Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 127,
      specialties: ["Pool Maintenance", "Equipment Repair"],
      experience: "8 years",
      nextAvailable: "Today"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c1b4?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: 94,
      specialties: ["Chemical Balancing", "Green Pool Recovery"],
      experience: "6 years",
      nextAvailable: "Tomorrow"
    },
    {
      id: 3,
      name: "David Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 156,
      specialties: ["Seasonal Services", "Equipment Installation"],
      experience: "10 years",
      nextAvailable: "This Week"
    }
  ];

  // Mock availability data
  const timeSlots = [
    { time: "8:00 AM", available: true, technician: 1 },
    { time: "9:00 AM", available: true, technician: 2 },
    { time: "10:00 AM", available: false, technician: null },
    { time: "11:00 AM", available: true, technician: 1 },
    { time: "12:00 PM", available: true, technician: 3 },
    { time: "1:00 PM", available: true, technician: 2 },
    { time: "2:00 PM", available: true, technician: 1 },
    { time: "3:00 PM", available: false, technician: null },
    { time: "4:00 PM", available: true, technician: 3 },
    { time: "5:00 PM", available: true, technician: 2 }
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date) => {
    if (isDateAvailable(date)) {
      onDateChange(date);
    }
  };

  const handleTimeClick = (timeSlot) => {
    if (timeSlot.available) {
      onTimeChange(timeSlot.time);
      const tech = technicians.find(t => t.id === timeSlot.technician);
      setSelectedTechnician(tech);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <h3 className="text-xl font-inter font-semibold text-text-primary mb-2">
          Schedule Your Service
        </h3>
        <p className="text-text-secondary">
          Select your preferred date and time. Our expert technicians are available 6 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-inter font-semibold text-text-primary">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronLeft"
                onClick={() => navigateMonth(-1)}
              />
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronRight"
                onClick={() => navigateMonth(1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-text-secondary py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={!isDateAvailable(date)}
                className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-smooth ${
                  !date
                    ? 'invisible'
                    : isDateSelected(date)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : isDateAvailable(date)
                    ? 'hover:bg-surface text-text-primary hover:text-primary' :'text-text-muted cursor-not-allowed'
                }`}
              >
                {date && date.getDate()}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h4 className="text-lg font-inter font-semibold text-text-primary mb-4">
            Available Times
            {selectedDate && (
              <span className="text-sm font-normal text-text-secondary ml-2">
                for {selectedDate.toLocaleDateString()}
              </span>
            )}
          </h4>

          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeClick(slot)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg text-sm font-medium transition-smooth ${
                    selectedTime === slot.time
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : slot.available
                      ? 'bg-surface hover:bg-primary-100 text-text-primary hover:text-primary border border-border' :'bg-gray-100 text-text-muted cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-surface rounded-lg">
              <div className="text-center">
                <Icon name="Calendar" size={32} className="text-text-muted mx-auto mb-2" />
                <p className="text-text-secondary">Select a date to view available times</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Technician */}
      {selectedTechnician && (
        <div className="mt-6 p-4 bg-surface rounded-lg border border-border-light">
          <h4 className="font-inter font-semibold text-text-primary mb-3">
            Your Assigned Technician
          </h4>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={selectedTechnician.avatar}
                alt={selectedTechnician.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white flex items-center justify-center">
                <Icon name="Check" size={12} color="white" />
              </div>
            </div>
            <div className="flex-1">
              <h5 className="font-inter font-semibold text-text-primary">
                {selectedTechnician.name}
              </h5>
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex items-center">
                  <Icon name="Star" size={14} className="text-accent fill-current" />
                  <span className="text-sm font-medium text-text-primary ml-1">
                    {selectedTechnician.rating}
                  </span>
                </div>
                <span className="text-sm text-text-secondary">
                  ({selectedTechnician.reviews} reviews)
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTechnician.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary-100 text-primary text-xs rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
              <p className="text-sm text-text-secondary">
                {selectedTechnician.experience} experience
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Booking Notice */}
      <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
          <div>
            <h5 className="font-inter font-semibold text-warning-800 mb-1">
              Need Emergency Service?
            </h5>
            <p className="text-sm text-warning-700 mb-2">
              For urgent pool issues, we offer same-day emergency service with priority scheduling.
            </p>
            <Button
              variant="warning"
              size="sm"
              iconName="Phone"
              iconPosition="left"
              onClick={() => window.location.href = 'tel:+1234567890'}
            >
              Call Emergency Line
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingCalendar;