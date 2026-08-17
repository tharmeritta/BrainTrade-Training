'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, Sparkles, Settings, ArrowRight, 
  ShieldCheck, X, FileText, Activity, GraduationCap, 
  Edit3, Zap, BarChart3, FileSpreadsheet, Award, Presentation 
} from 'lucide-react';
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const COMMAND_ITEMS = [
    // Workspaces
    { id: 'ws-ops', title: 'Operations Hub (Command Center & Live Stream)', category: 'Workspace', href: `/${locale}/admin?tab=operations`, icon: Activity },
    { id: 'ws-studio', title: 'Academy Studio (Courses, Quizzes & AI Scenarios)', category: 'Workspace', href: `/${locale}/admin?tab=studio`, icon: Sparkles },
    { id: 'ws-roster', title: 'Staff & Roster (Trainees & Roles)', category: 'Workspace', href: `/${locale}/admin?tab=roster`, icon: Users },
    { id: 'ws-analytics', title: 'Analytics & Governance (Heatmap, Reports & Certs)', category: 'Workspace', href: `/${locale}/admin?tab=analytics`, icon: BarChart3 },

    // Studio Sub-actions
    { id: 'act-courses', title: 'Course Module & Slide Builder', category: 'Studio', href: `/${locale}/admin?tab=studio&sub=courses`, icon: GraduationCap },
    { id: 'act-quizzes', title: 'Quiz Assessment Builder & MCQs', category: 'Studio', href: `/${locale}/admin?tab=studio&sub=quizzes`, icon: Edit3 },
    { id: 'act-scenarios', title: 'AI Call Simulator Personas & Prompts', category: 'Studio', href: `/${locale}/admin?tab=studio&sub=scenarios`, icon: Zap },
    { id: 'act-showcase', title: 'Client Presentation Showcase Hub', category: 'Studio', href: `/${locale}/admin?tab=studio&sub=showcase`, icon: Presentation },

    // Roster & Analytics
    { id: 'act-agents', title: 'Trainee Agent Directory', category: 'Roster', href: `/${locale}/admin?tab=roster&sub=agents`, icon: Users },
    { id: 'act-staff', title: 'Staff System Accounts & Permissions', category: 'Roster', href: `/${locale}/admin?tab=roster&sub=staff`, icon: ShieldCheck },
    { id: 'act-heatmap', title: 'Cohort Progress Heatmap & Matrix', category: 'Analytics', href: `/${locale}/admin?tab=analytics&sub=heatmap`, icon: BarChart3 },
    { id: 'act-reports', title: 'Export Excel & Performance Records', category: 'Analytics', href: `/${locale}/admin?tab=analytics&sub=reports`, icon: FileSpreadsheet },
    { id: 'act-certs', title: 'Issue & Verify Certificates', category: 'Analytics', href: `/${locale}/admin?tab=analytics&sub=certification`, icon: Award },
    { id: 'act-health', title: 'System Diagnostics & Health Radar', category: 'Analytics', href: `/${locale}/admin?tab=analytics&sub=health`, icon: ShieldCheck },

    // Agent Hub
    { id: 'agent-hub', title: 'Open Agent Training Hub (Live Trainee View)', category: 'Agent App', href: `/${locale}/dashboard`, icon: GraduationCap },
    { id: 'agent-quiz', title: 'Open Interactive Quiz Arcade', category: 'Agent App', href: `/${locale}/quiz`, icon: Edit3 },
    { id: 'agent-eval', title: 'Open AI Call Simulator HUD', category: 'Agent App', href: `/${locale}/ai-eval`, icon: Zap },
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-20 px-4"
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
              <Search className="text-primary mr-3 shrink-0" size={18} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search workspaces, courses, quizzes, agents or type a command... (⌘K)"
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
            <div className="max-h-84 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No matching workspace commands found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/70 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Navigation shortcut</span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">ESC</kbd> to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
