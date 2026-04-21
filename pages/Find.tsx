
import React, { useState, useMemo } from 'react';
import { Plan, ActivityType } from '../types';
import { Card } from '../components/Card';
import { ACTIVITY_LABELS } from '../constants';

interface FindProps {
  plans: Plan[];
  user: User | null;
}

export const Find: React.FC<FindProps> = ({ plans, user }) => {
  const [filter, setFilter] = useState<ActivityType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const matchesFilter = filter === 'ALL' || plan.type === filter;
      const matchesSearch = plan.title.toLowerCase().includes(search.toLowerCase()) || 
                          plan.description.toLowerCase().includes(search.toLowerCase()) ||
                          plan.location.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, plans]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-40 font-bengali">
      <div className="mb-16">
        <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">আপনার দল খুঁজুন</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">সক্রিয় পরিকল্পনাগুলো দেখুন এবং আপনার পছন্দের গুলোতে যোগ দিন।</p>
      </div>

      <div className="flex flex-col gap-8 mb-16">
        <div className="relative">
          <input
            type="text"
            placeholder="কার্যক্রম, অবস্থান বা কীওয়ার্ড খুঁজুন..."
            className="w-full pl-14 pr-6 py-5 rounded-3xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white transition-all text-lg font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
              filter === 'ALL' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-brand-500'
            }`}
          >
            সব পরিকল্পনা
          </button>
          {Object.values(ActivityType).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === type ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-brand-500'
              }`}
            >
              {ACTIVITY_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredPlans.map(plan => (
            <Card key={plan.id} plan={plan} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white/50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-6">🏜️</div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">কোনো পরিকল্পনা পাওয়া যায়নি</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">অন্য কোনো কীওয়ার্ড চেষ্টা করুন বা আপনার নিজের পরিকল্পনা পোস্ট করুন!</p>
        </div>
      )}
    </div>
  );
};
