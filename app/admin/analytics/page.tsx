"use client";

import { useState } from 'react';
import Layout from '../components/Layout';

// Mock data for analytics
const mockAnalyticsData = {
  totalVisitors: 12489,
  pageViews: 42392,
  bounceRate: 32.4,
  avgSessionDuration: '2m 34s',
  trafficSources: [
    { source: 'Organic Search', percentage: 45, value: 5614 },
    { source: 'Direct', percentage: 28, value: 3494 },
    { source: 'Social Media', percentage: 15, value: 1872 },
    { source: 'Referral', percentage: 12, value: 1509 },
  ],
  topPages: [
    { page: '/blogs', views: 8452, percentage: 20.1 },
    { page: '/events', views: 6721, percentage: 15.9 },
    { page: '/', views: 5432, percentage: 12.9 },
    { page: '/admin', views: 3210, percentage: 7.6 },
    { page: '/about', views: 2105, percentage: 5.0 },
  ],
  recentActivity: [
    { user: 'John Doe', action: 'Created new blog post', time: '2 minutes ago' },
    { user: 'Jane Smith', action: 'Updated event details', time: '15 minutes ago' },
    { user: 'Bob Johnson', action: 'Changed settings', time: '1 hour ago' },
    { user: 'Alice Williams', action: 'Published new event', time: '2 hours ago' },
    { user: 'Charlie Brown', action: 'Commented on blog', time: '3 hours ago' },
  ]
};

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('last7days');

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin' },
    { id: 'analytics', label: 'Analytics', href: '/admin/analytics' },
    { id: 'media', label: 'Media Library', href: '/admin/media' },
    { id: 'create', label: 'Create Content', href: '/admin#create' },
    { id: 'manage', label: 'Manage Content', href: '/admin#manage' },
    { id: 'users', label: 'Users', href: '/admin/users' },
    { id: 'settings', label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <Layout 
      title="Admin Dashboard" 
      sidebarTitle="StuDev Admin" 
      sidebarItems={sidebarItems}
      sidebarSelectedItem="analytics"
      user={{ name: 'Admin User', avatar: undefined }}
      onLogout={() => alert('Logout functionality would go here')}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-800">Track your website performance and user engagement</p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex justify-end">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
        >
          <option value="today">Today</option>
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
          <option value="last90days">Last 90 days</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Visitors</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{mockAnalyticsData.totalVisitors.toLocaleString()}</div>
          <div className="mt-1 text-sm text-green-600">↑ 12.4% from last week</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Page Views</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{mockAnalyticsData.pageViews.toLocaleString()}</div>
          <div className="mt-1 text-sm text-green-600">↑ 8.2% from last week</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Bounce Rate</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{mockAnalyticsData.bounceRate}%</div>
          <div className="mt-1 text-sm text-red-600">↓ 2.1% from last week</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Avg. Session</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{mockAnalyticsData.avgSessionDuration}</div>
          <div className="mt-1 text-sm text-green-600">↑ 0.3% from last week</div>
        </div>
      </div>

      {/* Charts and Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h3>
          <div className="space-y-4">
            {mockAnalyticsData.trafficSources.map((source, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{source.source}</span>
                  <span>{source.value.toLocaleString()} ({source.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Views
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockAnalyticsData.topPages.map((page, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {page.page}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {mockAnalyticsData.recentActivity.map((activity, index) => (
              <li key={index} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.action}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;