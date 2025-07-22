
import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ isLoading = false, icon, children, ...props }) => {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-900 disabled:bg-sky-800 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {icon && <span className="mr-2 -ml-1 h-5 w-5">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
