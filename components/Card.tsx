
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

      {isRideShare && plan.from && plan.to && (
        <div className="mb-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">থেকে: {plan.from}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">গন্তব্য: {plan.to}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
            {plan.userName.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{plan.userName}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{plan.location}</p>
              <span className="text-[10px] text-slate-300">•</span>
              <span className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                {plan.participants?.length || 0}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {!isOwner && (
            <button 
              onClick={handleJoin}
              disabled={joining}
              className={`join-btn px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                isJoined 
                  ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20' 
                  : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
              }`}
            >
              {joining ? '...' : (isJoined ? 'বাদ দিন' : 'যোগ দিন')}
            </button>
          )}
          <div className="text-right">
            <p className="text-[10px] font-bold text-brand-500 uppercase mb-0.5">{formattedDate}</p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{formattedTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
