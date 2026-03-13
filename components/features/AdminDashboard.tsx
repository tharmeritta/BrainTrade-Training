'use client';

import { useState } from 'react';
import { UserPlus, Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard({ adminUid }: { adminUid: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStatus(`✓ Created agent: ${email}`);
      setEmail(''); setPassword(''); setName('');
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-in space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">Administrative Control</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Admin Control Panel</h1>
        <p className="text-muted-foreground mt-2">จัดการบัญชีผู้ใช้และกำหนดสิทธิ์เข้าถึงระบบ</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden"
      >
        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">สร้างบัญชีตัวแทน (Agent)</h2>
              <p className="text-sm text-muted-foreground">กรอกข้อมูลพื้นฐานเพื่อสร้างบัญชีใหม่เข้าสู่ระบบ</p>
            </div>
          </div>

          <form onSubmit={createUser} className="space-y-6">
            <div className="grid gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <User size={18} />
                </div>
                <input
                  placeholder="ชื่อ-นามสกุล"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-secondary/30 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="อีเมลแอดเดรส"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-secondary/30 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="รหัสผ่านชั่วคราว"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-secondary/30 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  สร้างบัญชีผู้ใช้งาน
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            {status && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl text-center text-sm font-medium ${
                  status.startsWith('✓') ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/5 text-destructive'
                }`}
              >
                {status}
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
