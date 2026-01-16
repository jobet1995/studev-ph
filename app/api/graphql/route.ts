import { createSchema, createYoga } from 'graphql-yoga';

// Define TypeScript interfaces for our data models
interface Blog {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    author: string;
    date: string;
    updatedAt?: string;
    slug: string;
    tags: string[];
    published: boolean;
    featured: boolean;
    imageUrl?: string;
    readTime?: number;
}

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    endDate?: string;
    location: string;
    slug: string;
    eventType: string;
    capacity?: number | null;
    registeredCount: number;
    isVirtual: boolean;
    registrationUrl?: string;
    imageUrl?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    lastActive?: string;
}

interface Post {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    author: string;
    createdAt: string;
    updatedAt?: string;
    published: boolean;
}

// Initialize data stores
let blogs: Blog[] = [];
let events: Event[] = [];
let posts: Post[] = [];

// Start with completely empty data stores
blogs = [];
events = [];
posts = [];

import { join } from 'path';
import { readFileSync } from 'fs';

const typeDefs = readFileSync(join(process.cwd(), 'app/api/graphql/schema.graphql'), 'utf8');

const schema = createSchema({
    typeDefs,
    resolvers: {
        Query: {
            // Enhanced blog queries with filtering, sorting and pagination
            blogs: (_: unknown, { filter, sort, pagination }: { filter?: any; sort?: any; pagination?: any }) => {
                let filteredBlogs = [...blogs];
                
                // Apply filters if provided
                if (filter) {
                    if (filter.author) {
                        filteredBlogs = filteredBlogs.filter(blog => blog.author === filter.author);
                    }
                    if (filter.tag) {
                        filteredBlogs = filteredBlogs.filter(blog => blog.tags.includes(filter.tag));
                    }
                    if (typeof filter.published !== 'undefined') {
                        filteredBlogs = filteredBlogs.filter(blog => blog.published === filter.published);
                    }
                    if (typeof filter.featured !== 'undefined') {
                        filteredBlogs = filteredBlogs.filter(blog => blog.featured === filter.featured);
                    }
                }
                
                // Apply sorting if provided
                if (sort) {
                    filteredBlogs.sort((a, b) => {
                        let aValue: any, bValue: any;
                        
                        switch(sort.field) {
                            case 'DATE':
                                aValue = new Date(a.date).getTime();
                                bValue = new Date(b.date).getTime();
                                break;
                            case 'TITLE':
                                aValue = a.title.toLowerCase();
                                bValue = b.title.toLowerCase();
                                break;
                            case 'AUTHOR':
                                aValue = a.author.toLowerCase();
                                bValue = b.author.toLowerCase();
                                break;
                            default:
                                aValue = (a as any)[sort.field.toLowerCase()];
                                bValue = (b as any)[sort.field.toLowerCase()];
                        }
                        
                        if (sort.direction === 'ASC') {
                            return aValue > bValue ? 1 : -1;
                        } else {
                            return aValue < bValue ? 1 : -1;
                        }
                    });
                }
                
                // Apply pagination
                const page = pagination?.page || 1;
                const limit = pagination?.limit || 10;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedItems = filteredBlogs.slice(startIndex, endIndex);
                
                return {
                    items: paginatedItems,
                    totalCount: filteredBlogs.length,
                    hasNextPage: endIndex < filteredBlogs.length,
                    hasPreviousPage: startIndex > 0,
                    currentPage: page,
                };
            },
            
            blog: (_: unknown, { id }: { id: string }) => {
                return blogs.find(blog => blog.id === id) || null;
            },
            
            blogBySlug: (_: unknown, { slug }: { slug: string }) => {
                return blogs.find(blog => blog.slug === slug) || null;
            },
            
            featuredBlogs: (_: unknown, { limit }: { limit: number }) => {
                return blogs.filter(blog => blog.featured).slice(0, limit || 5);
            },
            
            // Enhanced event queries with filtering and pagination
            events: (_: unknown, { filter, pagination }: { filter?: any; pagination?: any }) => {
                let filteredEvents = [...events];
                
                // Apply filters if provided
                if (filter) {
                    if (filter.eventType) {
                        filteredEvents = filteredEvents.filter(event => event.eventType === filter.eventType);
                    }
                    if (filter.location) {
                        filteredEvents = filteredEvents.filter(event => event.location.includes(filter.location));
                    }
                    if (typeof filter.isVirtual !== 'undefined') {
                        filteredEvents = filteredEvents.filter(event => event.isVirtual === filter.isVirtual);
                    }
                    if (filter.upcoming) {
                        const today = new Date();
                        filteredEvents = filteredEvents.filter(event => new Date(event.date) >= today);
                    }
                }
                
                // Apply pagination
                const page = pagination?.page || 1;
                const limit = pagination?.limit || 10;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedItems = filteredEvents.slice(startIndex, endIndex);
                
                return {
                    items: paginatedItems,
                    totalCount: filteredEvents.length,
                    hasNextPage: endIndex < filteredEvents.length,
                    hasPreviousPage: startIndex > 0,
                    currentPage: page,
                };
            },
            
            event: (_: unknown, { id }: { id: string }) => {
                return events.find(event => event.id === id) || null;
            },
            
            eventBySlug: (_: unknown, { slug }: { slug: string }) => {
                return events.find(event => event.slug === slug) || null;
            },
            
            upcomingEvents: (_: unknown, { limit }: { limit: number }) => {
                const today = new Date();
                return events
                    .filter(event => new Date(event.date) >= today)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, limit || 5);
            },
            
            eventsByType: (_: unknown, { eventType }: { eventType: string }) => {
                return events.filter(event => event.eventType === eventType);
            },
            
            search: (_: unknown, { query }: { query: string }) => {
                const lowerQuery = query.toLowerCase();
                
                const matchedBlogs = blogs.filter(blog => 
                    blog.title.toLowerCase().includes(lowerQuery) || 
                    blog.content.toLowerCase().includes(lowerQuery) ||
                    blog.excerpt?.toLowerCase().includes(lowerQuery) ||
                    blog.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
                );
                
                const matchedEvents = events.filter(event => 
                    event.title.toLowerCase().includes(lowerQuery) || 
                    event.description.toLowerCase().includes(lowerQuery) ||
                    event.location.toLowerCase().includes(lowerQuery)
                );
                
                return {
                    blogs: matchedBlogs,
                    events: matchedEvents,
                    totalCount: matchedBlogs.length + matchedEvents.length,
                };
            },
            
            // User queries
            users: (_: unknown, { filter, pagination }: { filter?: any; pagination?: any }) => {
                // For now, return empty users list since we removed mock data
                // In a real app, this would query a user database
                const users: User[] = [];
                
                // Apply pagination
                const page = pagination?.page || 1;
                const limit = pagination?.limit || 10;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedItems = users.slice(startIndex, endIndex);
                
                return {
                    items: paginatedItems,
                    totalCount: users.length,
                    hasNextPage: endIndex < users.length,
                    hasPreviousPage: startIndex > 0,
                    currentPage: page,
                };
            },
            
            user: (_: unknown, { id }: { id: string }) => {
                // Return null since we have no user data
                return null;
            },
            
            // Post queries
            posts: (_: unknown, { filter, pagination }: { filter?: any; pagination?: any }) => {
                let filteredPosts = [...posts];
                
                // Apply filters if provided
                if (filter) {
                    if (filter.category) {
                        filteredPosts = filteredPosts.filter(post => post.category === filter.category);
                    }
                    if (filter.priority) {
                        filteredPosts = filteredPosts.filter(post => post.priority === filter.priority);
                    }
                    if (filter.author) {
                        filteredPosts = filteredPosts.filter(post => post.author === filter.author);
                    }
                    if (typeof filter.published !== 'undefined') {
                        filteredPosts = filteredPosts.filter(post => post.published === filter.published);
                    }
                }
                
                // Apply pagination
                const page = pagination?.page || 1;
                const limit = pagination?.limit || 10;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedItems = filteredPosts.slice(startIndex, endIndex);
                
                return {
                    items: paginatedItems,
                    totalCount: filteredPosts.length,
                    hasNextPage: endIndex < filteredPosts.length,
                    hasPreviousPage: startIndex > 0,
                    currentPage: page,
                };
            },
            
            post: (_: unknown, { id }: { id: string }) => {
                return posts.find(post => post.id === id) || null;
            },
            
            dashboardStats: () => {
                // Calculate dashboard statistics
                const totalBlogs = blogs.length;
                const publishedBlogs = blogs.filter(blog => blog.published).length;
                const totalEvents = events.length;
                const totalPosts = posts.length;
                
                // For simplicity, assuming 10 users (would come from a real user data source)
                const totalUsers = 10;
                
                return {
                    totalBlogs,
                    publishedBlogs,
                    totalEvents,
                    totalUsers,
                    totalPosts,
                };
            },
            
            recentActivity: (_: unknown, { limit }: { limit: number }) => {
                // Create recent activity data based on existing blogs, events, and posts
                const activity = [
                    ...blogs.slice(0, 2).map((blog, index) => ({
                        id: `blog-${blog.id}`,
                        title: blog.title,
                        type: 'blog',
                        timestamp: blog.updatedAt || blog.date,
                        action: 'Published',
                    })),
                    ...events.slice(0, 2).map((event, index) => ({
                        id: `event-${event.id}`,
                        title: event.title,
                        type: 'event',
                        timestamp: event.date,
                        action: 'Scheduled',
                    })),
                    ...posts.slice(0, 2).map((post, index) => ({
                        id: `post-${post.id}`,
                        title: post.title,
                        type: 'post',
                        timestamp: post.createdAt,
                        action: 'Posted',
                    })),
                ];
                
                // Sort by date descending and limit
                const sortedActivity = activity.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                
                return sortedActivity.slice(0, limit || 10);
            }
        },
        Mutation: {
            // Enhanced blog mutations
            createBlog: (_: unknown, { input }: { input: any }) => {
                const newBlog = {
                    id: String(blogs.length + 1),
                    title: input.title,
                    content: input.content,
                    excerpt: input.excerpt,
                    author: input.author,
                    date: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0],
                    slug: input.title.toLowerCase().replace(/ /g, '-'),
                    tags: input.tags || [],
                    published: input.published !== undefined ? input.published : true,
                    featured: input.featured !== undefined ? input.featured : false,
                    imageUrl: input.imageUrl,
                    readTime: input.readTime || Math.ceil(input.content.length / 1000), // Estimate read time
                };
                blogs.push(newBlog);
                return newBlog;
            },
            
            updateBlog: (_: unknown, { input }: { input: any }) => {
                const blogIndex = blogs.findIndex(blog => blog.id === input.id);
                if (blogIndex === -1) {
                    throw new Error(`Blog with id ${input.id} not found`);
                }
                
                const updatedBlog = {
                    ...blogs[blogIndex],
                    ...input,
                    updatedAt: new Date().toISOString().split('T')[0],
                    slug: input.title ? input.title.toLowerCase().replace(/ /g, '-') : blogs[blogIndex].slug,
                    readTime: input.content ? Math.ceil(input.content.length / 1000) : blogs[blogIndex].readTime,
                };
                
                blogs[blogIndex] = updatedBlog;
                return updatedBlog;
            },
            
            deleteBlog: (_: unknown, { id }: { id: string }) => {
                const initialLength = blogs.length;
                const blogIndex = blogs.findIndex(blog => blog.id === id);
                if (blogIndex !== -1) {
                    blogs.splice(blogIndex, 1);
                }
                return blogs.length < initialLength;
            },
            
            publishBlog: (_: unknown, { id }: { id: string }) => {
                const blogIndex = blogs.findIndex(blog => blog.id === id);
                if (blogIndex === -1) {
                    throw new Error(`Blog with id ${id} not found`);
                }
                
                blogs[blogIndex].published = true;
                blogs[blogIndex].updatedAt = new Date().toISOString().split('T')[0];
                
                return blogs[blogIndex];
            },
            
            // Enhanced event mutations
            createEvent: (_: unknown, { input }: { input: any }) => {
                const newEvent = {
                    id: String(events.length + 1),
                    title: input.title,
                    description: input.description,
                    date: input.date,
                    endDate: input.endDate,
                    location: input.location,
                    slug: input.title.toLowerCase().replace(/ /g, '-'),
                    eventType: input.eventType,
                    capacity: input.capacity || null,
                    registeredCount: 0, // Initially zero registrations
                    isVirtual: input.isVirtual !== undefined ? input.isVirtual : false,
                    registrationUrl: input.registrationUrl,
                    imageUrl: input.imageUrl,
                };
                events.push(newEvent);
                return newEvent;
            },
            
            updateEvent: (_: unknown, { input }: { input: any }) => {
                const eventIndex = events.findIndex(event => event.id === input.id);
                if (eventIndex === -1) {
                    throw new Error(`Event with id ${input.id} not found`);
                }
                
                const updatedEvent = {
                    ...events[eventIndex],
                    ...input,
                };
                
                events[eventIndex] = updatedEvent;
                return updatedEvent;
            },
            
            deleteEvent: (_: unknown, { id }: { id: string }) => {
                const initialLength = events.length;
                const eventIndex = events.findIndex(event => event.id === id);
                if (eventIndex !== -1) {
                    events.splice(eventIndex, 1);
                }
                return events.length < initialLength;
            },
            
            registerForEvent: (_: unknown, { eventId, userEmail }: { eventId: string; userEmail: string }) => {
                const event = events.find(e => e.id === eventId);
                if (!event) {
                    throw new Error(`Event with id ${eventId} not found`);
                }
                
                if (event.capacity && event.registeredCount >= event.capacity) {
                    throw new Error(`Event ${eventId} is at full capacity`);
                }
                
                // In a real app, you'd store the registration information
                // For now, just increment the registered count
                event.registeredCount += 1;
                return true;
            },
            
            // Post mutations
            createPost: (_: unknown, { input }: { input: any }) => {
                const newPost = {
                    id: String(posts.length + 1),
                    title: input.title,
                    content: input.content,
                    category: input.category,
                    priority: input.priority,
                    author: input.author,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    published: input.published !== undefined ? input.published : true,
                };
                posts.push(newPost);
                return newPost;
            },
            
            updatePost: (_: unknown, { input }: { input: any }) => {
                const postIndex = posts.findIndex(post => post.id === input.id);
                if (postIndex === -1) {
                    throw new Error(`Post with id ${input.id} not found`);
                }
                
                const updatedPost = {
                    ...posts[postIndex],
                    ...input,
                    updatedAt: new Date().toISOString(),
                };
                
                posts[postIndex] = updatedPost;
                return updatedPost;
            },
            
            deletePost: (_: unknown, { id }: { id: string }) => {
                const initialLength = posts.length;
                const postIndex = posts.findIndex(post => post.id === id);
                if (postIndex !== -1) {
                    posts.splice(postIndex, 1);
                }
                return posts.length < initialLength;
            },
        },
    },
});

const { handleRequest } = createYoga({
    schema,
    graphqlEndpoint: '/api/graphql',
    fetchAPI: { Response },
    // Enable GraphiQL for better development experience
    graphiql: {
        title: 'StuDev GraphQL Playground',
        headers: `{\n  "content-type": "application/json"\n}`,
    },
});

export { handleRequest as GET, handleRequest as POST };
