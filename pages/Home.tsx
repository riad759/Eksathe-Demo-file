
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Plan } from '../types';

interface HomeProps {
  plans: Plan[];
  user: User | null;
}

export const Home: React.FC<HomeProps> = ({ plans, user }) => {
  const featuredPlans = plans.slice(0, 3);
  const navigate = useNavigate();

  return (
    <div className="pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[800px] flex items-center justify-center pt-20 px-6">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-orange-400/10 dark:bg-orange-600/10 rounded-full blur-[100px] animate-blob"></div>
          <div className="absolute top-1/2 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl font-bengali">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">🔥 স্ক্রলিং বন্ধ করুন, বাঁচতে শুরু করুন</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
            একা হাঁটবেন না,<br />
            <span className="text-brand-500">একসাথে হাঁটুন।</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            কমিউনিটি কম্প্যানিয়ন অ্যাপ। খেলাধুলা, রাইড, স্টাডি সেশন এবং আড্ডার জন্য মানুষ খুঁজুন। আসল মানুষের জন্য আসল সংযোগ।
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/find" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-10 py-5 text-lg h-16 rounded-3xl">সঙ্গী খুঁজুন</Button>
            </Link>
            <Link to="/post" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto px-10 py-5 text-lg h-16 rounded-3xl">পরিকল্পনা পোস্ট করুন</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simplified Features Grid */}
      <section className="max-w-7xl mx-auto px-6 mb-32 font-bengali">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "বন্ধু খুঁজুন",
              desc: "আপনার আগ্রহ এবং অবসর সময় ভাগ করে নেওয়ার জন্য আশেপাশের মানুষের সাথে সংযোগ করুন।",
              icon: "🤝",
              link: "/find",
              color: "hover:bg-orange-50/50 dark:hover:bg-orange-950/10"
            },
            {
              title: "রাইড শেয়ারিং",
              desc: "আপনার দৈনন্দিন বা দূরপাল্লার ভ্রমণে রাইড শেয়ার করে টাকা এবং জ্বালানি বাঁচান।",
              icon: "🚗",
              link: "/ride-share",
              color: "hover:bg-blue-50/50 dark:hover:bg-blue-950/10"
            },
            {
              title: "সক্রিয় থাকুন",
              desc: "ফুটবল, ক্রিকেট বা যেকোনো খেলার জন্য কয়েক মিনিটের মধ্যে সতীর্থ খুঁজুন।",
              icon: "⚽",
              link: "/find",
              color: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10"
            }
          ].map((feat, i) => (
            <div 
              key={i} 
              onClick={() => navigate(feat.link)}
              className={`p-10 rounded-[2.5rem] bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 cursor-pointer ${feat.color} group hover:scale-[1.02]`}
            >
              <div className="text-4xl mb-6">{feat.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                {feat.title}
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7-7" />
                </svg>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feed Feed */}
      <section className="max-w-7xl mx-auto px-6 mb-32 font-bengali">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">সক্রিয় পরিকল্পনা</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">এখন যা ঘটছে তাতে যোগ দিন।</p>
          </div>
          <Link to="/find" className="text-brand-500 font-bold hover:underline">সব দেখুন</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPlans.map(plan => (
            <Card key={plan.id} plan={plan} user={user} />
          ))}
        </div>
      </section>

      {/* Large CTA */}
      <section className="px-6 font-bengali">
         <div className="max-w-7xl mx-auto py-20 px-10 rounded-[3rem] bg-slate-900 dark:bg-slate-800 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">ভাবনা বন্ধ করুন, যোগ দেওয়া শুরু করুন।</h2>
              <p className="text-lg opacity-80 mb-10 max-w-xl mx-auto">একটি একটি করে কার্যক্রমের মাধ্যমে সম্প্রদায় গঠনকারী হাজার হাজার মানুষের সাথে যোগ দিন।</p>
              <Link to="/login">
                <Button className="mx-auto px-12 py-5 text-xl h-16 rounded-2xl bg-white text-slate-900 hover:bg-slate-100">এখনই শুরু করুন</Button>
              </Link>
            </div>
         </div>
      </section>
    </div>
  );
};
