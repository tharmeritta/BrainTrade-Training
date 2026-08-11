'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Send, X, Bot, ArrowRight } from 'lucide-react';
import { hasStaffSession } from '@/lib/session/client';

export default function StaffAiCopilot() {
  const [isStaff, setIsStaff] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello Coach! Ask me anything about team performance, objection gaps, or 1-on-1 coaching recommendations.' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsStaff(hasStaffSession());
    const checkStaff = () => setIsStaff(hasStaffSession());
    window.addEventListener('agent-session-changed', checkStaff);
    return () => window.removeEventListener('agent-session-changed', checkStaff);
  }, []);

  if (!isStaff) return null;

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
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Staff AI Copilot"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 min-h-[44px] rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-xl hover:shadow-purple-500/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all border border-white/20"
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end"
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Trainer AI Copilot"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-card text-card-foreground border-l border-border p-5 pt-safe pb-safe flex flex-col justify-between shadow-2xl h-dvh"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500/30">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wider text-foreground">Trainer AI Copilot</h3>
                    <p className="text-[10px] text-muted-foreground">Natural language team intelligence</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)} 
                  aria-label="Close Staff AI Copilot"
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
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
                      <div className="h-6 w-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0 text-[10px] font-black">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-purple-600 text-white font-medium rounded-br-none'
                          : 'bg-muted/60 border border-border text-foreground rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 text-xs animate-pulse">
                    <Sparkles size={14} className="animate-spin" />
                    <span>Analyzing cohort metrics...</span>
                  </div>
                )}
              </div>

              {/* Input Footer */}
              <div className="pt-3 border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Copilot (e.g. Who needs coaching today?)..."
                  aria-label="Message to Staff AI Copilot"
                  className="flex-1 bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-purple-500/40 focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  aria-label="Send message"
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
