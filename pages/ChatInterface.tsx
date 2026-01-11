
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { getGeminiChatResponseStream } from '../services/geminiService';

interface Props {
  user: UserProfile;
}

const QUICK_SUGGESTIONS = [
  "Find nearest Level 5 hospital",
  "How to treat a burn?",
  "Symptoms of Malaria",
  "Maternal health tips"
];

const ChatInterface: React.FC<Props> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: `Habari ${user.fullName.split(' ')[0]}! I am your AfyaMkononi AI assistant. I can help with health information or find real hospitals nearby using Google Maps.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const messageText = customText || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      isEmergency: false,
      groundingLinks: []
    };

    setMessages(prev => [...prev, aiMsg]);

    const result = await getGeminiChatResponseStream(
      messages.concat(userMsg), 
      messageText,
      (streamedText) => {
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: streamedText } : m
        ));
      }
    );

    setMessages(prev => prev.map(m => 
      m.id === aiMsgId ? { ...m, isEmergency: result.isEmergency, groundingLinks: result.links } : m
    ));
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-white rounded-[2.5rem] shadow-2xl border border-emerald-100/50 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="p-5 bg-emerald-600 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
          <h2 className="font-black text-lg">AfyaMkononi AI</h2>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">🗑️</button>
      </div>

      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30 custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] p-5 rounded-[1.75rem] text-sm leading-relaxed border ${
              m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : m.isEmergency ? 'bg-red-50 border-red-200 text-red-900 rounded-tl-none animate-pulse' : 'bg-white border-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              
              {m.groundingLinks && m.groundingLinks.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Hospitals found nearby:</p>
                  {m.groundingLinks.map((link, idx) => (
                    <a key={idx} href={link.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
                      📍 {link.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse ml-2">AI is thinking...</div>}
      </div>

      <div className="p-6 bg-white border-t border-slate-50">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Search for Level 5 hospitals..."
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
          <button onClick={() => handleSend()} className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg">✈️</button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
