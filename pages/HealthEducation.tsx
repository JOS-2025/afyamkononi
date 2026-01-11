
import React, { useState, useEffect } from 'react';
import { generateArticleTip } from '../services/geminiService';

const ARTICLES = [
  {
    id: '1',
    title: 'Common Childhood Illnesses in Kenya',
    category: 'pediatrics',
    summary: 'Understanding fever, cough, and diarrhea in children under 5.',
    img: 'https://picsum.photos/seed/child/600/400',
    content: 'Childhood illnesses like URTI and malaria are common. Prevention starts with hygiene and nutrition...'
  },
  {
    id: '2',
    title: 'Nutrition: Local Superfoods',
    category: 'nutrition',
    summary: 'How to incorporate Amaranth (Terere) and Sukuma Wiki into a balanced diet.',
    img: 'https://picsum.photos/seed/food/600/400',
    content: 'Kenya has a wealth of nutrient-dense greens. Terere is high in protein and vitamins...'
  },
  {
    id: '3',
    title: 'Malaria Awareness',
    category: 'prevention',
    summary: 'When to seek testing and the importance of insecticide-treated nets.',
    img: 'https://picsum.photos/seed/mosquito/600/400',
    content: 'Early detection saves lives. If you have a high fever, visit a facility immediately...'
  }
];

const HealthEducation: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [tips, setTips] = useState<{ [key: string]: string }>({});
  const [loadingTips, setLoadingTips] = useState<{ [key: string]: boolean }>({});

  const handleGetAITip = async (id: string, title: string, content: string) => {
    if (tips[id]) return;
    setLoadingTips(prev => ({ ...prev, [id]: true }));
    const tip = await generateArticleTip(title, content);
    setTips(prev => ({ ...prev, [id]: tip }));
    setLoadingTips(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Health Education</h2>
        <p className="text-slate-500 text-sm">Verified medical information curated for the Kenyan family.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 -mx-1 hide-scrollbar">
        {['all', 'pediatrics', 'nutrition', 'prevention'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black whitespace-nowrap uppercase tracking-widest transition-all ${
              filter === cat ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ARTICLES.filter(a => filter === 'all' || a.category === filter).map((article) => (
          <div key={article.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 group flex flex-col">
            <div className="relative h-56 overflow-hidden">
              <img src={article.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={article.title} />
              <div className="absolute top-4 left-4">
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] bg-emerald-600/80 backdrop-blur-md px-3 py-1.5 rounded-full">
                  {article.category}
                </span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-xl font-black text-slate-800 mb-3 leading-tight group-hover:text-emerald-700 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-3">
                {article.summary}
              </p>
              
              {/* AI Smart Tip Section */}
              <div className="mt-auto">
                {tips[article.id] ? (
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-4 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <span>✨</span> AfyaMkononi Smart Tip
                    </p>
                    <p className="text-xs font-bold text-slate-700">{tips[article.id]}</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleGetAITip(article.id, article.title, article.content)}
                    disabled={loadingTips[article.id]}
                    className="w-full mb-4 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] py-3 rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all disabled:opacity-50"
                  >
                    {loadingTips[article.id] ? "Processing Intelligence..." : "Get AI Smart Tip"}
                  </button>
                )}

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">5 min read</span>
                  </div>
                  <button className="text-emerald-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Read Article →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthEducation;
