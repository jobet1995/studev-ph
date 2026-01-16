"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SystemStats {
  blogs: number;
  events: number;
  users: number;
}

/**
 * Main admin landing page
 * @returns {JSX.Element} Admin landing page
 */
export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch system stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API call to fetch system statistics
        await new Promise(resolve => setTimeout(resolve, 800));
        setStats({
          blogs: Math.floor(Math.random() * 100) + 50, // Random number between 50-150
          events: Math.floor(Math.random() * 20) + 5,   // Random number between 5-25
          users: Math.floor(Math.random() * 500) + 200  // Random number between 200-700
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values in case of error
        setStats({
          blogs: 50,
          events: 12,
          users: 200
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Check if user is already authenticated on initial load
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // If already authenticated, go directly to dashboard
      router.push('/admin/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Welcome content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 flex flex-col justify-center">
          <div className="text-center lg:text-left">
            <div className="mx-auto lg:mx-0 bg-gradient-to-r from-indigo-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Welcome to StuDev PH Admin</h1>
            <p className="text-lg text-gray-600 mb-2">Securely manage your platform content and community</p>
            <p className="text-gray-500 mb-8 max-w-md">Access powerful tools to create, edit, and monitor content and events</p>
            
            <div className="space-y-4">
              <Link 
                href="/admin/login" 
                className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign in to your account
              </Link>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Additional Options</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/"
                  className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Visit Homepage
                </Link>
                
                <Link 
                  href="/admin/forgot-password"
                  className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Forgot Password?
                </Link>
              </div>
              
              <div className="mt-6 text-sm text-gray-500 text-center lg:text-left">
                <p>Need help? Contact support@studdevph.com</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Visual elements */}
        <div className="hidden lg:flex bg-gradient-to-br from-indigo-700 to-purple-800 rounded-2xl p-8 items-center justify-center">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center mb-8 p-6 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">StuDev PH Admin Portal</h2>
            <p className="text-lg opacity-90 max-w-md mx-auto mb-8">
              Securely manage your platform content, monitor analytics, and engage with the community.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">{loading ? '...' : stats?.blogs}</div>
                <div className="text-sm opacity-80">Blogs</div>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">{loading ? '...' : stats?.events}</div>
                <div className="text-sm opacity-80">Events</div>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">{loading ? '...' : stats?.users}</div>
                <div className="text-sm opacity-80">Users</div>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-center">
                <div className="h-1 w-8 bg-indigo-300 rounded-full mr-2"></div>
                <div className="h-1 w-12 bg-indigo-400 rounded-full mr-2"></div>
                <div className="h-1 w-6 bg-indigo-300 rounded-full"></div>
              </div>
              <div className="text-sm opacity-90">Trusted by developers across the Philippines</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} StuDev PH. All rights reserved.</p>
      </div>
    </div>
  );
}