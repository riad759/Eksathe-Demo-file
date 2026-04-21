
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3.5 rounded-2xl font-bold transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 tracking-tight select-none font-bengali";
  
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20",
    secondary: "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90",
    outline: "border-2 border-brand-500 text-brand-600 dark:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20",
    ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
    glass: "glass-panel shadow-sm hover:shadow-md text-slate-900 dark:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
