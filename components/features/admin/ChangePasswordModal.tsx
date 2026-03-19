'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setNewPassword('');
        }, 1500);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to change password');
      }
    } catch {
      setError('Network error');
    }
    setSaving(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-card border border-border rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            
            <h3 className="font-black text-xl text-foreground mb-2">Change Password</h3>
            <p className="text-sm text-muted-foreground mb-6">Update your login credentials</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  placeholder="Enter new password"
                  autoFocus
                />
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              {success && <p className="text-xs text-emerald-500 font-medium">Password updated successfully!</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || success || !newPassword}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  {saving ? 'Updating...' : success ? 'Updated!' : 'Update Password'}
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
