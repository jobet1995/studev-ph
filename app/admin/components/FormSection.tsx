import React from 'react';

/**
 * Form section component for organizing form content
 * @param {FormSectionProps} props - Component properties
 * @param {string} props.title - Title for the form section
 * @param {string} [props.description] - Optional description for the form section
 * @param {React.ReactNode} props.children - Form content to display
 * @returns {JSX.Element} The form section component
 */
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => {
  return (
    <div className="p-6 border-b border-gray-200 last:border-b-0">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default FormSection;