"use client";



/**
 * Main admin content management page
 * Provides navigation to separate blog and event management pages
 * @returns {JSX.Element} Admin content management page
 */
export default function AdminContentPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management Center</h1>
        <p className="text-lg text-gray-600 max-w-3xl">Advanced suite for organizing, analyzing, and strategizing your content ecosystem across all platforms</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Content Analytics Dashboard</h2>
          </div>
          <p className="text-gray-600 mb-4">Real-time insights into content performance, engagement metrics, and audience behavior patterns</p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Advanced reporting features coming soon</div>
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm font-medium">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              In Development
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-lg p-6 border border-indigo-100">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Content Calendar</h2>
          </div>
          <p className="text-gray-600 mb-4">Strategic planning and scheduling of content publication across all channels</p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Advanced calendar features coming soon</div>
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm font-medium">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              In Development
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Content Strategy Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 mb-1">0</div>
            <div className="text-sm text-gray-600">Content Pieces Planned</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 mb-1">0%</div>
            <div className="text-sm text-gray-600">Content Completion Rate</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 mb-1">0</div>
            <div className="text-sm text-gray-600">Active Content Campaigns</div>
          </div>
        </div>
      </div>
    </div>
  );
}