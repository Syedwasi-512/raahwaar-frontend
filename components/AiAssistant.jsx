import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Clickable links ke liye zaroori hai
import api from '../src/services/api';
import { X, Send, Sparkles, Loader2, ExternalLink } from 'lucide-react';

const AiAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [msg, setMsg] = useState("");
    const [chat, setChat] = useState([{ role: 'bot', text: 'Welcome to Raahwaar Store. I am your personal footwear consultant. How may I assist you in discovering your next premium pair today?' }]);
    const [loading, setLoading] = useState(false);
    
    // Reference for auto-scrolling
    const chatEndRef = useRef(null);

    // --- 1. AUTO SCROLL LOGIC ---
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [chat, isOpen]);

    // --- 2. LINK PARSER LOGIC (Senior Level) ---
    // Yeh function text mein se [Name](/URL) dhoond kar usey clickable <Link> banata hai
    const renderMessage = (text) => {
        const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Link se pehle wala sada text push karein
            parts.push(text.substring(lastIndex, match.index));
            
            // Link ko React Component mein badal dein
            parts.push(
                <Link 
                    key={match[2]} 
                    to={match[2]} 
                    onClick={() => setIsOpen(false)} // Product khulne par chat band
                    className="text-blue-400 underline font-bold inline-flex items-center gap-1 hover:text-blue-300 transition-colors mx-1"
                >
                    {match[1]} <ExternalLink size={10} />
                </Link>
            );
            lastIndex = regex.lastIndex;
        }
        
        // Baki bacha hua text push karein
        parts.push(text.substring(lastIndex));
        return parts.length > 0 ? parts : text;
    };

    const handleSend = async () => {
        if (!msg.trim()) return;
        const userMsg = msg;
        setChat(prev => [...prev, { role: 'user', text: userMsg }]);
        setMsg("");
        setLoading(true);

        try {
            const { data } = await api.post("/ai/chat", { message: userMsg });
            setChat(prev => [...prev, { role: 'bot', text: data.reply }]);
        } catch (err) {
            setChat(prev => [...prev, { role: 'bot', text: "Maaf kijiyega, server se rabta nahi ho pa raha. Dubara try karein?" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans antialiased">
            {/* Bubble Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 group"
                >
                    <Sparkles size={20} className="group-hover:animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest px-1">Ask AI</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[350px] h-[500px] rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-black p-5 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-blue-400" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">Raahwaar Bot</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-[#F9F9F9]">
                        {chat.map((c, i) => (
                            <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${c.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                                    {/* Yahan Hum Parser Call Kar Rahe Hain */}
                                    {renderMessage(c.text)}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start gap-2 text-[10px] text-gray-400 animate-pulse font-bold uppercase tracking-tighter">
                                <Loader2 size={12} className="animate-spin" /> AI is checking stock...
                            </div>
                        )}
                        {/* Scroll Anchor */}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-50 flex gap-2">
                        <input 
                            value={msg} 
                            onChange={(e) => setMsg(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type brand, color or size..."
                            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-black transition-all"
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={loading}
                            className="bg-black text-white p-2.5 rounded-xl active:scale-90 transition-all disabled:opacity-30"
                        >
                            <Send size={16}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiAssistant;