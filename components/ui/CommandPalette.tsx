'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Sparkles, Settings, ArrowRight, ShieldCheck, X, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Listen for ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const COMMAND_ITEMS = [
    { id: '1', title: 'Telesales Roleplay Scenarios', category: 'Scenarios', href: '/th/ai-eval', icon: Sparkles },
    { id: '2', title: 'Cohort Heatmap & Skill Matrix', category: 'Analytics', href: '/th/evaluator', icon: Users },
    { id: '3', title: 'System Diagnostics & Health Radar', category: 'Admin', href: '/th/admin', icon: ShieldCheck },
    { id: '4', title: 'Learn Courses Configuration', category: 'Courses', href: '/th/learn', icon: FileText },
    { id: '5', title: 'Admin System Settings', category: 'Config', href: '/th/admin', icon: Settings },
  ];

  const filtered = COMMAND_ITEMS.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-24 px-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden space-y-0"
            onClick={e => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-slate-900/60">
              <Search className="text-slate-400 mr-3 shrink-0" size={18} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search agents, scenarios, reports, or type a command... (⌘K)"
                className="w-full bg-transparent text-slate-100 text-sm font-medium outline-none placeholder:text-slate-500"
                autoFocus
              />
              <button onClick={() => setIsOpen(false)} className="text-xs font-mono font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-md border border-white/10 hover:text-slate-300">
                ESC
              </button>
            </div>

            {/* Command Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No matching results found.
                </div>
              ) : (
                filtered.map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-900 border border-white/10 text-purple-400 group-hover:border-purple-500/40">
                          <ItemIcon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] font-medium text-slate-500">
                            {item.category}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-900/80 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Tip: Press ⌘K anywhere to open palette</span>
              <span>BrainTrade Training OS</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
