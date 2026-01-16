"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import Layout from '../components/Layout';
import FormSection from '../components/FormSection';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Card from '../components/Card';
import Table from '../components/Table';
import Tabs from '../components/Tabs';

// GraphQL mutations
const CREATE_BLOG = gql`
  mutation CreateBlog($input: CreateBlogInput!) {
    createBlog(input: $input) {
      id
      title
      content
      author
      date
      published
      featured
    }
  }
`;

const UPDATE_BLOG = gql`
  mutation UpdateBlog($input: UpdateBlogInput!) {
    updateBlog(input: $input) {
      id
      title
      content
      author
      date
      published
      featured
    }
  }
`;

const DELETE_BLOG = gql`
  mutation DeleteBlog($id: ID!) {
    deleteBlog(id: $id)
  }
`;

const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      description
      date
      location
      eventType
      capacity
    }
  }
`;

const UPDATE_EVENT = gql`
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      id
      title
      description
      date
      location
      eventType
      capacity
    }
  }
`;

const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

const GET_ALL_BLOGS = gql`
  query GetAllBlogs {
    blogs {
      items {
        id
        title
        content
        author
        date
        published
        featured
      }
    }
  }
`;

const GET_ALL_EVENTS = gql`
  query GetAllEvents {
    events {
      items {
        id
        title
        description
        date
        location
        eventType
        capacity
      }
    }
  }
`;

/**
 * Main admin content management page
 * Handles creation and management of blogs and events
 * @returns {JSX.Element} Admin content management page
 */
export default function AdminPage() {
  // State for form data
  const [blogForm, setBlogForm] = useState({
    id: "",
    title: "",
    content: "",
    excerpt: "",
    author: "",
    tags: "",
    published: true,
    featured: false,
    imageUrl: "",
  });
  
  const [eventForm, setEventForm] = useState({
    id: "",
    title: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    eventType: "CONFERENCE" as const,
    capacity: null as number | null,
    isVirtual: false,
    registrationUrl: "",
    imageUrl: "",
  } as {
    id: string;
    title: string;
    description: string;
    date: string;
    endDate: string;
    location: string;
    eventType: "CONFERENCE" | "MEETUP" | "WORKSHOP" | "WEBINAR" | "HACKATHON";
    capacity: number | null;
    isVirtual: boolean;
    registrationUrl: string;
    imageUrl: string;
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  
  // State for content type tabs
  const [activeContentType, setActiveContentType] = useState<'blog' | 'event'>('blog');
  
  // State for editing
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // Mutations
  const [createBlog] = useMutation(CREATE_BLOG);
  const [updateBlog] = useMutation(UPDATE_BLOG);
  const [deleteBlog] = useMutation(DELETE_BLOG);
  
  const [createEvent] = useMutation(CREATE_EVENT);
  const [updateEvent] = useMutation(UPDATE_EVENT);
  const [deleteEvent] = useMutation(DELETE_EVENT);
  
  // Queries to fetch existing content
  const { data: blogsData, refetch: refetchBlogs } = useQuery(GET_ALL_BLOGS, { fetchPolicy: 'network-only' });
  const { data: eventsData, refetch: refetchEvents } = useQuery(GET_ALL_EVENTS, { fetchPolicy: 'network-only' });
  
  // Handle blog form submission
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const blogInput = {
      ...(editingBlogId ? {} : { id: blogForm.id }),
      title: blogForm.title,
      content: blogForm.content,
      excerpt: blogForm.excerpt,
      author: blogForm.author,
      tags: blogForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      published: blogForm.published,
      featured: blogForm.featured,
      imageUrl: blogForm.imageUrl,
    };
    
    try {
      if (editingBlogId) {
        // Extract and use the blog ID from form data
        const extractedId = blogInput.id;
        const restBlogInput = {
          title: blogInput.title,
          content: blogInput.content,
          excerpt: blogInput.excerpt,
          author: blogInput.author,
          tags: blogInput.tags,
          published: blogInput.published,
          featured: blogInput.featured,
          imageUrl: blogInput.imageUrl
        };
        console.log(`Updating blog with ID: ${extractedId}`);
        await updateBlog({ variables: { input: { id: extractedId, ...restBlogInput } } });
        setEditingBlogId(null);
        alert("Blog updated successfully!");
      } else {
        await createBlog({ variables: { input: blogInput } });
        alert("Blog created successfully!");
      }
      
      // Reset form
      setBlogForm({
        id: "",
        title: "",
        content: "",
        excerpt: "",
        author: "",
        tags: "",
        published: true,
        featured: false,
        imageUrl: "",
      });
      
      // Refetch data
      refetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };
  
  // Handle event form submission
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      
    const eventInput = {
      ...(editingEventId ? {} : { id: eventForm.id }),
      title: eventForm.title,
      description: eventForm.description,
      date: eventForm.date,
      endDate: eventForm.endDate,
      location: eventForm.location,
      eventType: eventForm.eventType,
      capacity: eventForm.capacity || undefined,
      isVirtual: eventForm.isVirtual,
      registrationUrl: eventForm.registrationUrl,
      imageUrl: eventForm.imageUrl,
    };
      
    try {
      if (editingEventId) {
        // Log the event ID for debugging purposes
        console.log(`Updating event with ID: ${editingEventId}`);
        await updateEvent({ variables: { input: { id: editingEventId, ...eventInput } } });
        setEditingEventId(null);
        alert("Event updated successfully!");
      } else {
        // Create a new event
        await createEvent({ variables: { input: eventInput } });
        alert("Event created successfully!");
      }
        
      // Reset form
      setEventForm({
        id: "",
        title: "",
        description: "",
        date: "",
        endDate: "",
        location: "",
        eventType: "CONFERENCE",
        capacity: null,
        isVirtual: false,
        registrationUrl: "",
        imageUrl: "",
      });
        
      // Refetch data
      refetchEvents();
    } catch (err) {
      console.error(err);
    }
  };
  
  // Handle editing a blog
  const handleEditBlog = (blog: unknown) => {
    if (typeof blog !== 'object' || blog === null || !('id' in blog)) return;
    
    const blogObj = blog as {
      id: string;
      title: string;
      content: string;
      excerpt?: string;
      author: string;
      tags?: string[];
      published: boolean;
      featured: boolean;
      imageUrl?: string;
    };
    
    setBlogForm({
      id: blogObj.id,
      title: blogObj.title,
      content: blogObj.content,
      excerpt: blogObj.excerpt || "",
      author: blogObj.author,
      tags: blogObj.tags ? blogObj.tags.join(',') : "",
      published: blogObj.published,
      featured: blogObj.featured,
      imageUrl: blogObj.imageUrl || "",
    });
    setEditingBlogId(blogObj.id);
    setActiveTab('create');
  };
  
  // Handle editing an event
  const handleEditEvent = (event: unknown) => {
    if (typeof event !== 'object' || event === null || !('id' in event)) return;
    
    const eventObj = event as {
      id: string;
      title: string;
      description: string;
      date: string;
      endDate?: string;
      location: string;
      eventType: string;
      capacity?: number;
      isVirtual: boolean;
      registrationUrl?: string;
      imageUrl?: string;
    };
    
    setEventForm({
      id: eventObj.id,
      title: eventObj.title,
      description: eventObj.description,
      date: eventObj.date,
      endDate: eventObj.endDate || "",
      location: eventObj.location,
      eventType: eventObj.eventType as "CONFERENCE" | "MEETUP" | "WORKSHOP" | "WEBINAR" | "HACKATHON",
      capacity: eventObj.capacity || null,
      isVirtual: eventObj.isVirtual,
      registrationUrl: eventObj.registrationUrl || "",
      imageUrl: eventObj.imageUrl || "",
    });
    setEditingEventId(eventObj.id);
    setActiveTab('create');
  };
  
  // Handle deleting a blog
  const handleDeleteBlog = async (item: unknown) => {
    if (typeof item !== 'object' || item === null || !('id' in item)) return;
    const id = (item as { id: string }).id;
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog({ variables: { id } });
        alert("Blog deleted successfully!");
        refetchBlogs();
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  // Handle deleting an event
  const handleDeleteEvent = async (item: unknown) => {
    if (typeof item !== 'object' || item === null || !('id' in item)) return;
    const id = (item as { id: string }).id;
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent({ variables: { id } });
        alert("Event deleted successfully!");
        refetchEvents();
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  // Reset forms
  const resetForms = () => {
    setBlogForm({
      id: "",
      title: "",
      content: "",
      excerpt: "",
      author: "",
      tags: "",
      published: true,
      featured: false,
      imageUrl: "",
    });
    setEventForm({
      id: "",
      title: "",
      description: "",
      date: "",
      endDate: "",
      location: "",
      eventType: "CONFERENCE",
      capacity: null,
      isVirtual: false,
      registrationUrl: "",
      imageUrl: "",
    });
    setEditingBlogId(null);
    setEditingEventId(null);
  };
  // Define tab structure
  const tabs = [
    { id: 'create', label: 'Create Content' },
    { id: 'manage', label: 'Manage Content' },
  ];
  
  // Use tabs for navigation
  const handleTabChange = (tabId: string) => {
    if (tabId === 'create' || tabId === 'manage') {
      setActiveTab(tabId);
    }
  };
  
  const blogColumns = [
    { key: 'title', header: 'Title' },
    { key: 'author', header: 'Author' },
    {
      key: 'published',
      header: 'Status',
      render: (blog: unknown) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeof blog === 'object' && blog !== null && 'published' in blog && (blog as { published: boolean }).published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {typeof blog === 'object' && blog !== null && 'published' in blog && (blog as { published: boolean }).published ? 'Published' : 'Draft'}
        </span>
      ),
    },
  ];
  
  const eventColumns = [
    { key: 'title', header: 'Title' },
    { key: 'date', header: 'Date' },
    { key: 'location', header: 'Location' },
    {
      key: 'eventType',
      header: 'Type',
      render: (event: unknown) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {typeof event === 'object' && event !== null && 'eventType' in event ? (event as { eventType: string }).eventType : 'Unknown'}
        </span>
      ),
    },
  ];
  
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin' },
    { id: 'analytics', label: 'Analytics', href: '/admin/analytics' },
    { id: 'media', label: 'Media Library', href: '/admin/media' },
    { id: 'create', label: 'Create Content', onClick: () => setActiveTab('create') },
    { id: 'manage', label: 'Manage Content', onClick: () => setActiveTab('manage') },
    { id: 'users', label: 'Users', href: '/admin/users' },
    { id: 'settings', label: 'Settings', href: '/admin/settings' },
  ];
  
  return (
    <Layout 
      title="Admin Dashboard" 
      sidebarTitle="StuDev Admin" 
      sidebarItems={sidebarItems}
      sidebarSelectedItem={activeTab === 'create' ? 'create' : activeTab === 'manage' ? 'manage' : 'dashboard'}
      user={{ name: 'Admin User', avatar: undefined }}
      onLogout={() => alert('Logout functionality would go here')}
    >
      <Tabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <div className="mb-6 mt-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {activeTab === 'create' ? 'Create & Edit Content' : 'Manage Content'}
        </h1>
        <p className="text-gray-800">
          {activeTab === 'create' 
            ? 'Create new blog posts and events, or edit existing content' 
            : 'View and manage all blog posts and events'
          }
        </p>
      </div>
      
      {activeTab === 'create' ? (
        <div className="divide-y divide-gray-200">
          {/* Content type tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveContentType('blog')}
                className={`${
                  activeContentType === 'blog'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Create Blog
              </button>
              <button
                onClick={() => setActiveContentType('event')}
                className={`${
                  activeContentType === 'event'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Create Event
              </button>
            </nav>
          </div>
          
          {activeContentType === 'blog' ? (
            <FormSection 
              title={editingBlogId ? 'Update Blog' : 'Create Blog'} 
              description="Fill in the details for your new blog post"
            >
              <form onSubmit={handleBlogSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Title"
                  id="blog-title"
                  type="text"
                  value={blogForm.title}
                  onChange={(value) => setBlogForm({ ...blogForm, title: value as string })}
                  required
                />
                
                <InputField
                  label="Author"
                  id="blog-author"
                  type="text"
                  value={blogForm.author}
                  onChange={(value) => setBlogForm({ ...blogForm, author: value as string })}
                  required
                />
                
                <InputField
                  label="Excerpt"
                  id="blog-excerpt"
                  type="text"
                  value={blogForm.excerpt}
                  onChange={(value) => setBlogForm({ ...blogForm, excerpt: value as string })}
                  multiline
                  rows={2}
                />
                
                <InputField
                  label="Tags"
                  id="blog-tags"
                  type="text"
                  value={blogForm.tags}
                  onChange={(value) => setBlogForm({ ...blogForm, tags: value as string })}
                  helperText="Separate tags with commas"
                />
                
                <InputField
                  label="Image URL"
                  id="blog-image"
                  type="text"
                  value={blogForm.imageUrl}
                  onChange={(value) => setBlogForm({ ...blogForm, imageUrl: value as string })}
                  placeholder="https://example.com/image.jpg"
                />
                
                <div className="flex space-x-4">
                  <InputField
                    label="Published"
                    id="blog-published"
                    type="checkbox"
                    value={blogForm.published}
                    onChange={(value) => setBlogForm({ ...blogForm, published: value as boolean })}
                  />
                  <InputField
                    label="Featured"
                    id="blog-featured"
                    type="checkbox"
                    value={blogForm.featured}
                    onChange={(value) => setBlogForm({ ...blogForm, featured: value as boolean })}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <InputField
                    label="Content"
                    id="blog-content"
                    type="text"
                    value={blogForm.content}
                    onChange={(value) => setBlogForm({ ...blogForm, content: value as string })}
                    required
                    multiline
                    rows={6}
                  />
                </div>
                
                <div className="md:col-span-2 flex space-x-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1"
                  >
                    {editingBlogId ? "Update Blog" : "Create Blog"}
                  </Button>
                  
                  {editingBlogId && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => {
                        setEditingBlogId(null);
                        resetForms();
                      }}
                      className="flex-1"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
                
                {/* Error display removed for simplicity */}
              </form>
            </FormSection>
          ) : (
            <FormSection 
              title={editingEventId ? 'Update Event' : 'Create Event'} 
              description="Fill in the details for your new event"
            >
              <form onSubmit={handleEventSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Title"
                  id="event-title"
                  type="text"
                  value={eventForm.title}
                  onChange={(value) => setEventForm({ ...eventForm, title: value as string })}
                  required
                />
                
                <InputField
                  label="Location"
                  id="event-location"
                  type="text"
                  value={eventForm.location}
                  onChange={(value) => setEventForm({ ...eventForm, location: value as string })}
                  required
                />
                
                <InputField
                  label="Start Date"
                  id="event-start-date"
                  type="date"
                  value={eventForm.date}
                  onChange={(value) => setEventForm({ ...eventForm, date: value as string })}
                  required
                />
                
                <InputField
                  label="End Date"
                  id="event-end-date"
                  type="date"
                  value={eventForm.endDate}
                  onChange={(value) => setEventForm({ ...eventForm, endDate: value as string })}
                />
                
                <InputField
                  label="Event Type"
                  id="event-type"
                  value={eventForm.eventType}
                  onChange={(value) => setEventForm({ ...eventForm, eventType: value as "CONFERENCE" | "MEETUP" | "WORKSHOP" | "WEBINAR" | "HACKATHON" })}
                  options={[
                    { value: 'CONFERENCE', label: 'Conference' },
                    { value: 'MEETUP', label: 'Meetup' },
                    { value: 'WORKSHOP', label: 'Workshop' },
                    { value: 'WEBINAR', label: 'Webinar' },
                    { value: 'HACKATHON', label: 'Hackathon' },
                  ]}
                />
                
                <InputField
                  label="Capacity"
                  id="event-capacity"
                  type="number"
                  value={eventForm.capacity || ''}
                  onChange={(value) => setEventForm({ 
                    ...eventForm, 
                    capacity: value ? parseInt(value as string) : null 
                  })}
                />
                
                <InputField
                  label="Registration URL"
                  id="event-registration-url"
                  type="text"
                  value={eventForm.registrationUrl}
                  onChange={(value) => setEventForm({ ...eventForm, registrationUrl: value as string })}
                  placeholder="https://example.com/register"
                />
                
                <InputField
                  label="Image URL"
                  id="event-image"
                  type="text"
                  value={eventForm.imageUrl}
                  onChange={(value) => setEventForm({ ...eventForm, imageUrl: value as string })}
                  placeholder="https://example.com/image.jpg"
                />
                
                <div className="flex items-center space-x-4">
                  <InputField
                    label="Virtual Event"
                    id="event-virtual"
                    type="checkbox"
                    value={eventForm.isVirtual}
                    onChange={(value) => setEventForm({ ...eventForm, isVirtual: value as boolean })}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <InputField
                    label="Description"
                    id="event-description"
                    type="text"
                    value={eventForm.description}
                    onChange={(value) => setEventForm({ ...eventForm, description: value as string })}
                    required
                    multiline
                    rows={4}
                  />
                </div>
                
                <div className="md:col-span-2 flex space-x-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1"
                  >
                    {editingEventId ? "Update Event" : "Create Event"}
                  </Button>
                  
                  {editingEventId && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => {
                        setEditingEventId(null);
                        resetForms();
                      }}
                      className="flex-1"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
                
                {/* Error display removed for simplicity */}
              </form>
            </FormSection>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <Card title="Manage Blogs">
              <Table
                columns={blogColumns}
                data={(blogsData as { blogs: { items: Record<string, unknown>[] } })?.blogs?.items || []}
                onEdit={handleEditBlog}
                onDelete={handleDeleteBlog}
                emptyMessage="No blogs found"
              />
            </Card>
          </div>
          
          <div className="p-6">
            <Card title="Manage Events">
              <Table
                columns={eventColumns}
                data={(eventsData as { events: { items: Record<string, unknown>[] } })?.events?.items || []}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                emptyMessage="No events found"
              />
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}
