
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { generateDailyHealthInsight } from '../services/geminiService';

interface Props {
  user: UserProfile;
  setView: (view: any) => void;
  onWhatsAppClick?: () => void;
}

const Dashboard: React.FC<Props> = ({ user, setView, onWhatsAppClick }) => {
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

      {/* WhatsApp Feature Card */}
      <section 
        onClick={onWhatsAppClick}
        className="bg-[#E7F8F0] border border-[#25D366]/20 rounded-[2.5rem] p-6 flex items-center gap-6 cursor-pointer hover:shadow-lg transition-all group"
      >
        <div className="w-16 h-16 bg-[#25D366] rounded-2xl flex items-center justify-center shadow-lg shadow-[#25D366]/20 group-hover:scale-110 transition-transform">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 1.341 3.79 2.05 5.714 2.05h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-black text-slate-800">WhatsApp Health Channel</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Low data? Chat with us directly on WhatsApp for health tips & support.</p>
        </div>
        <div className="text-[#25D366] font-black text-[10px] uppercase tracking-widest hidden sm:block">Connect →</div>
      </section>

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
