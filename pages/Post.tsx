
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityType, User } from '../types';
import { Button } from '../components/Button';
import { getPlanEnhancements } from '../services/geminiService';
import { ACTIVITY_LABELS } from '../constants';
import { db, collection, addDoc, OperationType, handleFirestoreError } from '../firebase';

interface PostProps {
  user: User | null;
}

export const Post: React.FC<PostProps> = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: ActivityType.HANGOUT,
    title: '',
    description: '',
    location: '',
    from: '',
    to: '',
    dateTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center px-6 font-bengali">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🔒</div>
        <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">লগইন করা প্রয়োজন</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium">আপনার কার্যক্রমের জন্য অন্যদের সাথে সংযোগ শুরু করতে আমাদের সম্প্রদায়ে যোগ দিন।</p>
        <Button fullWidth onClick={() => navigate('/login')} className="h-16 rounded-2xl text-lg">লগইন করুন</Button>
      </div>
    );
  }

  const handleGetSuggestions = async () => {
    if (!formData.title || !formData.description) return;
    setSuggesting(true);
    const suggestions = await getPlanEnhancements(formData.title, formData.description);
    setAiSuggestions(suggestions);
    setSuggesting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const plansRef = collection(db, 'plans');
      
      // Clean up data before sending
      const planData: any = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        dateTime: formData.dateTime, // datetime-local format is YYYY-MM-DDTHH:mm
        userId: user.id,
        userName: user.name,
        createdAt: new Date().toISOString(),
        participants: [{ userId: user.id, userName: user.name, avatar: user.avatar || '' }],
      };

      if (formData.type === ActivityType.RIDE_SHARE) {
        planData.from = formData.from;
        planData.to = formData.to;
        planData.location = `${formData.from} to ${formData.to}`;
      } else {
        planData.location = formData.location;
      }
      
      await addDoc(plansRef, planData);
      setLoading(false);
      navigate('/find');
    } catch (error) {
      setLoading(false);
      handleFirestoreError(error, OperationType.CREATE, 'plans');
    }
  };

  const inputClasses = "w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600";
  const labelClasses = "block text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-3 ml-1 tracking-tight uppercase tracking-widest text-[10px]";

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 font-bengali">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white dark:border-slate-700 transition-all">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">পরিকল্পনা পোস্ট করুন</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">নিখুঁত সঙ্গী খুঁজে পেতে বিস্তারিত তথ্য পূরণ করুন।</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={labelClasses}>কার্যক্রমের ধরন নির্বাচন করুন</label>
              <div className="relative">
                <select
                  className={`${inputClasses} appearance-none cursor-pointer`}
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as ActivityType})}
                  required
                >
                  {Object.values(ActivityType).map(type => (
                    <option key={type} value={type} className="dark:bg-slate-800">{ACTIVITY_LABELS[type]}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>কখন ঘটবে?</label>
              <div className="relative group">
                <input
                  type="datetime-local"
                  className={inputClasses}
                  value={formData.dateTime}
                  onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>আকর্ষণীয় শিরোনাম</label>
            <input
              type="text"
              placeholder="যেমন: ধানমন্ডিতে ফ্রেন্ডলি ক্রিকেট ম্যাচ"
              className={inputClasses}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>বিস্তারিত বলুন</label>
            <textarea
              rows={4}
              placeholder="পরিকল্পনা কী? কোনো বিশেষ প্রয়োজন বা তথ্য যা অন্যদের জানা উচিত?"
              className={`${inputClasses} resize-none min-h-[150px]`}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          {formData.type === ActivityType.RIDE_SHARE ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className={labelClasses}>কোথা থেকে</label>
                <input
                  type="text"
                  placeholder="আপনি কোথা থেকে শুরু করছেন?"
                  className={inputClasses}
                  value={formData.from}
                  onChange={(e) => setFormData({...formData, from: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>কোথায়</label>
                <input
                  type="text"
                  placeholder="আপনি কোথায় যাচ্ছেন?"
                  className={inputClasses}
                  value={formData.to}
                  onChange={(e) => setFormData({...formData, to: e.target.value})}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className={labelClasses}>মিলনস্থল</label>
              <input
                type="text"
                placeholder="সবাই কোথায় দেখা করবে?"
                className={inputClasses}
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>
          )}

          {/* AI Helper Section */}
          <div className="bg-brand-50/50 dark:bg-brand-900/10 p-8 rounded-[2rem] border border-brand-100 dark:border-brand-900/30 transition-all">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-pulse">✨</span>
                <span className="font-extrabold text-brand-800 dark:text-brand-300 tracking-tight">AI কন্টেন্ট হেল্পার</span>
              </div>
              <button 
                type="button"
                onClick={handleGetSuggestions}
                disabled={suggesting || !formData.title}
                className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:text-brand-700 disabled:opacity-30 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-brand-100 dark:border-brand-800 shadow-sm transition-all active:scale-95"
              >
                {suggesting ? 'ভাবছি...' : 'আমার পোস্টটি সুন্দর করুন'}
              </button>
            </div>
            {aiSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {aiSuggestions.map((s, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl text-sm text-slate-700 dark:text-slate-300 border border-brand-200 dark:border-brand-800 cursor-pointer hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all shadow-sm active:scale-[0.99] group"
                    onClick={() => setFormData({...formData, description: formData.description ? formData.description + " " + s : s})}
                  >
                    <div className="flex justify-between items-center">
                      <span>{s}</span>
                      <span className="text-[10px] font-bold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">যোগ করতে ট্যাপ করুন</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-brand-500 dark:text-brand-400/70 font-medium italic">একটি শিরোনাম লিখুন এবং আপনার পোস্টটিকে আকর্ষণীয় করতে AI-চালিত পরামর্শ পেতে 'সুন্দর করুন' এ ক্লিক করুন!</p>
            )}
          </div>

          <Button type="submit" fullWidth disabled={loading} className="py-6 rounded-2xl text-xl shadow-2xl shadow-brand-500/30 font-extrabold">
            {loading ? (
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                পোস্ট হচ্ছে...
              </div>
            ) : 'আমার পরিকল্পনা প্রকাশ করুন'}
          </Button>
        </form>
      </div>
    </div>
  );
};
