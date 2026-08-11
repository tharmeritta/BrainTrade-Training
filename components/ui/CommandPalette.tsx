'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Sparkles, Settings, ArrowRight, ShieldCheck, X, FileText } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const pathname = usePathname();
  const locale = pathname?.split('/')[1] === 'en' ? 'en' : 'th';

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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
    { id: '1', title: 'Telesales Roleplay Scenarios', category: 'Scenarios', href: `/${locale}/ai-eval`, icon: Sparkles },
    { id: '2', title: 'Cohort Heatmap & Skill Matrix', category: 'Analytics', href: `/${locale}/evaluator`, icon: Users },
    { id: '3', title: 'System Diagnostics & Health Radar', category: 'Admin', href: `/${locale}/admin`, icon: ShieldCheck },
    { id: '4', title: 'Learn Courses Configuration', category: 'Courses', href: `/${locale}/learn`, icon: FileText },
    { id: '5', title: 'Admin System Settings', category: 'Config', href: `/${locale}/admin`, icon: Settings },
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 px-4"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden space-y-0"
            onClick={e => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-border bg-muted/40">
              <Search className="text-muted-foreground mr-3 shrink-0" size={18} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search agents, scenarios, reports, or type a command... (⌘K)"
                aria-label="Search command palette"
                className="w-full bg-transparent text-foreground text-sm font-medium outline-none placeholder:text-muted-foreground"
              />
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                aria-label="Close command palette"
                className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ESC
              </button>
            </div>

            {/* Command Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching results found.
                </div>
              ) : (
                filtered.map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/60 text-left transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:border-primary/40">
                          <ItemIcon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] font-medium text-muted-foreground">
                            {item.category}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>Tip: Press ⌘K anywhere to open palette</span>
              <span>BrainTrade Training OS</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
