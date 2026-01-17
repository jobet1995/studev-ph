'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
}

// Event interface is defined later after Post

interface Engagement {
  id: string;
  type: string;
  metric: string;
  value: number;
  change: number;
}

interface PipelineItem {
  id: string;
  title: string;
  stage: string;
  value: number;
  owner: string;
  deadline: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  eventType: string;
  attendees?: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  category: string;
}

// Define TypeScript interfaces for GraphQL response
interface RecentActivity {
  id: string;
  title: string;
  type: string;
  timestamp: string;
  action: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  eventType: string;
}

interface FeaturedBlog {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  imageUrl: string;
}

interface DashboardStats {
  totalBlogs: number;
  publishedBlogs: number;
  totalEvents: number;
  totalUsers: number;
  totalPosts: number;
}

interface PaginatedPosts {
  items: Post[];
  totalCount: number;
}

interface GetDashboardDataQuery {
  recentActivity: RecentActivity[];
  upcomingEvents: UpcomingEvent[];
  featuredBlogs: FeaturedBlog[];
  posts: PaginatedPosts;
  dashboardStats: DashboardStats;
}

/**
 * Admin dashboard page component displaying summary statistics and recent activities
 * @returns {JSX.Element} The admin dashboard page
 */
const DashboardPage = () => {
  // Fetch dashboard data from Firebase (simulated with mock data)
  const [data, setData] = useState<GetDashboardDataQuery | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get user information from localStorage
  const [user, setUser] = useState<{firstName?: string, lastName?: string, email?: string, role?: string} | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);
  
  useEffect(() => {
    // Fetch data from Firebase backend
    const fetchData = async () => {
      try {
        // Get auth token
        let token = localStorage.getItem('admin_token');
        
        // Get user data for debugging
        const storedUser = localStorage.getItem('admin_user');
        let userRole = 'unknown';
        let userId = 'unknown';
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userRole = parsedUser.role || 'no-role-specified';
            userId = parsedUser.id || 'no-id-specified';
            console.log('DEBUG: User role from localStorage:', userRole);
            console.log('DEBUG: User ID from localStorage:', userId);
            console.log('DEBUG: Full user object:', parsedUser);
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
        
        console.log('DEBUG: Attempting to fetch dashboard data with role:', userRole, 'and ID:', userId);
        
        // Fetch dashboard data from API
        let response = await fetch('/api/dashboard/data', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('DEBUG: API response status:', response.status);
        
        // If we get a 401/403, try to refresh the token
        if (response.status === 401 || response.status === 403) {
          console.log('Access token expired or invalid, attempting refresh...');
          
          const refreshResult = await refreshAccessToken();
          if (refreshResult.success) {
            token = refreshResult.newToken;
            
            // Retry the request with the new token
            response = await fetch('/api/dashboard/data', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            // If the retry after refresh still fails, throw an error
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || `Failed to fetch dashboard data after token refresh: Status ${response.status}`);
            }
          } else {
            // If refresh failed, redirect to login
            setError('Session expired. Please log in again.');
            setTimeout(() => {
              window.location.href = '/admin/login';
            }, 2000);
            return;
          }
        }
        
        // Only process the response if it's OK (this won't execute if we returned early due to refresh failure)
        if (!response.ok) {
          // Try to parse error response, fallback to text if JSON fails
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            // If JSON parsing fails, get text response
            const errorText = await response.text();
            console.error('Error parsing JSON response:', parseError);
            throw new Error(errorText || `Failed to fetch dashboard data: Status ${response.status}`);
          }
          
          // If it's a 401 or 403 error, this might indicate an expired token
          if (response.status === 401 || response.status === 403) {
            throw new Error('Token expired or unauthorized');
          }
          
          throw new Error(errorData.message || `Failed to fetch dashboard data: Status ${response.status}`);
        }
        
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Error parsing dashboard response:', parseError);
          throw new Error(`Failed to parse response: ${errorText}`);
        }
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }
        
        console.log('DEBUG: Dashboard data fetched successfully');
        setData(result.data);
      } catch (err: unknown) {
        console.error('DEBUG: Error in fetchData:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    // Function to refresh access token
    const refreshAccessToken = async () => {
      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        
        if (!refreshToken) {
          console.log('DEBUG: No refresh token available');
          return { success: false, error: 'No refresh token available' };
        }
        
        console.log('DEBUG: Attempting to refresh token');
        
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${refreshToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('DEBUG: Refresh response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Token refresh failed:', errorData.message);
          return { success: false, error: errorData.message };
        }
        
        const result = await response.json();
        
        console.log('DEBUG: Refresh result received:', result.success);
        
        if (result.success && result.data.token) {
          localStorage.setItem('admin_token', result.data.token);
          console.log('DEBUG: New access token stored');
          
          // Update user data if needed
          if (result.data.user) {
            const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
            localStorage.setItem('admin_user', JSON.stringify({
              ...currentUser,
              ...result.data.user
            }));
          }
          return { success: true, newToken: result.data.token };
        } else {
          return { success: false, error: result.message || 'Token refresh failed' };
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        return { success: false, error: 'Network error during token refresh' };
      }
    };
    
    fetchData();
  }, []);

  // Define type for stats
  type Stat = {
    id: number;
    name: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };

  // Stats for the summary cards - derived from mock data
  const stats: Stat[] = data ? [
    { id: 1, name: 'Total Blogs', value: data.dashboardStats.totalBlogs.toString(), change: '', changeType: 'neutral' as const },
    { id: 2, name: 'Published Blogs', value: data.dashboardStats.publishedBlogs.toString(), change: '', changeType: 'neutral' as const },
    { id: 3, name: 'Total Events', value: data.dashboardStats.totalEvents.toString(), change: '', changeType: 'neutral' as const },
    { id: 4, name: 'Total Posts', value: data.dashboardStats.totalPosts.toString(), change: '', changeType: 'neutral' as const },
  ] : [
    { id: 1, name: 'Active Members', value: '...', change: '', changeType: 'neutral' },
    { id: 2, name: 'Volunteers', value: '...', change: '', changeType: 'neutral' },
    { id: 3, name: 'Pending Tasks', value: '...', change: '', changeType: 'neutral' },
    { id: 4, name: 'Community Impact', value: '...', change: '', changeType: 'neutral' },
  ];

  // Activities derived from mock data
  const activities: Activity[] = data ? data.recentActivity.map((activity) => ({
    id: activity.id,
    user: activity.title,
    action: activity.action,
    target: activity.type,
    time: activity.timestamp,
    avatar: 'https://placehold.co/40x40?text=U' // Default avatar
  })) : [];

  // Events derived from mock data
  const events: Event[] = data ? data.upcomingEvents.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    time: '', // No time in mock data, set as empty
    location: event.location,
    eventType: event.eventType,
    attendees: 0 // No attendees in mock response, default to 0
  })) : [];

  // Pipeline derived from mock data
  const pipeline: PipelineItem[] = data ? data.posts.items.map((post, index) => ({
    id: post.id,
    title: post.title,
    stage: 'Published',
    value: index + 10, // Some arbitrary value
    owner: post.author,
    deadline: post.createdAt
  })) : [];

  // Engagements derived from mock data
  const engagements: Engagement[] = data ? [
    {
      id: '1',
      type: 'Blog Engagement',
      metric: 'Total Blogs',
      value: data.dashboardStats.totalBlogs,
      change: 0
    },
    {
      id: '2',
      type: 'Event Engagement',
      metric: 'Total Events',
      value: data.dashboardStats.totalEvents,
      change: 0
    },
    {
      id: '3',
      type: 'Post Engagement',
      metric: 'Total Posts',
      value: data.dashboardStats.totalPosts,
      change: 0
    },
    {
      id: '4',
      type: 'User Engagement',
      metric: 'Total Users',
      value: data.dashboardStats.totalUsers,
      change: 0
    }
  ] : [];

  // Featured blogs derived from mock data
  const featuredBlogs: FeaturedBlog[] = data ? data.featuredBlogs.map(blog => ({
    id: blog.id,
    title: blog.title,
    author: blog.author,
    date: blog.date,
    excerpt: blog.excerpt,
    imageUrl: blog.imageUrl
  })) : [];


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    // Check if the error is a permissions issue
    const isPermissionError = error.includes('Insufficient permissions') || error.includes('403') || error.includes('Unauthorized');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {isPermissionError ? 'Access Issue' : 'Error Loading Dashboard'}
          </h2>
          <p className="text-gray-600 mb-4">{error || 'An error occurred while loading dashboard data.'}</p>
          
          {isPermissionError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-left">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> There was an issue with your access to the dashboard.
                This could be due to an expired session or role permissions.
              </p>
            </div>
          )}
          
          <button 
            onClick={() => {
              if (isPermissionError) {
                // If it's a permission/session error, redirect to profile page
                window.location.href = '/admin/profile';
              } else {
                window.location.reload();
              }
            }}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {isPermissionError ? 'Check Profile' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user ? user.firstName || user.lastName || (user.email ? user.email.split('@')[0] : 'User') : 'User'}! Here&#39;s what&#39;s happening today.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              {stat.change && (
                <p className={`ml-2 text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                    {stat.change}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pipeline</h2>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Initiative
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pipeline.length > 0 ? (
                    pipeline.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.stage === 'Completed' ? 'bg-green-100 text-green-800' :
                            item.stage === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            item.stage === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.value.toLocaleString()} people
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.owner}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.deadline}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No pipeline data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={activity.avatar}
                      alt={`${activity.user} avatar`}
                      width={40}
                      height={40}
                    />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user} <span className="font-normal text-gray-700">{activity.action}</span> {activity.target}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No recent activities
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View Calendar
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-700">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.date} • {event.time}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.location} • {event.eventType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No upcoming events
                </div>
              )}
            </div>
          </div>

          {/* Featured Blogs Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Featured Blogs</h2>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {featuredBlogs.length > 0 ? (
                featuredBlogs.map((blog) => (
                  <div key={blog.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden mr-4">
                        <Image 
                          src={blog.imageUrl || 'https://placehold.co/80x80?text=Blog'} 
                          alt={blog.title}
                          className="w-full h-full object-cover"
                          width={80}
                          height={80}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{blog.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          By {blog.author} • {new Date(blog.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {blog.excerpt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No featured blogs
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Postings Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Postings</h2>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {(data?.posts?.items || []).length > 0 ? (
                (data?.posts?.items || []).map((post) => (
                  <div key={post.id} className="p-6 hover:bg-gray-50">
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{post.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {post.category} • By {post.author}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(post.createdAt).toLocaleDateString()} • {post.content.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No recent postings
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Engagements Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Engagements</h2>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View Analytics
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {engagements.length > 0 ? (
                  engagements.map((engagement) => (
                    <div key={engagement.id} className="bg-gray-50 p-5 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900">{engagement.type}</h3>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">
                          {engagement.metric.includes('Rate') ? `${engagement.value}%` : engagement.value.toLocaleString()}
                        </p>
                        <p className={`ml-2 text-sm font-medium ${
                          engagement.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {engagement.change >= 0 ? '+' : ''}{engagement.change}%
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{engagement.metric}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No engagement data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;