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
  const [createBlog, { loading: blogCreating, error: blogCreateError }] = useMutation(CREATE_BLOG);
  const [updateBlog, { loading: blogUpdating, error: blogUpdateError }] = useMutation(UPDATE_BLOG);
  const [deleteBlog, { loading: blogDeleting }] = useMutation(DELETE_BLOG);
  
  const [createEvent, { loading: eventCreating, error: eventCreateError }] = useMutation(CREATE_EVENT);
  const [updateEvent, { loading: eventUpdating, error: eventUpdateError }] = useMutation(UPDATE_EVENT);
  const [deleteEvent, { loading: eventDeleting }] = useMutation(DELETE_EVENT);
  
  // Queries to fetch existing content
  const { data: blogsData, refetch: refetchBlogs } = useQuery(GET_ALL_BLOGS, { fetchPolicy: 'network-only' });
  const { data: eventsData, refetch: refetchEvents } = useQuery(GET_ALL_EVENTS, { fetchPolicy: 'network-only' });
  
  // Handle blog form submission
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const blogInput = {
      ...blogForm,
      tags: blogForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      published: blogForm.published,
      featured: blogForm.featured,
    };
    
    try {
      if (editingBlogId) {
        const { id, ...restBlogInput } = blogInput;
        await updateBlog({ variables: { input: { id: editingBlogId, ...restBlogInput } } });
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
      ...eventForm,
      capacity: eventForm.capacity || undefined,
    };
    
    try {
      if (editingEventId) {
        const { id, ...restEventInput } = eventInput;
        await updateEvent({ variables: { input: { id: editingEventId, ...restEventInput } } });
        setEditingEventId(null);
        alert("Event updated successfully!");
      } else {
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
  const handleEditBlog = (blog: any) => {
    setBlogForm({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || "",
      author: blog.author,
      tags: blog.tags ? blog.tags.join(',') : "",
      published: blog.published,
      featured: blog.featured,
      imageUrl: blog.imageUrl || "",
    });
    setEditingBlogId(blog.id);
    setActiveTab('create');
  };
  
  // Handle editing an event
  const handleEditEvent = (event: any) => {
    setEventForm({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      endDate: event.endDate || "",
      location: event.location,
      eventType: event.eventType,
      capacity: event.capacity || null,
      isVirtual: event.isVirtual,
      registrationUrl: event.registrationUrl || "",
      imageUrl: event.imageUrl || "",
    });
    setEditingEventId(event.id);
    setActiveTab('create');
  };
  
  // Handle deleting a blog
  const handleDeleteBlog = async (item: any) => {
    const id = item.id;
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
  const handleDeleteEvent = async (item: any) => {
    const id = item.id;
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
  
  const tabs = [
    { id: 'create', label: 'Create Content' },
    { id: 'manage', label: 'Manage Content' },
  ];
  
  // Define table columns
  const blogColumns = [
    { key: 'title', header: 'Title' },
    { key: 'author', header: 'Author' },
    {
      key: 'published',
      header: 'Status',
      render: (blog: any) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${blog.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {blog.published ? 'Published' : 'Draft'}
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
      render: (event: any) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {event.eventType}
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
      <div className="mb-6">
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
                    disabled={blogCreating || blogUpdating}
                    className="flex-1"
                  >
                    {(blogCreating || blogUpdating) ? "Processing..." : editingBlogId ? "Update Blog" : "Create Blog"}
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
                
                {(blogCreateError || blogUpdateError) && (
                  <div className="md:col-span-2">
                    <p className="text-red-500 text-sm mt-2">Error: {(blogCreateError || blogUpdateError)?.message}</p>
                  </div>
                )}
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
                  onChange={(value) => setEventForm({ ...eventForm, eventType: value as any })}
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
                    disabled={eventCreating || eventUpdating}
                    className="flex-1"
                  >
                    {(eventCreating || eventUpdating) ? "Processing..." : editingEventId ? "Update Event" : "Create Event"}
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
                
                {(eventCreateError || eventUpdateError) && (
                  <div className="md:col-span-2">
                    <p className="text-red-500 text-sm mt-2">Error: {(eventCreateError || eventUpdateError)?.message}</p>
                  </div>
                )}
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
                data={(blogsData as any)?.blogs?.items || []}
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
                data={(eventsData as any)?.events?.items || []}
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
