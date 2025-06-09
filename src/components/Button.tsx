import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
  active?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  icon, 
  tooltip, 
  disabled = false, 
  active = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
        rounded transition-colors
        ${active 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        border border-gray-200 dark:border-gray-700
      `}
      title={tooltip}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;