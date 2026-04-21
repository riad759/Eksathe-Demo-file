
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plan, ActivityType, User, Participant, Comment } from '../types';
import { ACTIVITY_LABELS, ACTIVITY_COLORS } from '../constants';
import { Button } from '../components/Button';
import { db, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, OperationType, handleFirestoreError } from '../firebase';

interface PlanDetailProps {
  plans: Plan[];
  user: User | null;
}

export const PlanDetail: React.FC<PlanDetailProps> = ({ plans, user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const plan = plans.find(p => p.id === id);

  if (!plan) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-bengali">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">পরিকল্পনাটি খুঁজে পাওয়া যায়নি</h2>
        <Button onClick={() => navigate(-1)}>ফিরে যান</Button>
      </div>
    );
  }

  const isOwner = user?.id === plan.userId;
  const isJoined = plan.participants?.some(p => p.userId === user?.id);

  const handleDelete = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই পরিকল্পনাটি মুছে ফেলতে চান?')) return;
    
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'plans', plan.id));
      setDeleting(false);
      navigate('/dashboard');
    } catch (error) {
      setDeleting(false);
      handleFirestoreError(error, OperationType.DELETE, `plans/${plan.id}`);
    }
  };

  const handleJoin = async () => {
    if (!plan) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setJoining(true);
    try {
      const planRef = doc(db, 'plans', plan.id);
      if (isJoined) {
        const participant = plan.participants?.find(p => p.userId === user.id);
        if (participant) {
          await updateDoc(planRef, {
            participants: arrayRemove(participant)
          });
        }
      } else {
        const newParticipant: Participant = {
          userId: user.id,
          userName: user.name,
          avatar: user.avatar || ''
        };
        await updateDoc(planRef, {
          participants: arrayUnion(newParticipant)
        });
      }
      setJoining(false);
    } catch (error) {
      setJoining(false);
      handleFirestoreError(error, OperationType.UPDATE, `plans/${plan.id}`);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;

    setSendingComment(true);
    try {
      const planRef = doc(db, 'plans', plan.id);
      const newComment: Comment = {
        id: Math.random().toString(36).substring(7),
        userId: user.id,
        userName: user.name,
        avatar: user.avatar || '',
        text: commentText.trim(),
        createdAt: new Date().toISOString()
      };
      await updateDoc(planRef, {
        comments: arrayUnion(newComment)
      });
      setCommentText('');
      setSendingComment(false);
    } catch (error) {
      setSendingComment(false);
      handleFirestoreError(error, OperationType.UPDATE, `plans/${plan.id}`);
    }
  };

  const handleMessage = () => {
    if (!plan) return;
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formattedDate = new Date(plan.dateTime).toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(plan.dateTime).toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-bengali">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors font-bold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ফিরে যান
        </button>

        {isOwner && (
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:text-red-600 font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            মুছে ফেলুন
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest ${ACTIVITY_COLORS[plan.type]}`}>
              {ACTIVITY_LABELS[plan.type]}
            </span>
            <span className="text-slate-400 text-sm font-medium">
              পোস্ট করা হয়েছে: {new Date(plan.createdAt).toLocaleDateString('bn-BD')}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            {plan.title}
          </h1>

          <div className="flex flex-wrap gap-8 mb-10 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">তারিখ</p>
                <p className="text-slate-800 dark:text-slate-200 font-bold">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">সময়</p>
                <p className="text-slate-800 dark:text-slate-200 font-bold">{formattedTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">স্থান</p>
                <p className="text-slate-800 dark:text-slate-200 font-bold">{plan.location}</p>
              </div>
            </div>
          </div>

          {plan.type === ActivityType.RIDE_SHARE && plan.from && plan.to && (
            <div className="mb-10 p-8 rounded-[2rem] bg-blue-500/5 border border-blue-500/10">
              <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                রাইড শেয়ারিং তথ্য
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="absolute left-4 top-10 bottom-10 w-0.5 bg-blue-200 dark:bg-blue-800 hidden md:block"></div>
                <div className="flex items-start gap-6 relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 z-10">১</div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">যাত্রা শুরু</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{plan.from}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 relative">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0 z-10">২</div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">গন্তব্য</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{plan.to}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-12">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">বিবরণ</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed whitespace-pre-wrap">
              {plan.description}
            </p>
          </div>

          {/* Participants Section */}
          <div className="mb-12 p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              অংশগ্রহণকারী ({plan.participants?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-4">
              {plan.participants && plan.participants.length > 0 ? (
                plan.participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.userName} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-[10px] font-bold text-orange-600">
                        {p.userName.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.userName}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">এখনও কেউ যোগ দেয়নি। প্রথম ব্যক্তি হিসেবে আপনি যোগ দিন!</p>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div id="comments-section" className="mb-12">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              আলোচনা ({plan.comments?.length || 0})
            </h3>

            <div className="space-y-6 mb-8">
              {plan.comments && plan.comments.length > 0 ? (
                plan.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold shrink-0 overflow-hidden">
                      {comment.avatar ? (
                        <img src={comment.avatar} alt={comment.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        comment.userName.charAt(0)
                      )}
                    </div>
                    <div className="flex-grow bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{comment.userName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic text-center py-8">এখনও কোনো আলোচনা শুরু হয়নি। আপনার প্রশ্ন বা মতামত জানান!</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="আপনার মন্তব্য বা প্রশ্ন লিখুন..."
                className="w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm min-h-[120px] resize-none shadow-sm"
              />
              <div className="absolute bottom-4 right-4">
                <Button 
                  type="submit" 
                  disabled={sendingComment || !commentText.trim()}
                  className="px-8 h-10 rounded-xl"
                >
                  {sendingComment ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
                </Button>
              </div>
            </form>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-brand-500/20">
                {plan.userName.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">আয়োজক</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{plan.userName}</p>
              </div>
            </div>
            
            {!isOwner && (
              <div className="flex gap-4 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  className="flex-1 md:flex-none"
                  onClick={handleMessage}
                >
                  মেসেজ দিন
                </Button>
                <Button 
                  className={`flex-1 md:flex-none px-12 ${isJoined ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  onClick={handleJoin}
                  disabled={joining}
                >
                  {joining ? 'লোড হচ্ছে...' : (isJoined ? 'বাদ দিন' : 'যোগ দিন')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
