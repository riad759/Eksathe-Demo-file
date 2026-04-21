
import React from 'react';
import { Button } from '../components/Button';
import { auth, googleProvider, signInWithPopup } from '../firebase';

export const Auth: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900 transition-colors font-bengali">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-2xl border border-gray-100 dark:border-slate-700 transition-all">
        <div className="text-center mb-10">
          <div className="inline-block bg-orange-500 p-2.5 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-orange-600 dark:text-orange-500 mb-2">EKSATHE</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">সম্প্রদায়ে যোগ দিন</p>
        </div>

        <div className="space-y-6">
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
            আপনার গুগল অ্যাকাউন্ট ব্যবহার করে সহজেই লগইন করুন এবং আমাদের সম্প্রদায়ের অংশ হন।
          </p>
          
          <Button 
            onClick={handleGoogleLogin} 
            fullWidth 
            className="py-4 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            গুগল দিয়ে লগইন করুন
          </Button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 pt-8 border-t border-slate-100 dark:border-slate-700">
          লগইন করার মাধ্যমে আপনি আমাদের পরিষেবার শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন।
        </div>
      </div>
    </div>
  );
};
