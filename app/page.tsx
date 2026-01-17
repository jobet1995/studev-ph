/**
 * @file                        :page.tsx
 * @description                 :Home page component for the Next.js application.
 * @author                      :Jobet P. Casquejo
 * @last_modified_on            :12-23-20254
 * @last_modified_by            :Jobet P. Casquejo
 *
 * ===========================================================================================
 * Modifications Log
 * Ver                    Date                    Author                  Modification
 * 1.0                    12-23-20254             Jobet P. Casquejo       Initial Version
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { ApolloWrapper } from "./components/apollo-wrapper";
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

// GraphQL query to fetch dynamic content for the landing page
const GET_LANDING_PAGE_CONTENT = gql`
  query GetLandingPageContent {
    featuredBlogs(limit: 3) {
      id
      title
      excerpt
      author
      date
      slug
      imageUrl
    }
    upcomingEvents(limit: 3) {
      id
      title
      description
      date
      location
      eventType
      slug
    }
    stats {
      totalBlogs
      totalEvents
      totalUsers
    }
  }
`;

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
  imageUrl?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  eventType: string;
  slug: string;
}

interface Stats {
  totalBlogs: number;
  totalEvents: number;
  totalUsers: number;
}

interface LandingPageData {
  featuredBlogs: Blog[];
  upcomingEvents: Event[];
  stats: Stats;
}

/**
 * Landing page component
 * Displays featured content, statistics, and navigation for the application
 * @returns {React.ReactElement} Landing page with hero section and featured content
 */
export default function Home(): React.ReactElement {
  const { data, loading, error } = useQuery<LandingPageData>(GET_LANDING_PAGE_CONTENT);

  const featuredBlogs = data?.featuredBlogs || [];
  const upcomingEvents = data?.upcomingEvents || [];
  const stats = data?.stats || {
    totalBlogs: 0,
    totalEvents: 0,
    totalUsers: 0
  };

  return (
    <ApolloWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-indigo-600">StuDev</span>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/blogs" className="text-gray-600 hover:text-indigo-600 transition duration-200">
                  Blogs
                </Link>
                <Link href="/events" className="text-gray-600 hover:text-indigo-600 transition duration-200">
                  Events
                </Link>
                <Link href="/admin" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition duration-200">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
                Empowering Student Developers
              </h1>
              <p className="text-xl text-gray-800 max-w-3xl mx-auto mb-10">
                Connect, learn, and grow with our community of passionate student developers. 
                Access resources, events, and opportunities to enhance your skills.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="/blogs" 
                  className="bg-indigo-600 text-white px-8 py-3 rounded-md text-base font-medium hover:bg-indigo-700 transition duration-200"
                >
                  Explore Resources
                </Link>
                <Link 
                  href="/events" 
                  className="bg-white text-indigo-600 px-8 py-3 rounded-md text-base font-medium border border-indigo-600 hover:bg-indigo-50 transition duration-200"
                >
                  Upcoming Events
                </Link>
              </div>
              
              {/* Dynamic Stats */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-indigo-600">{loading ? '...' : stats.totalBlogs}</div>
                  <div className="text-gray-600">Blogs</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-indigo-600">{loading ? '...' : stats.totalEvents}</div>
                  <div className="text-gray-600">Events</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-indigo-600">{loading ? '...' : stats.totalUsers}</div>
                  <div className="text-gray-600">Members</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Content Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900">Latest Updates</h2>
              <p className="mt-4 text-lg text-gray-800 max-w-2xl mx-auto">
                Stay informed with our latest blog posts and upcoming events
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                Error loading content: {error.message}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Featured Blogs */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Featured Blogs</h3>
                  <div className="space-y-6">
                    {featuredBlogs.length > 0 ? (
                      featuredBlogs.map((blog: Blog) => (
                        <Link key={blog.id} href={`/blogs/${blog.slug}`} className="block group">
                          <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                            {blog.imageUrl && (
                              <Image 
                                src={blog.imageUrl} 
                                alt={blog.title} 
                                width={64}
                                height={64}
                                className="object-cover rounded-md flex-shrink-0"
                              />
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600">{blog.title}</h4>
                              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{blog.excerpt}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-2">
                                <span>By {blog.author}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(blog.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No featured blogs available</p>
                    )}
                  </div>
                </div>
                
                {/* Upcoming Events */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Upcoming Events</h3>
                  <div className="space-y-6">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event: Event) => (
                        <Link key={event.id} href={`/events/${event.slug}`} className="block group">
                          <div className="p-4 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600">{event.title}</h4>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {event.eventType}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{event.description}</p>
                            <div className="flex flex-wrap items-center text-xs text-gray-500 mt-3 space-x-4">
                              <div className="flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {event.location}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No upcoming events available</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900">Why Join StuDev?</h2>
              <p className="mt-4 text-lg text-gray-800 max-w-2xl mx-auto">
                We provide everything you need to grow as a developer and connect with peers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Learning Resources</h3>
                <p className="text-gray-800">
                  Access curated tutorials, articles, and guides to enhance your development skills.
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community Events</h3>
                <p className="text-gray-800">
                  Participate in workshops, hackathons, and networking events with fellow students.
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Career Opportunities</h3>
                <p className="text-gray-800">
                  Discover internships, job opportunities, and mentorship programs tailored for students.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-8">
                Join thousands of student developers who are growing their skills and building their careers.
              </p>
              <Link 
                href="/blogs" 
                className="inline-block bg-white text-indigo-700 px-8 py-3 rounded-md text-base font-medium hover:bg-indigo-50 transition duration-200"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">StuDev</h3>
                <p className="text-gray-400">
                  Empowering the next generation of developers through community, resources, and opportunities.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><Link href="/blogs" className="text-gray-400 hover:text-white transition duration-200">Blog</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition duration-200">Tutorials</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition duration-200">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Community</h4>
                <ul className="space-y-2">
                  <li><Link href="/events" className="text-gray-400 hover:text-white transition duration-200">Events</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition duration-200">Forums</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition duration-200">Groups</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white transition duration-200">About</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition duration-200">Careers</Link></li>
                  <li><Link href="/admin" className="text-gray-400 hover:text-white transition duration-200">Admin</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} StuDev. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ApolloWrapper>
  );
}