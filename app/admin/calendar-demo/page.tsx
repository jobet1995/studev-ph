"use client";

import { useState } from 'react';
import Calendar, { CalendarEvent } from '../components/Calendar';
import Layout from '../components/Layout';

/**
 * Calendar demo page showcasing the Calendar component
 * Demonstrates day, week, and month views with sample events
 * @returns {JSX.Element} Calendar demo page
 */
export default function CalendarDemoPage() {
  // Sample events data
  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      date: new Date(2024, 0, 15, 10, 0),
      type: 'meeting',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Project Deadline',
      date: new Date(2024, 0, 18, 17, 0),
      type: 'deadline',
      color: 'red'
    },
    {
      id: '3',
      title: 'Conference Call',
      date: new Date(2024, 0, 20, 14, 0),
      type: 'event',
      color: 'green'
    },
    {
      id: '4',
      title: 'Code Review',
      date: new Date(2024, 0, 22, 9, 0),
      type: 'meeting',
      color: 'purple'
    },
    {
      id: '5',
      title: 'Product Launch',
      date: new Date(2024, 0, 25, 11, 0),
      type: 'event',
      color: 'indigo'
    },
    {
      id: '6',
      title: 'Weekly Planning',
      date: new Date(2024, 0, 29, 9, 0),
      type: 'meeting',
      color: 'yellow'
    }
  ]);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Close event details modal
  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  // Close date details modal
  const closeDateDetails = () => {
    setSelectedDate(null);
  };

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin' },
    { id: 'analytics', label: 'Analytics', href: '/admin/analytics' },
    { id: 'calendar', label: 'Calendar', href: '/admin/calendar-demo' },
    { id: 'media', label: 'Media Library', href: '/admin/media' },
    { id: 'blogs', label: 'Blogs', href: '/admin/blogs' },
    { id: 'events', label: 'Events', href: '/admin/events' },
    { id: 'users', label: 'Users', href: '/admin/users' },
    { id: 'settings', label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <Layout 
      title="Calendar Demo" 
      sidebarTitle="StuDev Admin" 
      sidebarItems={sidebarItems}
      sidebarSelectedItem="calendar"
      user={{ name: 'Admin User', avatar: undefined }}
      onLogout={() => alert('Logout functionality would go here')}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar Component Demo</h1>
        <p className="text-gray-800">
          Interactive calendar with day, week, and month views. Click on events or dates for details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Component */}
        <div className="lg:col-span-2">
          <Calendar
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Calendar Features</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">Navigation</h4>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Previous/Next buttons</li>
                  <li>• "Today" button</li>
                  <li>• View mode toggle</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Views</h4>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Day view (hourly breakdown)</li>
                  <li>• Week view (7-day grid)</li>
                  <li>• Month view (traditional calendar)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Interactions</h4>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Click events for details</li>
                  <li>• Click dates to add events</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Event Legend */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Event Types</h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Meeting</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Deadline</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Event</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Event Details</h3>
              <button 
                onClick={closeEventDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Title</label>
                <p className="text-gray-800">{selectedEvent.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Date & Time</label>
                <p className="text-gray-800">
                  {selectedEvent.date.toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Type</label>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                  selectedEvent.color 
                    ? `bg-${selectedEvent.color}-100 text-${selectedEvent.color}-800`
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedEvent.type}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeEventDetails}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Selected Date</h3>
              <button 
                onClick={closeDateDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Date</label>
                <p className="text-gray-800 text-lg font-medium">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Events on this day</label>
                <div className="mt-2">
                  {events
                    .filter(event => event.date.toDateString() === selectedDate.toDateString())
                    .map(event => (
                      <div 
                        key={event.id}
                        className="p-2 bg-gray-50 rounded mb-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSelectedEvent(event);
                          closeDateDetails();
                        }}
                      >
                        <div className="font-medium text-gray-800">{event.title}</div>
                        <div className="text-sm text-gray-600">
                          {event.date.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    ))
                  }
                  
                  {events.filter(event => event.date.toDateString() === selectedDate.toDateString()).length === 0 && (
                    <p className="text-gray-500 italic">No events scheduled</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeDateDetails}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Add new event functionality would go here
                  alert(`Add new event for ${selectedDate.toLocaleDateString()}`);
                  closeDateDetails();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}