'use client';

import { useEffect, useState } from 'react';
import { UserCheck, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentOption { id: string; name: string; }

const LS_ID   = 'brainstrade_agent_id';
const LS_NAME = 'brainstrade_agent_name';

export function useAgent() {
  const [agentId,   setAgentId]   = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);

  useEffect(() => {
    setAgentId(localStorage.getItem(LS_ID));
    setAgentName(localStorage.getItem(LS_NAME));
  }, []);

  const save = (id: string, name: string) => {
    localStorage.setItem(LS_ID, id);
    localStorage.setItem(LS_NAME, name);
    setAgentId(id); setAgentName(name);
  };

  return { agentId, agentName, save };
}

interface Props {
  onSelected?: (id: string, name: string) => void;
}

export default function AgentPicker({ onSelected }: Props) {
  const { agentId, agentName, save } = useAgent();
  const [open,    setOpen]    = useState(false);
  const [agents,  setAgents]  = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!agentId) setOpen(true);
  }, [agentId]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => setAgents(d.agents ?? []))
      .finally(() => setLoading(false));
  }, [open]);

  function select(agent: AgentOption) {
    save(agent.id, agent.name);
    onSelected?.(agent.id, agent.name);
    setOpen(false);
  }

  return (
    <>
      {/* Persistent chip */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2">
          <UserCheck size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">
            {agentName ?? 'ยังไม่ได้เลือกชื่อ'}
          </span>
          <button onClick={() => setOpen(true)} className="text-xs text-muted-foreground hover:text-primary ml-2 flex items-center gap-1">
            <ChevronDown size={14} /> เปลี่ยน
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8"
            >
              {agentId && (
                <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              )}
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                <UserCheck size={24} />
              </div>
              <h2 className="text-xl font-bold mb-1">เลือกชื่อของคุณ</h2>
              <p className="text-sm text-muted-foreground mb-6">ผลการฝึกจะถูกบันทึกภายใต้ชื่อที่เลือก</p>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">กำลังโหลด...</div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">ยังไม่มีรายชื่อ กรุณาติดต่อผู้จัดการ</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {agents.map(a => (
                    <button
                      key={a.id}
                      onClick={() => select(a)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all duration-150 ${
                        agentId === a.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-transparent bg-secondary/40 hover:border-primary/30 hover:bg-white'
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
