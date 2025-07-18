import React from 'react';
import { Link } from 'react-router-dom';

interface WriteButtonProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
}

const WriteButton: React.FC<WriteButtonProps> = ({ 
  className = '', 
  size = 'medium',
  variant = 'primary'
}) => {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-blue-500 border border-blue-500'
  };

  return (
    <Link
      to="/board/write"
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <svg 
        className="w-4 h-4 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 4v16m8-8H4" 
        />
      </svg>
      글쓰기
    </Link>
  );
};

export default WriteButton;