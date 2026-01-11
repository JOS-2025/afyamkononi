
import React from 'react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  setView: (view: any) => void;
  activeView: string;
  onLogout: () => void;
}

const Navbar: React.FC<Props> = ({ user, setView, activeView, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-emerald-900 hidden sm:inline">AfyaMkononi</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <NavLink label="Home" active={activeView === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavLink label="Health Chat" active={activeView === 'chat'} onClick={() => setView('chat')} />
          <NavLink label="Consultations" active={activeView === 'consultations'} onClick={() => setView('consultations')} />
          <NavLink label="Education" active={activeView === 'education'} onClick={() => setView('education')} />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
          >
            👋
          </button>
        </div>
      </div>
    </header>
  );
};

const NavLink: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`text-sm font-medium transition-colors ${active ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
  >
    {label}
  </button>
);

export default Navbar;
