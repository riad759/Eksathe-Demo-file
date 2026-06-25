
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plan, ActivityType, User, Participant } from '../types';
import { ACTIVITY_LABELS } from '../constants';
import { db, doc, updateDoc, arrayUnion, arrayRemove, OperationType, handleFirestoreError } from '../firebase';

interface CardProps {
  plan: Plan;
  user?: User | null;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ plan, user, onClick }) => {
  const navigate = useNavigate();
  const [joining, setJoining] = React.useState(false);
  const isRideShare = plan.type === ActivityType.RIDE_SHARE;
  const isJoined = plan.participants?.some(p => p.userId === user?.id);
  const isOwner = user?.id === plan.userId;
  const [liking, setLiking] = React.useState(false);
  const isLiked = plan.likes?.includes(user?.id || '');

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    setLiking(true);
    try {
      const planRef = doc(db, 'plans', plan.id);
      if (isLiked) {
        await updateDoc(planRef, {
          likes: arrayRemove(user.id)
        });
      } else {
        await updateDoc(planRef, {
          likes: arrayUnion(user.id)
        });
      }
      setLiking(false);
    } catch (error) {
      setLiking(false);
      handleFirestoreError(error, OperationType.UPDATE, `plans/${plan.id}`);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the join button
    if ((e.target as HTMLElement).closest('.join-btn')) return;
    
    if (onClick) {
      onClick();
    } else {
      navigate(`/plan/${plan.id}`);
    }
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const typeStyles: Record<ActivityType, { bg: string, text: string }> = {
// ... (rest of the styles)
    [ActivityType.GAME]: { bg: 'bg-orange-100 text-orange-700', text: 'text-orange-700' },
    [ActivityType.RIDE_SHARE]: { bg: 'bg-blue-100 text-blue-700', text: 'text-blue-700' },
    [ActivityType.HANGOUT]: { bg: 'bg-pink-100 text-pink-700', text: 'text-pink-700' },
    [ActivityType.STUDY]: { bg: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700' },
    [ActivityType.EVENT]: { bg: 'bg-purple-100 text-purple-700', text: 'text-purple-700' },
    [ActivityType.OTHER]: { bg: 'bg-slate-100 text-slate-700', text: 'text-slate-700' },
  };

  const style = typeStyles[plan.type];

  const formattedDate = new Date(plan.dateTime).toLocaleDateString('bn-BD', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = new Date(plan.dateTime).toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div 
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full active:scale-[0.98] font-bengali"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-5">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${style.bg} dark:bg-opacity-20`}>
          {ACTIVITY_LABELS[plan.type]}
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium">
          {new Date(plan.createdAt).toLocaleDateString('bn-BD')}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors leading-snug">
        {plan.title}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
        {plan.description}
      </p>

      {plan.tags && plan.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {plan.tags.map((tag, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800/40">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Info Strip */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
          <svg className="w-3 h-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedDate}
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
          <svg className="w-3 h-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formattedTime}
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 rounded-xl border border-orange-100/50 dark:border-orange-900/30 text-[10px] font-black text-orange-600 dark:text-orange-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          {plan.participants?.length || 0} জন
        </div>
      </div>

      {isRideShare && plan.from && plan.to && (
        <div className="mb-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30">
          <div className="flex items-center gap-3 mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
            <span className="opacity-60">শুরু:</span> {plan.from}
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></div>
            <span className="opacity-60">গন্তব্য:</span> {plan.to}
          </div>
        </div>
      )}

      {/* Social Interactions Bar (Like & Comments) */}
      <div className="flex items-center gap-4 py-3 border-t border-b border-slate-100/50 dark:border-slate-700/50 mb-4 text-xs font-bold text-slate-500 dark:text-slate-400">
        <button 
          onClick={handleLike}
          disabled={liking}
          className={`join-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
            isLiked ? 'text-brand-500 bg-brand-50/50 dark:bg-brand-950/20' : 'hover:text-brand-500'
          }`}
        >
          <svg className={`w-4 h-4 ${isLiked ? 'fill-current text-brand-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{plan.likes?.length || 0} লাইক</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 dark:text-slate-400">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{plan.comments?.length || 0} মন্তব্য</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
            {plan.userName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">{plan.userName}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate tracking-tight">{plan.location}</p>
          </div>
        </div>
        
        {!isOwner && (
          <button 
            onClick={handleJoin}
            disabled={joining}
            className={`join-btn px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
              isJoined 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20'
            }`}
          >
            {joining ? '...' : (isJoined ? 'বাদ দিন' : 'যোগ দিন')}
          </button>
        )}
      </div>
    </div>
  );
};
