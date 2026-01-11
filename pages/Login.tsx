
import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 9) setOtpSent(true);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login with selected role
    onLogin({
      id: selectedRole === UserRole.DOCTOR ? 'doc_123' : 'usr_123',
      fullName: selectedRole === UserRole.DOCTOR ? 'Dr. Benson Kamau' : 'Benson Kamau',
      phoneNumber,
      role: selectedRole,
      avatarUrl: 'https://picsum.photos/200'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">A</div>
          <h1 className="text-2xl font-bold text-slate-900">Karibu AfyaMkononi</h1>
          <p className="text-slate-500 text-sm">Afya Yako, Mkononi Mwako</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setSelectedRole(UserRole.PATIENT)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedRole === UserRole.PATIENT ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            I am a Patient
          </button>
          <button 
            onClick={() => setSelectedRole(UserRole.DOCTOR)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedRole === UserRole.DOCTOR ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            I am a Doctor
          </button>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">+254</span>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="712345678"
                  className="w-full pl-14 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Get OTP via SMS
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Enter 6-digit OTP</label>
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-center text-2xl tracking-[1em]"
                required
              />
              <p className="mt-2 text-xs text-center text-slate-500">Sent to +254 {phoneNumber}</p>
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Verify & Log In
            </button>
            <button 
              type="button" 
              onClick={() => setOtpSent(false)}
              className="w-full text-slate-500 text-sm font-medium hover:text-emerald-600"
            >
              Change Phone Number
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-6">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Safaricom_logo.svg/1200px-Safaricom_logo.svg.png" className="h-4 opacity-50 grayscale hover:grayscale-0 cursor-pointer" alt="M-Pesa" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/WhatsApp_logo.svg/1200px-WhatsApp_logo.svg.png" className="h-4 opacity-50 grayscale hover:grayscale-0 cursor-pointer" alt="WhatsApp" />
        </div>
      </div>
    </div>
  );
};

export default Login;
