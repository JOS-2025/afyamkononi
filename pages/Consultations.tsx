
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, Consultation, Doctor, UserRole } from '../types';
import { generateMedicalSummary } from '../services/geminiService';

interface Props {
  user: UserProfile;
}

const MOCK_DOCTORS: Doctor[] = [
  { id: 'doc_123', name: 'Dr. Benson Kamau', specialty: 'Family Physician', rating: 5.0, available: true, slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], blockedDates: [] },
  { id: 'doc_2', name: 'Dr. Peter Otieno', specialty: 'Pediatrician', rating: 4.9, available: true, slots: ['08:00 AM', '10:00 AM', '12:00 PM', '03:00 PM'], blockedDates: [] },
  { id: 'doc_3', name: 'Dr. Sarah Wambui', specialty: 'Dermatologist', rating: 4.7, available: true, slots: ['08:30 AM', '01:00 PM', '04:30 PM'], blockedDates: [] },
];

const MOCK_HISTORY: Consultation[] = [
  {
    id: 'past_1',
    patientId: 'usr_123',
    doctorId: 'doc_123',
    doctorName: 'Dr. Benson Kamau',
    status: 'completed',
    summary: 'Patient reported persistent dry cough for 3 days and slight fever.',
    doctorNotes: 'Clinical examination revealed mild pharyngeal congestion. Lungs clear on auscultation. Diagnosis: Mild viral URTI. Recommendation: Hydration, steam inhalation, and paracetamol for fever.',
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    fee: 1500
  }
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Consultations: React.FC<Props> = ({ user }) => {
  const [step, setStep] = useState<'list' | 'booking-doctors' | 'booking-calendar' | 'booking-slots' | 'booking-confirm' | 'payment' | 'detail' | 'edit-profile' | 'active-call'>('list');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [appointments, setAppointments] = useState<Consultation[]>([]);
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const [isOnline, setIsOnline] = useState(true);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  // M-Pesa Simulated State
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  // Video Call States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const upcomingApps = useMemo(() => 
    appointments.filter(app => app.status !== 'completed').sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()),
    [appointments]
  );

  const pastApps = useMemo(() => 
    appointments.filter(app => app.status === 'completed').sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime()),
    [appointments]
  );

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [viewDate]);

  useEffect(() => {
    const savedApps = localStorage.getItem(`appointments_${user.id}`);
    const localApps = savedApps ? JSON.parse(savedApps).map((a: any) => ({
      ...a,
      scheduledAt: new Date(a.scheduledAt),
      createdAt: new Date(a.createdAt)
    })) : [];
    
    setAppointments([...localApps, ...MOCK_HISTORY]);
  }, [user.id]);

  useEffect(() => {
    if (step === 'active-call') {
      timerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setIsConnecting(true);
      setTimeout(() => setIsConnecting(false), 2000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const handleBookNew = () => {
    setStep('booking-doctors');
    setSelectedDoctor(null);
  };

  const handleDoctorSelect = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setStep('booking-calendar');
  };

  const initMpesaPayment = () => {
    setStep('payment');
    setPaymentStatus('pending');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => confirmBooking(), 1500);
    }, 3000);
  };

  const confirmBooking = () => {
    if (!selectedDoctor || !selectedSlot) return;
    const scheduledDate = new Date(bookingDate);
    const newAppointment: Consultation = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: user.id,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      status: 'scheduled',
      scheduledAt: scheduledDate, 
      createdAt: new Date(),
      fee: 1500
    };

    const updated = [newAppointment, ...appointments];
    setAppointments(updated);
    localStorage.setItem(`appointments_${user.id}`, JSON.stringify(updated.filter(a => !a.id.startsWith('past_'))));
    setStep('list');
    setPaymentStatus('idle');
  };

  const handleGenerateAISummary = async () => {
    if (!selectedConsultation?.doctorNotes) return;
    setIsGeneratingSummary(true);
    try {
      const summary = await generateMedicalSummary(selectedConsultation.doctorNotes);
      const updated = { ...selectedConsultation, aiPatientSummary: summary };
      setSelectedConsultation(updated);
      setAppointments(prev => prev.map(app => app.id === selectedConsultation.id ? updated : app));
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {step === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Consultations</h2>
              <p className="text-slate-500 text-sm">Managing your health journey.</p>
            </div>
            <button onClick={handleBookNew} className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 active:scale-95 transition-all">
              Book Specialist
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl w-max">
            {['upcoming', 'history'].map(t => (
              <button key={t} onClick={() => setTab(t as any)} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider ${tab === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {(tab === 'upcoming' ? upcomingApps : pastApps).map(app => (
              <div key={app.id} onClick={() => { setSelectedConsultation(app); setStep('detail'); }} className="bg-white border border-slate-100 rounded-[2rem] p-5 flex justify-between items-center shadow-sm cursor-pointer hover:border-emerald-300 transition-all group active:scale-[0.99]">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-emerald-100 transition-colors">🩺</div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg tracking-tight">{app.doctorName}</h4>
                    <p className="text-xs text-slate-500">
                      {app.scheduledAt.toLocaleDateString()} at {app.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {tab === 'upcoming' && (
                  <button onClick={(e) => { e.stopPropagation(); setSelectedConsultation(app); setStep('active-call'); }} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">Join Call</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'detail' && selectedConsultation && (
        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">{selectedConsultation.doctorName}</h3>
            <button onClick={() => setStep('list')} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">✕</button>
          </div>
          
          <div className="p-10 space-y-10">
             {selectedConsultation.status === 'completed' && (
               <section className="space-y-4">
                 <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AI Patient Recap</h4>
                   {!selectedConsultation.aiPatientSummary && !isGeneratingSummary && (
                     <button onClick={handleGenerateAISummary} className="text-[9px] font-black bg-emerald-600 text-white px-4 py-2 rounded-full">Summarize</button>
                   )}
                 </div>
                 {isGeneratingSummary ? (
                   <div className="bg-emerald-50 p-8 rounded-3xl animate-pulse text-center text-emerald-600 font-bold text-xs uppercase tracking-widest">AI is simplifying notes...</div>
                 ) : selectedConsultation.aiPatientSummary ? (
                   <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg italic text-sm leading-relaxed">
                     "{selectedConsultation.aiPatientSummary}"
                   </div>
                 ) : null}
               </section>
             )}
             <section className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Notes</h4>
               <div className="bg-slate-50 p-6 rounded-3xl text-sm text-slate-600 leading-loose italic">
                 {selectedConsultation.doctorNotes || 'Record pending...'}
               </div>
             </section>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in-95">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Safaricom_logo.svg/1200px-Safaricom_logo.svg.png" className="h-8 mx-auto mb-8" alt="M-Pesa" />
            {paymentStatus === 'pending' ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto animate-bounce">📱</div>
                <h3 className="text-xl font-black text-slate-900">STK Push Sent</h3>
                <p className="text-slate-500 text-sm">Check your phone to authorize KES 1,500 payment.</p>
              </div>
            ) : (
              <div className="space-y-6 text-emerald-600">
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto text-white">✓</div>
                <h3 className="text-xl font-black text-slate-900">Payment Verified</h3>
                <p className="text-[10px] font-black uppercase tracking-widest">Success</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'active-call' && selectedConsultation && (
        <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col md:flex-row animate-in fade-in duration-700 overflow-hidden">
          <div className="flex-1 relative bg-black flex items-center justify-center">
            {isConnecting && (
              <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white text-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h3 className="text-2xl font-black">Connecting Secure Link...</h3>
              </div>
            )}
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" poster="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=1200" />
            <div className="absolute top-8 left-8 flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
              <span className="text-white font-mono font-bold tracking-widest">{formatTime(callDuration)}</span>
            </div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-6 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10">
              <button onClick={() => setStep('list')} className="w-20 h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl active:scale-95 transition-all text-3xl">📞</button>
            </div>
          </div>
        </div>
      )}

      {step === 'booking-doctors' && (
        <div className="space-y-6">
          <button onClick={() => setStep('list')} className="text-slate-400 text-[10px] font-black uppercase tracking-widest">← Back</button>
          <div className="grid grid-cols-1 gap-4">
            {MOCK_DOCTORS.map(doc => (
              <div key={doc.id} onClick={() => handleDoctorSelect(doc)} className="bg-white rounded-[2.5rem] p-6 flex items-center gap-6 border border-slate-100 cursor-pointer hover:border-emerald-500 transition-all shadow-sm">
                <img src={`https://i.pravatar.cc/150?u=${doc.id}`} className="w-20 h-20 rounded-3xl object-cover" alt="" />
                <div>
                  <h4 className="font-black text-slate-900 text-lg">{doc.name}</h4>
                  <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">{doc.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'booking-calendar' && selectedDoctor && (
        <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100">
          <h4 className="text-xl font-black text-slate-900 mb-8">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
          <div className="grid grid-cols-7 gap-3 text-center">
            {calendarDays.map((date, i) => date ? (
              <button key={i} onClick={() => { setBookingDate(date); setStep('booking-slots'); }} className="p-4 h-16 rounded-2xl bg-slate-50 font-black text-slate-700 hover:bg-emerald-600 hover:text-white transition-all">{date.getDate()}</button>
            ) : <div key={i}></div>)}
          </div>
        </div>
      )}

      {step === 'booking-slots' && selectedDoctor && (
        <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-10 shadow-xl">
          <h3 className="text-2xl font-black text-slate-900 mb-8 text-center">Available Times</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedDoctor.slots.map(slot => (
              <button key={slot} onClick={() => { setSelectedSlot(slot); setStep('booking-confirm'); }} className="p-6 rounded-[2rem] bg-slate-50 font-black text-slate-700 hover:bg-emerald-600 hover:text-white transition-all">{slot}</button>
            ))}
          </div>
        </div>
      )}

      {step === 'booking-confirm' && selectedDoctor && selectedSlot && (
        <div className="max-w-md mx-auto bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
          <div className="bg-emerald-600 p-10 text-center text-white">
            <h3 className="text-2xl font-black tracking-tight">Confirm Booking</h3>
          </div>
          <div className="p-10 space-y-8">
            <div className="flex justify-between">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Fee</span>
              <span className="text-lg font-black text-slate-900">KES 1,500</span>
            </div>
            <button onClick={initMpesaPayment} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100">
              Pay via M-Pesa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultations;
