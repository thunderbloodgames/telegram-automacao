
import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full bg-slate-900/80 border border-slate-600 text-slate-100 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2"
      />
    </div>
  );
};

export default TextInput;
