"use client";

import { useState } from 'react';

/**
 * Interface representing a calendar event
 * @property {string} id - Unique identifier for the event
 * @property {string} title - Event title
 * @property {Date} date - Event date
 * @property {Date} [endDate] - Optional end date for the event
 * @property {'event' | 'meeting' | 'deadline' | 'holiday'} type - Type of calendar entry
 * @property {string} [color] - Optional color for event styling
 */
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: 'event' | 'meeting' | 'deadline' | 'holiday';
  color?: string;
}

/**
 * Props for the Calendar component
 * @property {CalendarEvent[]} [events=[]] - Array of calendar events to display
 * @property {(event: CalendarEvent) => void} [onEventClick] - Callback when an event is clicked
 * @property {(date: Date) => void} [onDateClick] - Callback when a date is clicked
 */
interface CalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

type ViewMode = 'day' | 'week' | 'month';

/**
 * Calendar component with day, week, and month views
 * Displays events and allows navigation between different time periods
 * @param {CalendarProps} props - Component props
 * @param {CalendarEvent[]} [props.events=[]] - Array of calendar events
 * @param {(event: CalendarEvent) => void} [props.onEventClick] - Handler for event clicks
 * @param {(date: Date) => void} [props.onDateClick] - Handler for date clicks
 * @returns {JSX.Element} Calendar component
 */
export default function Calendar({
  events = [],
  onEventClick,
  onDateClick
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Navigation functions
  /**
   * Navigate to the previous time period based on current view mode
   * @returns {void}
   */
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  /**
   * Navigate to the next time period based on current view mode
   * @returns {void}
   */
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  /**
   * Navigate to the current date
   * @returns {void}
   */
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific date
  /**
   * Retrieves events that occur on a specific date
   * @param {Date} date - The date to filter events for
   * @returns {CalendarEvent[]} Array of events occurring on the given date
   */
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Month view component
  /**
   * Renders the month view of the calendar
   * @returns {JSX.Element} Month view component
   */
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Create array of days to display
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    // Weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="calendar-month-view">
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((day, index) => (
            <div 
              key={day} 
              className={`p-3 text-center font-bold bg-gray-100 border-b-2 ${
                index === 0 
                  ? 'text-red-700 border-red-300' 
                  : 'text-gray-800 border-gray-300'
              }`}
            >
              {day}
            </div>
          ))}
          
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2 bg-gray-50"></div>;
            }
            
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isCurrentMonth = date.getMonth() === month;
            const isSunday = date.getDay() === 0; // 0 = Sunday
            
            return (
              <div
                key={date.toString()}
                className={`p-2 min-h-24 border-2 ${
                  isToday 
                    ? 'bg-blue-100 border-blue-500' 
                    : isSunday
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-300'
                  } ${!isCurrentMonth ? 'bg-gray-100 border-gray-200 text-gray-500' : ''} cursor-pointer hover:bg-gray-50`}
                onClick={() => onDateClick?.(date)}
              >
                <div className={`text-lg font-bold ${
                  isToday 
                    ? 'text-blue-800' 
                    : isSunday
                      ? 'text-red-700'
                      : isCurrentMonth 
                        ? 'text-gray-900' 
                        : 'text-gray-600'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer ${
                        event.color ? `bg-${event.color}-100 text-${event.color}-800` : 'bg-blue-100 text-blue-800'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week view component
  /**
   * Renders the week view of the calendar
   * @returns {JSX.Element} Week view component
   */
  const renderWeekView = () => {
    const startDate = new Date(currentDate);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // Start from Sunday
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    
    return (
      <div className="calendar-week-view">
        <div className="grid grid-cols-8 gap-1">
          {/* Time column header */}
          <div className="p-2"></div>
          
          {/* Day headers */}
          {weekdays.map((day, index) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + index);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={day} 
                className={`p-3 text-center font-bold border-b-2 ${
                  isToday 
                    ? 'bg-blue-100 text-blue-800 border-blue-500' 
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">{day.substring(0, 3)}</div>
                <div className="text-xl font-bold">{date.getDate()}</div>
              </div>
            );
          })}
          
          {/* Hour rows */}
          {hours.map(hour => (
            <div key={hour} className="contents">
              <div className="p-2 text-right text-sm text-gray-500 border-t border-gray-200">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>
              
              {weekdays.map((_, dayIndex) => {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + dayIndex);
                date.setHours(hour, 0, 0, 0);
                
                const dayEvents = events.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.toDateString() === date.toDateString() && 
                         eventDate.getHours() === hour;
                });
                
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className="p-1 border-t border-gray-200 min-h-16 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onDateClick?.(date)}
                  >
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded mb-1 cursor-pointer ${
                          event.color ? `bg-${event.color}-100 text-${event.color}-800` : 'bg-blue-100 text-blue-800'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Day view component
  /**
   * Renders the day view of the calendar
   * @returns {JSX.Element} Day view component
   */
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="calendar-day-view">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        
        <div className="grid grid-cols-12 gap-1">
          {/* Time column */}
          <div className="col-span-2">
            {hours.map(hour => (
              <div key={hour} className="p-2 text-right text-sm text-gray-500 h-16 flex items-center justify-end">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </div>
            ))}
          </div>
          
          {/* Events column */}
          <div className="col-span-10">
            {hours.map(hour => {
              const hourEvents = dayEvents.filter(event => {
                const eventHour = new Date(event.date).getHours();
                return eventHour === hour;
              });
              
              return (
                <div
                  key={hour}
                  className="p-2 border-b border-gray-200 h-16 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    const clickedDate = new Date(currentDate);
                    clickedDate.setHours(hour, 0, 0, 0);
                    onDateClick?.(clickedDate);
                  }}
                >
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-sm p-2 rounded mb-1 cursor-pointer ${
                        event.color ? `bg-${event.color}-100 text-${event.color}-800` : 'bg-blue-100 text-blue-800'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render current view
  /**
   * Renders the currently selected view based on viewMode state
   * @returns {JSX.Element} The current view component (day, week, or month)
   */
  const renderCurrentView = () => {
    switch (viewMode) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
      default:
        return renderMonthView();
    }
  };

  return (
    <div className="calendar bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {viewMode === 'month' 
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : viewMode === 'week'
              ? `${new Date(currentDate.getTime() - (currentDate.getDay() * 86400000)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(currentDate.getTime() + ((6 - currentDate.getDay()) * 86400000)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
            }
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevious}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
          >
            &larr;
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Today
          </button>
          
          <button
            onClick={goToNext}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
          >
            &rarr;
          </button>
        </div>
      </div>
      
      {/* View mode selector */}
      <div className="flex gap-2 mb-6">
        {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-md capitalize ${
              viewMode === mode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      
      {/* Calendar content */}
      <div className="calendar-content">
        {renderCurrentView()}
      </div>
    </div>
  );
}