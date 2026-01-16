import React from 'react';

/**
 * Input field component supporting various input types
 * @param {InputFieldProps} props - Component properties
 * @param {string} props.label - Label for the input field
 * @param {string} props.id - Unique ID for the input field
 * @param {string} [props.type='text'] - Type of input ('text', 'password', 'checkbox', etc.)
 * @param {string | number | boolean} props.value - Current value of the input
 * @param {(value: string | number | boolean) => void} props.onChange - Change handler function
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.required=false] - Whether the field is required
 * @param {string} [props.error] - Error message to display
 * @param {string} [props.helperText] - Helper text to display
 * @param {boolean} [props.multiline=false] - Whether to render as textarea
 * @param {number} [props.rows=3] - Number of rows for textarea
 * @param {{value: string; label: string}[]} [props.options] - Options for select inputs
 * @returns {JSX.Element} The input field component
 */
interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  multiline = false,
  rows = 3,
  options
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (type === 'checkbox') {
      onChange((e.target as HTMLInputElement).checked);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            id={id}
            type="checkbox"
            checked={!!value}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          {helperText && <span className="ml-2 text-sm text-gray-500">{helperText}</span>}
        </div>
      ) : options ? (
        <select
          id={id}
          value={String(value)}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-inner focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm p-2 border-2 transition duration-200"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          id={id}
          value={String(value)}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-inner focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm p-2 border-2 transition duration-200"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={String(value)}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-inner focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm p-2 border-2 transition duration-200"
        />
      )}
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {!error && helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};

export default InputField;