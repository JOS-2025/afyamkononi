
import React, { useState, useEffect } from 'react';
import { UserProfile, VitalsRecord } from '../types';
import { analyzeVitals } from '../services/geminiService';

interface Props {
  user: UserProfile;
}

const MOCK_VITALS: VitalsRecord[] = [
  { id: '1', type: 'BP', value: '120/80', unit: 'mmHg', status: 'normal', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: '2', type: 'Weight', value: '72', unit: 'kg', status: 'normal', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
];

const VitalsHub: React.FC<Props> = ({ user }) => {
  const [vitals, setVitals] = useState<VitalsRecord[]>(MOCK_VITALS);
  const [insight, setInsight] = useState<string>('Analyzing your health trends...');
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<'BP' | 'Weight' | 'Temp' | 'Glucose'>('BP');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    const getInsight = async () => {
      const result = await analyzeVitals(vitals);
      setInsight(result);
    };
    getInsight();
  }, [vitals]);

  const handleAdd = () => {
    const record: VitalsRecord = {
      id: Math.random().toString(),
      type: newType,
      value: newValue,
      unit: newType === 'BP' ? 'mmHg' : newType === 'Weight' ? 'kg' : newType === 'Temp' ? '°C' : 'mg/dL',
      status: 'normal',
      timestamp: new Date()
    };
    setVitals([record, ...vitals]);
    setShowAdd(false);
    setNewValue('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Health Passport</h2>
          <p className="text-slate-500 text-sm">Your biometric history & trends.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-emerald-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          ＋
        </button>
      </div>

      <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl pointer-events-none group-hover:scale-125 transition-transform duration-700">📉</div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">AI Smart Insight</p>
          <p className="text-lg font-medium leading-relaxed italic">"{insight}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vitals.map(record => (
          <div key={record.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">
                {record.type === 'BP' ? '💓' : record.type === 'Weight' ? '⚖️' : record.type === 'Temp' ? '🌡️' : '🩸'}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{record.type}</p>
                <p className="text-xl font-black text-slate-900">{record.value} <span className="text-xs font-bold text-slate-400">{record.unit}</span></p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${record.status === 'normal' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900 mb-6">Log New Vital</h3>
            <div className="space-y-4">
              <select 
                value={newType} 
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none"
              >
                <option value="BP">Blood Pressure</option>
                <option value="Weight">Weight</option>
                <option value="Temp">Body Temp</option>
                <option value="Glucose">Blood Sugar</option>
              </select>
              <input 
                type="text" 
                placeholder="Value (e.g. 120/80)" 
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none"
              />
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400 tracking-widest">Cancel</button>
                <button onClick={handleAdd} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest">Save Vital</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsHub;
