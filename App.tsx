
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { FloatingAddButton } from './components/FloatingAddButton';
import { Home } from './pages/Home';
import { Find } from './pages/Find';
import { Post } from './pages/Post';
import { RideShare } from './pages/RideShare';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { PlanDetail } from './pages/PlanDetail';
import { User, Plan } from './types';
import { auth, db, onAuthStateChanged, collection, query, orderBy, onSnapshot, OperationType, handleFirestoreError, doc, setDoc, getDoc, seedPlans } from './firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>(() => {
    try {
      const cached = localStorage.getItem('eksathe_plans_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('eksathe_theme') === 'dark';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || undefined,
        };
        setUser(userData);

        // Sync user to Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, userData, { merge: true });
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('eksathe_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eksathe_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const plansRef = collection(db, 'plans');
    const q = query(plansRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Plan[];
      setPlans(plansData);
      try {
        localStorage.setItem('eksathe_plans_cache', JSON.stringify(plansData));
      } catch (e) {
        console.error('Error saving plans to cache:', e);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'plans');
    });

    return () => unsubscribe();
  }, []);

  // Automatic seeding logic
  useEffect(() => {
    const autoSeed = async () => {
      if (isAuthReady && user && !hasSeeded) {
        const seedFlag = localStorage.getItem('eksathe_seeded_v4');
        if (!seedFlag) {
          setHasSeeded(true);
          try {
            await seedPlans(user.id, user.name);
            localStorage.setItem('eksathe_seeded_v4', 'true');
          } catch (error) {
            console.error('Auto-seeding error:', error);
          }
        }
      }
    };
    autoSeed();
  }, [isAuthReady, user, hasSeeded]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const userPlans = plans.filter(p => p.userId === user?.id);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
        
        <main className="flex-grow relative">
          <Routes>
            <Route path="/" element={<Home plans={plans} user={user} />} />
            <Route path="/find" element={<Find plans={plans} user={user} />} />
            <Route 
              path="/post" 
              element={<Post user={user} />} 
            />
            <Route path="/ride-share" element={<RideShare plans={plans} user={user} />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <Auth />} 
            />
            <Route 
              path="/dashboard" 
              element={<Dashboard user={user} userPlans={userPlans} />} 
            />
            <Route path="/plan/:id" element={<PlanDetail plans={plans} user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          <FloatingAddButton user={user} />
        </main>

        <footer className="bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 py-12 mt-auto transition-colors">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-500 p-1.5 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-xl font-black text-orange-600 dark:text-orange-500">EKSATHE</span>
              </div>
              <p className="text-gray-500 dark:text-slate-400 max-w-sm font-bengali">
                সম্প্রদায়কে সংযুক্ত করতে, ভাগ করে নিতে এবং একসাথে বেড়ে উঠতে ক্ষমতায়ন করা। একা নয়, একসাথে।
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-4 text-lg font-bengali">প্ল্যাটফর্ম</h4>
              <ul className="space-y-2 text-gray-500 dark:text-slate-400 text-sm font-bengali">
                <li><Link to="/find" className="hover:text-orange-500">সঙ্গী খুঁজুন</Link></li>
                <li><Link to="/ride-share" className="hover:text-orange-500">রাইড শেয়ারিং</Link></li>
                <li><Link to="/post" className="hover:text-orange-500">একটি পরিকল্পনা পোস্ট করুন</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-4 text-lg font-bengali">সহায়তা</h4>
              <ul className="space-y-2 text-gray-500 dark:text-slate-400 text-sm font-bengali">
                <li><a href="#" className="hover:text-orange-500">নিরাপত্তা নির্দেশিকা</a></li>
                <li><a href="#" className="hover:text-orange-500">পরিষেবার শর্তাবলী</a></li>
                <li><a href="#" className="hover:text-orange-500">আমাদের সাথে যোগাযোগ করুন</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-50 dark:border-slate-700 text-center text-gray-400 dark:text-slate-500 text-xs font-bengali">
            © ২০২৪ EKSATHE। সম্প্রদায় গঠনের জন্য ভালোবাসা দিয়ে তৈরি।
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
