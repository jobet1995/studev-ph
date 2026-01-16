'use client';

import { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin layout component
 * Provides authentication wrapper and sidebar navigation for admin pages
 * @param {AdminLayoutProps} props - Component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Admin layout with sidebar and authentication
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
    setIsDropdownOpen(false);
    router.push('/admin/login');
  };
  
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

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
      {isLoggedIn && pathname !== '/admin' && pathname !== '/admin/login' && pathname !== '/admin/signup' && pathname !== '/admin/forgot-password' ? (
        <div className="flex">
          <div className="w-64 bg-gradient-to-b from-indigo-700 to-purple-800 text-white min-h-screen">
            <div className="p-6 border-b border-indigo-600">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-500 p-3 rounded-lg shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">StuDev PH Admin</h2>
              </div>
            </div>
            <nav className="mt-6 px-2">
              <Link 
                href="/admin/dashboard" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/admin/dashboard' 
                    ? 'text-black bg-white' 
                    : 'text-white hover:text-black hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link 
                href="/admin/blogs" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/admin/blogs' 
                    ? 'text-black bg-white' 
                    : 'text-white hover:text-black hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blogs
              </Link>
              <Link 
                href="/admin/events" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/admin/events' 
                    ? 'text-black bg-white' 
                    : 'text-white hover:text-black hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Events
              </Link>
              <Link 
                href="/admin/posting" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/admin/posting' 
                    ? 'text-black bg-white' 
                    : 'text-white hover:text-black hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Posting
              </Link>
              <Link 
                href="/admin/users" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/admin/users' 
                    ? 'text-black bg-white' 
                    : 'text-white hover:text-black hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Users
              </Link>

              <Link 
                href="/admin/content" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/admin/content' 
                    ? 'text-black bg-white' 
                    : 'text-white hover:text-black hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Content
              </Link>
              <Link 
                href="/admin/media" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/admin/media' 
                    ? 'text-black bg-white' 
                    : 'text-white hover:text-black hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Media
              </Link>
              <Link 
                href="/admin/settings" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/admin/settings' 
                    ? 'text-black bg-white' 
                    : 'text-white hover:text-black hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <Link 
                href="/admin/reports" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/admin/reports' 
                    ? 'text-black bg-white' 
                    : 'text-white hover:text-black hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Reports
              </Link>
            </nav>
          </div>
          
          <div className="flex-1">
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h1 className="text-xl font-bold text-gray-900">
                        {pathname === '/admin' ? 'Dashboard' :
                         pathname === '/admin/dashboard' ? 'Dashboard' :
                         pathname === '/admin/blogs' ? 'Blogs' :
                         pathname === '/admin/events' ? 'Events' :
                         pathname === '/admin/posting' ? 'Posting' :
                         pathname === '/admin/users' ? 'Users' :
                         pathname === '/admin/content' ? 'Content Management' :
                         pathname === '/admin/media' ? 'Media Library' :
                         pathname === '/admin/settings' ? 'Settings' :
                         pathname === '/admin/reports' ? 'Reports' :
                         pathname ? pathname.split('/').pop()?.charAt(0).toUpperCase() + (pathname.split('/').pop()?.slice(1) || '') : 'Dashboard'}
                      </h1>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                      >
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">Admin User</p>
                          <p className="text-xs text-gray-500 hidden sm:block">Administrator</p>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-white">
                          AU
                        </div>
                      </button>
                      
                      {isDropdownOpen && (
                        <div 
                          ref={dropdownRef}
                          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                        >
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <Link 
                              href="/admin/profile"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                            >
                              View Profile
                            </Link>
                            <Link 
                              href="/admin/usersettings"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                            >
                              Account Settings
                            </Link>
                            <Link 
                              href="/admin/accountsecurity"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                            >
                              Account Security
                            </Link>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                            >
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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