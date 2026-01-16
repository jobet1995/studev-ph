"use client";

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import ModalMessage from '../components/ModalMessage';
import Calendar, { CalendarEvent } from '../components/Calendar';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  eventType: string;
}

interface EventsData {
  events: {
    items: Event[];
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
  };
}

// GraphQL query to fetch events
const GET_EVENTS = gql`
  query GetEvents($pagination: PaginationInput) {
    events(pagination: $pagination) {
      items {
        id
        title
        date
        location
        eventType
      }
      totalCount
      hasNextPage
      hasPreviousPage
      currentPage
    }
  }
`;

// GraphQL mutation to create an event
const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      date
      location
      eventType
    }
  }
`;

// GraphQL mutation to update an event
const UPDATE_EVENT = gql`
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      id
      title
      date
      location
      eventType
    }
  }
`;

// GraphQL mutation to delete an event
const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

/**
 * Admin events management page
 * @returns {JSX.Element} Admin events page
 */
export default function AdminEventsPage() {
  const { data, loading, error, refetch } = useQuery<EventsData>(GET_EVENTS, {
    variables: {
      pagination: { page: 1, limit: 10 }
    }
  });
  
  // State for modal message
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning" | "info"
  });
  
  // State for editing
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // State for calendar view
  const [showCalendar, setShowCalendar] = useState(false);
  
  // State for showing table (opposite of calendar)
  const showTable = !showCalendar;
  
  // Convert GraphQL events to calendar events
  const calendarEvents: CalendarEvent[] = (data?.events.items || []).map(event => ({
    id: event.id,
    title: event.title,
    date: new Date(event.date),
    type: 'event' as const,
    color: 'blue'
  }));
  
  const [createEvent] = useMutation(CREATE_EVENT, {
    onCompleted: () => {
      // Refetch the events after successful creation
      refetch();
      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setEndDate('');
      setLocation('');
      setEventType('CONFERENCE');
      setCapacity('');
      setIsVirtual(false);
      setRegistrationUrl('');
      setImageUrl('');
      setShowForm(false);
      setModalState({
        isOpen: true,
        title: "Success",
        message: "Event created successfully!",
        type: "success"
      });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Failed to create event. Please try again.",
        type: "error"
      });
    }
  });
  
  const [updateEvent] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      refetch();
      setTitle('');
      setDescription('');
      setDate('');
      setEndDate('');
      setLocation('');
      setEventType('CONFERENCE');
      setCapacity('');
      setIsVirtual(false);
      setRegistrationUrl('');
      setImageUrl('');
      setShowForm(false);
      setEditingEventId(null);
      setModalState({
        isOpen: true,
        title: "Success",
        message: "Event updated successfully!",
        type: "success"
      });
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Failed to update event. Please try again.",
        type: "error"
      });
    }
  });
  
  const [deleteEvent] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      refetch();
      setModalState({
        isOpen: true,
        title: "Success",
        message: "Event deleted successfully!",
        type: "success"
      });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Failed to delete event. Please try again.",
        type: "error"
      });
    }
  });
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('CONFERENCE');
  const [capacity, setCapacity] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const events = data?.events.items || [];
  
  // Handle editing an event
  const handleEditEvent = (event: Event) => {
    setTitle(event.title);
    setDescription(""); // Would need to fetch full event data for complete editing
    setDate(event.date);
    setEndDate("");
    setLocation(event.location);
    setEventType(event.eventType);
    setCapacity("");
    setIsVirtual(false);
    setRegistrationUrl("");
    setImageUrl("");
    setEditingEventId(event.id);
    setShowForm(true);
  };
  
  // Handle deleting an event
  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEvent({ variables: { id: eventId } });
    }
  };
  
  // Handle calendar event click
  const handleCalendarEventClick = (event: CalendarEvent) => {
    // Find the full event data
    const fullEvent = (data?.events.items || []).find(e => e.id === event.id);
    if (fullEvent) {
      handleEditEvent(fullEvent);
    }
  };
  
  // Handle calendar date click
  const handleCalendarDateClick = (date: Date) => {
    // Set the form to create a new event on this date
    setDate(date.toISOString().split('T')[0]);
    setShowForm(true);
    setShowCalendar(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Events</h2>
          <p className="text-gray-600">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-4 py-2 rounded-md ${
              showCalendar 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : 'Add New Event'}
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {showCalendar && (
        <div className="mb-6">
          <Calendar
            events={calendarEvents}
            onEventClick={handleCalendarEventClick}
            onDateClick={handleCalendarDateClick}
          />
        </div>
      )}

      {/* Add Event Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingEventId ? 'Update Event' : 'Create New Event'}
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            
            const eventInput = {
              title,
              description,
              date,
              endDate: endDate || null,
              location,
              eventType,
              capacity: capacity ? parseInt(capacity) : null,
              isVirtual,
              registrationUrl: registrationUrl || null,
              imageUrl: imageUrl || null,
            };
            
            if (editingEventId) {
              // Update existing event
              updateEvent({
                variables: {
                  input: {
                    id: editingEventId,
                    ...eventInput
                  }
                }
              });
            } else {
              // Create new event
              createEvent({
                variables: {
                  input: eventInput
                }
              });
            }
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="eventTitle"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  id="eventType"
                  required
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="CONFERENCE">Conference</option>
                  <option value="MEETUP">Meetup</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="WEBINAR">Webinar</option>
                  <option value="HACKATHON">Hackathon</option>
                </select>
              </div>
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="eventDate"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="eventEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="eventEndDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="eventLocation"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="eventDescription"
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="eventCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  id="eventCapacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isVirtual}
                    onChange={(e) => setIsVirtual(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Virtual Event</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="eventRegistrationUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration URL
                </label>
                <input
                  type="url"
                  id="eventRegistrationUrl"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://example.com/register"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="eventImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  id="eventImageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingEventId ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table */}
      {showTable && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {event.eventType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <ModalMessage
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
}