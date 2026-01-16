import React from 'react';
import Image from 'next/image';

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
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl flex-1">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">{title}</h1>
            </div>
          </div>
          <div className="flex items-center">
            {user && (
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <Image 
                      className="rounded-full border-2 border-white" 
                      src={user.avatar} 
                      alt={user.name}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="bg-indigo-500 border-2 border-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-indigo-200">Administrator</p>
                  </div>
                </div>
              </div>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-4 bg-white text-indigo-600 hover:bg-indigo-50 transition duration-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg"
              >
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