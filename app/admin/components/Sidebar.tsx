import React from 'react';
import Image from 'next/image';

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

/**
 * Admin sidebar component for navigation
 * @param {SidebarProps} props - Component properties
 * @param {string} props.title - Title for the sidebar
 * @param {SidebarItem[]} props.items - Navigation items to display
 * @param {string} [props.selectedItem] - ID of the currently selected item
 * @param {string} [props.logo] - Custom logo URL
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The admin sidebar component
 */
interface SidebarProps {
  title: string;
  items: SidebarItem[];
  selectedItem?: string;
  logo?: string;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  title, 
  items, 
  selectedItem, 
  logo, 
  className = '' 
}) => {
  return (
    <div className={`bg-gradient-to-b from-gray-800 to-gray-900 text-white w-64 min-h-screen flex flex-col ${className}`}>
      {/* Logo section */}
      {logo && (
        <div className="p-6 pb-2">
          <div className="flex items-center justify-center mb-6">
            <Image
              src={logo}
              alt={`${title} Logo`}
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        </div>
      )}
      <nav className="flex-1 p-4 pt-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <a
                  href={item.href}
                  className={`flex items-center p-3 rounded-xl ${
                    selectedItem === item.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-sm'
                  } transition-all duration-300`}
                >
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  <span className="font-medium">{item.label}</span>
                </a>
              ) : (
                <button
                  onClick={item.onClick}
                  className={`w-full flex items-center p-3 rounded-xl text-left ${
                    selectedItem === item.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-sm'
                  } transition-all duration-300`}
                >
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  <span className="font-medium">{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400 bg-gradient-to-t from-gray-800 to-gray-900">
        © {new Date().getFullYear()} {title}
      </div>
    </div>
  );
};

export default Sidebar;