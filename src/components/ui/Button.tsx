import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-zinc-900 shadow-md shadow-zinc-200 active:bg-zinc-800 focus:ring-black',
    secondary: 'bg-white text-black border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100 shadow-sm focus:ring-zinc-200',
    outline: 'bg-transparent border-2 border-black text-black hover:bg-black hover:text-white active:bg-zinc-900 focus:ring-black',
    ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-black active:bg-zinc-200 focus:ring-zinc-100',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500 shadow-md shadow-emerald-100'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-6 py-3 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-2xl'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
