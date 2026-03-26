'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  CheckCircle2, XCircle, Clock, User, 
  ArrowRight, ShieldCheck, Settings2, Users,
  Trash2, Plus, Edit3, Power, AlertCircle
} from 'lucide-react';
import type { ApprovalRequest } from '@/types';
import { timeAgo } from './AdminHelpers';

export default function ApprovalsTab({ currentUserId, role }: { currentUserId: string; role: string }) {
  const t = useTranslations('admin');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const isIT = role === 'it';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/approvals');
      if (res.ok) {
        const data = await res.json();
        let fetched = data.requests ?? [];
        // IT sees only their own requests, Admin sees everything
        if (isIT) {
          fetched = fetched.filter((r: ApprovalRequest) => r.requesterId === currentUserId);
        }
        setRequests(fetched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isIT, currentUserId]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (requestId: string, status: 'approved' | 'rejected') => {
    setResolving(requestId);
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requestId, 
          status, 
          rejectionReason: status === 'rejected' ? rejectionReason : undefined 
        })
      });
      if (res.ok) {
        setRejectionReason('');
        setShowRejectModal(null);
        await load();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to resolve request');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setResolving(null);
    }
  };

  const getActionIcon = (type: string) => {
    if (type.includes('create')) return <Plus size={14} className="text-emerald-500" />;
    if (type.includes('delete')) return <Trash2 size={14} className="text-red-500" />;
    if (type.includes('toggle')) return <Power size={14} className="text-amber-500" />;
    return <Edit3 size={14} className="text-blue-500" />;
  };

  const getCategoryIcon = (type: string) => {
    if (type.includes('staff')) return <ShieldCheck size={16} />;
    if (type.includes('config')) return <Settings2 size={16} />;
    if (type.includes('agent')) return <Users size={16} />;
    return <Clock size={16} />;
  };

  const pending = requests.filter(r => r.status === 'pending');
  const history = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight">
            <Clock className="text-primary" /> {isIT ? 'My Requests' : 'Approval Requests'}
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {isIT 
              ? 'Track the status of system changes you have submitted for administrator approval.'
              : 'Review and authorize actions requested by IT Support staff.'}
          </p>
        </div>
        {isIT && (
          <div className="text-[10px] font-black uppercase tracking-widest text-primary/50 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
            Only showing your requests
          </div>
        )}
      </div>

      {/* Pending Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          {isIT ? 'Pending Approval' : 'Pending Authorization'} ({pending.length})
        </h3>
        
        {loading ? (
          <div className="py-12 text-center animate-pulse font-bold text-muted-foreground">Loading requests...</div>
        ) : pending.length === 0 ? (
          <div className="bg-secondary/20 border border-dashed border-border rounded-3xl py-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <CheckCircle2 size={32} className="opacity-20" />
            <p className="font-bold text-sm uppercase tracking-wider">All caught up!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map(req => (
              <motion.div 
                layout
                key={req.id} 
                className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm hover:border-primary/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {getCategoryIcon(req.actionType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground tracking-tighter">
                          {req.actionType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {timeAgo(req.createdAt)}
                        </span>
                      </div>
                      <h4 className="font-black text-base flex items-center gap-2">
                        {getActionIcon(req.actionType)}
                        {req.targetName || 'System Change'}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
                        <User size={12} /> Requested by <span className="text-foreground font-bold">{req.requesterName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => resolve(req.id, 'approved')}
                      disabled={!!resolving || req.requesterId === currentUserId}
                      title={req.requesterId === currentUserId ? 'Self-approval not allowed' : undefined}
                      className="flex-1 md:flex-none bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                      {resolving === req.id ? '...' : <><CheckCircle2 size={14} /> Approve</>}
                    </button>
                    <button 
                      onClick={() => setShowRejectModal(req.id)}
                      disabled={!!resolving || req.requesterId === currentUserId}
                      className="flex-1 md:flex-none bg-secondary text-foreground px-6 py-2.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="mt-6 pt-6 border-t border-border/30">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Payload Preview</p>
                  <pre className="bg-secondary/30 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-40 scrollbar-hide text-muted-foreground/80 leading-relaxed border border-border/20">
                    {JSON.stringify(req.data, null, 2)}
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
      {history.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent History</h3>
          <div className="bg-card border border-border/50 rounded-3xl overflow-hidden divide-y divide-border/30">
            {history.slice(0, 10).map(req => (
              <div key={req.id} className="p-4 flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {req.status === 'approved' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{req.targetName || req.actionType}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {req.status === 'approved' ? 'Approved' : 'Rejected'} by {req.resolvedByName} · {timeAgo(req.resolvedAt)}
                    </p>
                  </div>
                </div>
                {req.rejectionReason && (
                  <div className="flex items-center gap-1.5 text-[10px] bg-red-500/5 text-red-500/70 px-3 py-1 rounded-full border border-red-500/10">
                    <AlertCircle size={10} /> {req.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-black mb-2 flex items-center gap-2 uppercase tracking-tight text-red-500">
                <XCircle /> Reject Request
              </h3>
              <p className="text-sm text-muted-foreground font-medium mb-6">
                Please provide a reason for rejecting this IT request.
              </p>
              
              <textarea 
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full bg-secondary/50 p-4 rounded-2xl border border-transparent focus:border-red-500/30 outline-none transition-all font-medium text-sm h-32 resize-none mb-6"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRejectModal(null)} 
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => resolve(showRejectModal, 'rejected')}
                  disabled={!rejectionReason.trim() || !!resolving}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
