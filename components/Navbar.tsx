
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'হোম', path: '/' },
    { name: 'খুঁজুন', path: '/find' },
    { name: 'পোস্ট', path: '/post' },
    { name: 'রাইড শেয়ার', path: '/ride-share' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl transition-all duration-300 font-bengali">
      <div className="glass-panel rounded-3xl px-6 py-3.5 shadow-xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-brand-500 p-2 rounded-xl shadow-lg shadow-brand-500/20 group-hover:rotate-6 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tighter">EKSATHE</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/20">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive(link.path) 
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-500 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-brand-500'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          {user ? (
            <Link to="/dashboard" className="hidden sm:flex items-center gap-3 pl-1 pr-4 py-1 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-brand-500 transition-all">
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                লগইন করুন
              </button>
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-500 dark:text-white"
          >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
             </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel mt-3 rounded-3xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-2">
             {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold ${
                    isActive(link.path) 
                      ? 'bg-brand-500 text-white' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {link.name}
                </Link>
             ))}
             {!user && (
               <Link to="/login" onClick={() => setIsOpen(false)}>
                 <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold mt-4">Sign In</button>
               </Link>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};
