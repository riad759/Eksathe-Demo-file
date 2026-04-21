
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface FloatingAddButtonProps {
  user: User | null;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ user }) => {
  const location = useLocation();
  const hideOnPaths = ['/post', '/login', '/auth'];
  
  if (!user || hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <Link 
      to="/post" 
      className="fixed bottom-8 right-8 z-50 md:hidden"
    >
      <button className="w-14 h-14 bg-brand-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </Link>
  );
};
