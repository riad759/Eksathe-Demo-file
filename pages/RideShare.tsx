
import React from 'react';
import { ActivityType, Plan, User } from '../types';
import { Card } from '../components/Card';
import { Link } from 'react-router-dom';

interface RideShareProps {
  plans: Plan[];
  user: User | null;
}

export const RideShare: React.FC<RideShareProps> = ({ plans, user }) => {
  const ridePlans = plans.filter(p => p.type === ActivityType.RIDE_SHARE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-bengali">
      <div className="bg-blue-600 dark:bg-blue-800 rounded-3xl p-8 md:p-12 mb-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-black mb-4">জ্বালানি বাঁচান, আপনার যাত্রা ভাগ করুন</h1>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            আপনার পথে যাওয়া ভ্রমণকারীদের সাথে সংযোগ করুন। কার্বন ফুটপ্রিন্ট কমান এবং নিরাপদে ভ্রমণের খরচ ভাগ করে নিন।
          </p>
          <Link to="/post">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl active:scale-95">
              রাইড অফার করুন
            </button>
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 hidden md:block">
           <svg width="400" height="200" viewBox="0 0 400 200" fill="white">
             <rect x="50" y="80" width="300" height="100" rx="40" />
             <circle cx="100" cy="180" r="20" />
             <circle cx="300" cy="180" r="20" />
           </svg>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">উপলব্ধ রাইডসমূহ</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">আপনার গন্তব্যের জন্য যাচাইকৃত শেয়ার্ড রাইড</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-sm font-bold rounded-xl px-4 py-3 outline-none shadow-sm focus:ring-2 focus:ring-blue-400 transition-all">
            <option>সব রুট</option>
            <option>ঢাকা {'->'} চট্টগ্রাম</option>
            <option>ঢাকা {'->'} সিলেট</option>
          </select>
        </div>
      </div>

      {ridePlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ridePlans.map(plan => (
            <Card key={plan.id} plan={plan} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-6xl mb-6">🚗</div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">এই মুহূর্তে কোনো রাইড উপলব্ধ নেই। প্রথম রাইড অফার করুন!</p>
        </div>
      )}
    </div>
  );
};
