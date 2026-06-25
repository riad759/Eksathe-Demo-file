import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityType, User } from '../types';
import { Button } from './Button';
import { ACTIVITY_LABELS, CATEGORICAL_TAGS } from '../constants';
import { db, collection, addDoc, OperationType, handleFirestoreError } from '../firebase';

interface QuickPostBoxProps {
  user: User | null;
}

export const QuickPostBox: React.FC<QuickPostBoxProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ActivityType>(ActivityType.HANGOUT);
  const [location, setLocation] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load draft from localStorage on mount (so they don't lose typed draft)
  useEffect(() => {
    try {
      const draft = localStorage.getItem('eksathe_quick_post_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setDescription(parsed.description || '');
        setType(parsed.type || ActivityType.HANGOUT);
        setLocation(parsed.location || '');
        setFrom(parsed.from || '');
        setTo(parsed.to || '');
        setDateTime(parsed.dateTime || '');
        setSelectedTags(parsed.selectedTags || []);
        setIsExpanded(true);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
  }, []);

  // Save draft to localStorage when values change
  useEffect(() => {
    if (!title && !description && !location && !from && !to && !dateTime && selectedTags.length === 0) {
      localStorage.removeItem('eksathe_quick_post_draft');
      return;
    }
    const draft = { title, description, type, location, from, to, dateTime, selectedTags };
    localStorage.setItem('eksathe_quick_post_draft', JSON.stringify(draft));
  }, [title, description, type, location, from, to, dateTime, selectedTags]);

  const handleToggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      if (selectedTags.length >= 5) return;
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!title.trim() || !description.trim() || !dateTime) {
      alert('দয়া করে শিরোনাম, বর্ণনা এবং তারিখ-সময় পূরণ করুন।');
      return;
    }

    setLoading(true);
    try {
      const plansRef = collection(db, 'plans');
      
      const planData: any = {
        type,
        title: title.trim(),
        description: description.trim(),
        dateTime,
        userId: user.id,
        userName: user.name,
        createdAt: new Date().toISOString(),
        participants: [{ userId: user.id, userName: user.name, avatar: user.avatar || '' }],
        tags: selectedTags,
        likes: [],
      };

      if (type === ActivityType.RIDE_SHARE) {
        planData.from = from.trim();
        planData.to = to.trim();
        planData.location = `${from.trim()} থেকে ${to.trim()}`;
      } else {
        planData.location = location.trim() || 'অনলাইন / উল্লেখ নেই';
      }

      await addDoc(plansRef, planData);
      
      // Clear inputs & draft
      setTitle('');
      setDescription('');
      setLocation('');
      setFrom('');
      setTo('');
      setDateTime('');
      setSelectedTags([]);
      setIsExpanded(false);
      localStorage.removeItem('eksathe_quick_post_draft');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setFrom('');
    setTo('');
    setDateTime('');
    setSelectedTags([]);
    localStorage.removeItem('eksathe_quick_post_draft');
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-6 mb-12 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all font-bengali">
      {/* Upper header section */}
      <div className="flex gap-4 items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
          {user ? user.name.charAt(0) : 'E'}
        </div>
        <div className="flex-grow">
          {user ? (
            <p className="text-xs font-black text-slate-800 dark:text-slate-200">
              {user.name} <span className="font-normal opacity-60">হিসেবে লগইন আছেন</span>
            </p>
          ) : (
            <p className="text-xs font-bold text-slate-400">নতুন পরিকল্পনা শেয়ার করতে লগইন করুন</p>
          )}
          <button
            onClick={() => {
              if (!user) navigate('/login');
              else setIsExpanded(true);
            }}
            className="text-left w-full text-slate-500 dark:text-slate-400 text-sm font-semibold mt-1 outline-none"
          >
            {isExpanded ? 'আপনার পরিকল্পনার বিস্তারিত নিচে পূরণ করুন:' : 'আপনার মাথায় কি কোনো আড্ডা বা ইভেন্টের পরিকল্পনা আছে?'}
          </button>
        </div>
      </div>

      {!user ? (
        <div className="pt-2">
          <Button 
            onClick={() => navigate('/login')} 
            fullWidth 
            className="py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20"
          >
            গুগল দিয়ে লগইন করে পোস্ট করুন
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main thoughts field */}
          <div>
            <textarea
              placeholder="আপনার মনের কি পরিকল্পনা আছে? নতুন একটি আড্ডা, খেলাধুলা, বা ইভেন্ট শেয়ার করুন..."
              rows={isExpanded ? 3 : 1}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (!isExpanded) setIsExpanded(true);
              }}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none"
              required
            />
          </div>

          {isExpanded && (
            <div className="space-y-4 animate-fadeIn">
              {/* Title & Activity Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">পরিকল্পনার শিরোনাম *</label>
                  <input
                    type="text"
                    placeholder="যেমন: ধানমন্ডি লেকে বিকেলের আড্ডা"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">পরিকল্পনার ধরণ *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ActivityType)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all cursor-pointer"
                  >
                    {Object.values(ActivityType).map((val) => (
                      <option key={val} value={val}>
                        {ACTIVITY_LABELS[val]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ride-share specific route inputs */}
              {type === ActivityType.RIDE_SHARE ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-3xl border border-blue-100/50 dark:border-blue-900/30">
                  <div>
                    <label className="block text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2">কোথা থেকে (Start Point) *</label>
                    <input
                      type="text"
                      placeholder="যেমন: মিরপুর ১০"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                      required={type === ActivityType.RIDE_SHARE}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2">কোথায় (Destination) *</label>
                    <input
                      type="text"
                      placeholder="যেমন: গুলশান ১"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                      required={type === ActivityType.RIDE_SHARE}
                    />
                  </div>
                </div>
              ) : (
                /* Regular Location Input */
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">স্থান/মিলনস্থল</label>
                  <input
                    type="text"
                    placeholder="যেমন: ধানমন্ডি লেক, রবীন্দ্র সরোবর"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              )}

              {/* Date & Time */}
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">তারিখ ও সময় *</label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all cursor-pointer"
                  required
                />
              </div>

              {/* Categorical tags Select */}
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">জনপ্রিয় ক্যাটাগরি ট্যাগস (সর্বোচ্চ ৫টি)</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CATEGORICAL_TAGS.slice(0, 10).map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-orange-500'
                        }`}
                      >
                        #{tag.bnLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons inside expanded composer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  বাতিল করুন
                </button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 h-11 rounded-xl text-xs font-black bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/10 shrink-0"
                >
                  {loading ? 'পোস্ট হচ্ছে...' : 'পোস্ট করুন'}
                </Button>
              </div>
            </div>
          )}
        </form>
      )}

      {success && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center animate-fadeIn">
          🎉 আপনার পরিকল্পনাটি সফলভাবে পোস্ট করা হয়েছে এবং অন্যান্যদের ডিভাইসে লাইভ যুক্ত হয়েছে!
        </div>
      )}
    </div>
  );
};
