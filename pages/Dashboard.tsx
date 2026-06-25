
import React, { useState } from 'react';
import { Plan, User, ActivityType } from '../types';
import { Card } from '../components/Card';
import { Navigate, Link } from 'react-router-dom';
import { auth, signOut, db, doc, setDoc, seedPlans, OperationType, handleFirestoreError } from '../firebase';
import { Button } from '../components/Button';

interface DashboardProps {
  user: User | null;
  userPlans: Plan[];
}

export const Dashboard: React.FC<DashboardProps> = ({ user, userPlans }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  if (!user) return <Navigate to="/login" />;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, { name: editName }, { merge: true });
      setIsEditing(false);
      setSaving(false);
      // Note: The App.tsx onAuthStateChanged won't automatically pick up Firestore changes 
      // unless we listen to the user document too. For now, we'll just refresh or let it be.
      window.location.reload(); 
    } catch (error) {
      setSaving(false);
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedPlans(user.id, user.name);
      setSeeding(false);
    } catch (error) {
      setSeeding(false);
      console.error('Seeding error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-bengali">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <div className="mb-6">
            <Link 
              to="/"
              className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors font-bold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              হোম পেজে ফিরে যান
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700 text-center sticky top-24">
            <div className="relative inline-block mb-6">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 font-black text-4xl shadow-inner border border-orange-200 dark:border-orange-800">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">{user.email}</p>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => setIsEditing(true)}
                className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 py-3 rounded-xl hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
              >
                প্রোফাইল এডিট করুন
              </button>
              <button 
                onClick={handleSeedData}
                disabled={seeding}
                className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 py-3 rounded-xl hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {seeding ? 'লোড হচ্ছে...' : 'ডেমো ডাটা যোগ করুন'}
              </button>
              <button 
                onClick={handleLogout}
                className="text-sm font-bold text-red-500 hover:text-red-600 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-4"
              >
                লগআউট করুন
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">আমার সক্রিয় পরিকল্পনা</h1>
              <p className="text-slate-500 dark:text-slate-400">সম্প্রদায়ের সাথে আপনার শেয়ার করা কার্যক্রমগুলো পরিচালনা করুন।</p>
            </div>
            <Link to="/post">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md shadow-orange-500/20">
                + নতুন
              </button>
            </Link>
          </div>

          {userPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPlans.map(plan => (
                <Card key={plan.id} plan={plan} user={user} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center border-2 border-dashed border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="text-6xl mb-6">🗓️</div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">এখনও কোনো সক্রিয় পরিকল্পনা নেই</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">লজ্জা পাবেন না! আজই আপনার প্রথম কার্যক্রম শুরু করুন এবং নতুন বন্ধুদের সাথে পরিচিত হন।</p>
              <Link to="/post">
                <button className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                  আপনার প্রথম পরিকল্পনা পোস্ট করুন
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">প্রোফাইল এডিট করুন</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">আপনার নাম</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="আপনার নাম লিখুন"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  fullWidth 
                  onClick={() => setIsEditing(false)}
                >
                  বাতিল
                </Button>
                <Button 
                  type="submit" 
                  fullWidth 
                  disabled={saving}
                >
                  {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

