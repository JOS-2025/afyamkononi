
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { generateDailyHealthInsight } from '../services/geminiService';

interface Props {
  user: UserProfile;
  setView: (view: any) => void;
}

const Dashboard: React.FC<Props> = ({ user, setView }) => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      const result = await generateDailyHealthInsight(user.fullName.split(' ')[0]);
      setInsight(result);
      setLoadingInsight(false);
    };
    fetchInsight();
  }, [user.id, user.fullName]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl pointer-events-none">✨</div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-1 tracking-tight">Jambo, {user.fullName.split(' ')[0]}!</h2>
          <p className="text-emerald-50 opacity-80 text-sm mb-8 font-medium">Your health journey is looking strong today.</p>
          
          <div className="flex gap-4">
            <button onClick={() => setView('chat')} className="flex-1 bg-white text-emerald-700 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Talk to AI</button>
            <button onClick={() => setView('consultations')} className="flex-1 bg-emerald-500/30 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-400/50">See Doctor</button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">💡</div>
            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Daily Insight</h3>
          </div>
          {loadingInsight ? (
            <div className="h-10 bg-slate-50 rounded-xl animate-pulse"></div>
          ) : (
            <p className="text-sm text-slate-700 italic font-medium">"{insight}"</p>
          )}
        </section>

        <section onClick={() => setView('vitals')} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm cursor-pointer hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">⚖️</div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Vitals</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900">120/80</p>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">BP Normal</p>
            </div>
            <span className="text-slate-300 text-xs font-bold">Details →</span>
          </div>
        </section>
      </div>

      <section className="bg-red-50 border border-red-100 rounded-[2rem] p-6 flex items-center gap-6">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-3xl">🚨</div>
        <div className="flex-1">
          <h3 className="font-black text-red-900">Need Help Fast?</h3>
          <p className="text-xs text-red-700 leading-relaxed">Escalate immediately for severe symptoms or call 112.</p>
        </div>
        <button className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200">Call Now</button>
      </section>
    </div>
  );
};

export default Dashboard;
