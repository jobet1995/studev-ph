import React from 'react';

/**
 * Card component for displaying content in a bordered container
 * @param {CardProps} props - Component properties
 * @param {string} [props.title] - Optional title for the card
 * @param {React.ReactNode} props.children - Content to display inside the card
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The card component
 */
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;