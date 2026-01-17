import React from 'react';

/**
 * Admin layout component with title and content area
 * @param {AdminLayoutProps} props - Component properties
 * @param {React.ReactNode} props.children - Content to display in the layout
 * @param {string} props.title - Title for the layout
 * @param {string} [props.subtitle] - Optional subtitle
 * @returns {JSX.Element} The admin layout component
 */
interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;