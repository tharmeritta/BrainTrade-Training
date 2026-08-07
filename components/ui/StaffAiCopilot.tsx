'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Send, X, Bot, ArrowRight } from 'lucide-react';

export default function StaffAiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello Coach! Ask me anything about team performance, objection gaps, or 1-on-1 coaching recommendations.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!query.trim() || loading) return;
    const userMsg = query.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      let reply = 'Analysis complete. Sarah Chen and Marcus Vance need coaching on Fee Structure objection handling this week.';
      if (userMsg.toLowerCase().includes('compliance') || userMsg.toLowerCase().includes('risk')) {
        reply = 'Compliance alert: 1 session flagged for guaranteed return claims during risk pushback. Review Sarah Chen’s transcript.';
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-xl hover:shadow-purple-500/25 hover:scale-105 transition-all border border-white/20"
      >
        <Sparkles size={16} className="animate-spin" />
        <span>Staff AI Copilot</span>
      </button>

      {/* Slide-over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-slate-950 border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-100">Trainer AI Copilot</h3>
                    <p className="text-[10px] text-slate-400">Natural language team intelligence</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
                  <X size={18} />
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="h-6 w-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 text-[10px] font-black">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-purple-600 text-white font-medium rounded-br-none'
                          : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-purple-400 text-xs animate-pulse">
                    <Sparkles size={14} className="animate-spin" />
                    <span>Analyzing cohort metrics...</span>
                  </div>
                )}
              </div>

              {/* Input Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Copilot (e.g. Who needs coaching today?)..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-100 outline-none placeholder:text-slate-500 focus:border-purple-500/40"
                />
                <button
                  onClick={handleSend}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
