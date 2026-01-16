'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      const isLoggedIn = !!token;
      
      // Update state
      setIsLoggedIn(isLoggedIn);
      
      // If we're not on a public page and not logged in, redirect to login
      if (!isLoggedIn && 
          pathname !== '/admin/login' && 
          pathname !== '/admin/signup' && 
          pathname !== '/admin/forgot-password') {
        router.push('/admin/login');
      }
    };
    
    checkAuth();
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  // Show loading state while checking auth
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not logged in and not on public pages, show redirecting message
  if (!isLoggedIn && 
      pathname !== '/admin/login' && 
      pathname !== '/admin/signup' && 
      pathname !== '/admin/forgot-password') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Redirecting to login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 inline-block"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for logged-in users */}
      {isLoggedIn && pathname !== '/admin/login' && pathname !== '/admin/signup' && pathname !== '/admin/forgot-password' ? (
        <div className="flex">
          <div className="w-64 bg-white shadow-md min-h-screen">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800">StuDev PH Admin</h2>
            </div>
            <nav className="mt-6">
              <Link 
                href="/admin/dashboard" 
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  pathname === '/admin/dashboard' 
                    ? 'text-white bg-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link 
                href="/admin/blogs" 
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  pathname === '/admin/blogs' 
                    ? 'text-white bg-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blogs
              </Link>
              <Link 
                href="/admin/events" 
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  pathname === '/admin/events' 
                    ? 'text-white bg-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Events
              </Link>
              <Link 
                href="/admin/posting" 
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  pathname === '/admin/posting' 
                    ? 'text-white bg-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Posting
              </Link>
              <Link 
                href="/admin/users" 
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  pathname === '/admin/users' 
                    ? 'text-white bg-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Users
              </Link>

            </nav>
          </div>
          
          <div className="flex-1">
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900 capitalize">
                      {pathname?.split('/').pop() || 'Dashboard'}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Admin Panel</span>
                    <button
                      onClick={handleLogout}
                      className="ml-4 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </header>
            
            <main className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      ) : (
        // For non-logged-in users or public pages
        <div>{children}</div>
      )}
    </div>
  );
}