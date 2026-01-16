import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  title: string;
  sidebarTitle: string;
  sidebarItems: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
  }>;
  sidebarSelectedItem?: string;
  children: React.ReactNode;
  user?: {
    name: string;
    avatar?: string;
  };
  onLogout?: () => void;
  logo?: string;
}

const Layout: React.FC<LayoutProps> = ({
  title,
  sidebarTitle,
  sidebarItems,
  sidebarSelectedItem,
  children,
  user,
  onLogout,
  logo
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex">
        <div className="w-64 flex-shrink-0 hidden md:block">
                  <div className="h-16 flex items-center px-4 bg-gradient-to-r from-gray-700 to-gray-800">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg w-8 h-8 flex items-center justify-center text-white font-bold text-sm">
                      SD
                    </div>
                    <span className="ml-2 text-white font-bold">StudevPH</span>
                  </div>
                </div>
        <Navbar title={title} user={user} onLogout={onLogout} />
      </div>
      <div className="flex flex-1">
        <Sidebar 
          title={sidebarTitle} 
          items={sidebarItems} 
          selectedItem={sidebarSelectedItem}
          logo={logo}
        />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;