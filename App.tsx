
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatInterface from './pages/ChatInterface';
import HealthEducation from './pages/HealthEducation';
import Consultations from './pages/Consultations';
import VitalsHub from './pages/VitalsHub';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'dashboard' | 'chat' | 'education' | 'consultations' | 'vitals'>('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('afyamkononi_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('afyamkononi_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={(u) => {
      localStorage.setItem('afyamkononi_user', JSON.stringify(u));
      setUser(u);
    }} />;
  }
const handleWhatsAppClick = () => {
  window.open(
    "https://wa.me/254712345678?text=Jambo%20AfyaMkononi,%20I%20need%20help%20with%20my%20health...",
    "_blank"
  );
};

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-16 md:pb-0">
      <Navbar user={user} setView={setView} activeView={view} onLogout={handleLogout} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        {view === 'dashboard' && <Dashboard user={user} setView={setView} />}
        {view === 'chat' && <ChatInterface user={user} />}
        {view === 'education' && <HealthEducation />}
        {view === 'consultations' && <Consultations user={user} />}
        {view === 'vitals' && <VitalsHub user={user} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden flex justify-around py-3 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 rounded-t-[2.5rem]">
        <NavButton icon="🏠" label="Home" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
        <NavButton icon="💬" label="AI Chat" active={view === 'chat'} onClick={() => setView('chat')} />
        <NavButton icon="📈" label="Health" active={view === 'vitals'} onClick={() => setView('vitals')} />
        <NavButton icon="🩺" label="Doctors" active={view === 'consultations'} onClick={() => setView('consultations')} />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
    <span className={`text-xl transition-transform ${active ? 'scale-125' : ''}`}>{icon}</span>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
