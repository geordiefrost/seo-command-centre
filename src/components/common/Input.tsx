import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  variant = 'default',
  className,
  ...props
}) => {
  const baseStyles = 'w-full rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    default: 'border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500',
    filled: 'border-gray-200 bg-gray-50 focus:border-primary-500 focus:ring-primary-500 focus:bg-white',
  };
  
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  
  const inputStyles = cn(
    baseStyles,
    variants[variant],
    errorStyles,
    Icon && iconPosition === 'left' && 'pl-10',
    Icon && iconPosition === 'right' && 'pr-10',
    'px-3 py-2 text-sm',
    className
  );
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className={cn(
            'absolute inset-y-0 flex items-center pointer-events-none',
            iconPosition === 'left' ? 'left-3' : 'right-3'
          )}>
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        <input
          className={inputStyles}
          {...props}
        />
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          'mt-1 text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;