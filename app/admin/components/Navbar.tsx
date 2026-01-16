import React from 'react';
import Image from 'next/image';

/**
 * Admin navbar component that displays the page title and user information
 * @param {NavbarProps} props - Component properties
 * @param {string} props.title - Title to display in the navbar
 * @param {{name: string, avatar?: string}} [props.user] - User information to display
 * @param {() => void} [props.onLogout] - Callback function for logout action
 * @returns {JSX.Element} The admin navbar component
 */
interface NavbarProps {
  title: string;
  user?: {
    name: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, user, onLogout }) => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{user.name}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">Admin</p>
                  </div>
                  {user.avatar ? (
                    <Image 
                      className="rounded-full border-2 border-gray-300" 
                      src={user.avatar} 
                      alt={user.name}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;