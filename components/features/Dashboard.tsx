'use client';

import { useUser } from '@/lib/UserContext';
import ProgressCard from '@/components/ui/ProgressCard';
import AdminDashboard from '@/components/features/AdminDashboard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardList, Mic, PlayCircle, Users, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { user, loading, mode } = useUser();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'th';

  if (loading) {
    return <div className="text-gray-400">กำลังโหลด...</div>;
  }

  if (!user) return null;

  // ── Admin Mode ────────────────────────────────────────────────────────────
  if (mode === 'admin') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">จัดการบัญชีผู้ใช้และดูข้อมูลภาพรวม</p>
          </div>
        </div>
        <AdminDashboard adminUid={user.uid} />
      </div>
    );
  }

  // ── Agent Mode ────────────────────────────────────────────────────────────
  return (
    <div className="animate-in space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            แดชบอร์ด <span className="text-primary">การพัฒนา</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            ยินดีต้อนรับกลับ, <span className="font-semibold text-foreground">{user.name}</span> พร้อมลุยต่อหรือยัง?
          </p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <ProgressCard userId={user.uid} />
      </motion.div>

      <section>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          เมนูทางลัด
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'เรียนรู้', href: `/learn/product`, sub: 'ศึกษาข้อมูลผลิตภัณฑ์', icon: BookOpen, color: 'bg-blue-500' },
            { label: 'แบบทดสอบ', href: `/quiz/product`, sub: 'วัดความรู้ของคุณ', icon: ClipboardList, color: 'bg-indigo-500' },
            { label: 'AI ประเมินผล', href: `/ai-eval`, sub: 'วิเคราะห์การนำเสนอ', icon: BarChart3, icon2: Mic, color: 'bg-emerald-500' },
            { label: 'ฝึกพิช', href: `/pitch`, sub: 'จำลองการขายเสมือนจริง', icon: PlayCircle, color: 'bg-orange-500' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/${locale}${item.href}`}
                  className="group relative overflow-hidden bg-card hover:bg-accent/50 p-6 rounded-3xl border border-border transition-all duration-300 flex flex-col items-center text-center gap-4 hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg shadow-white/20 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                  </div>
                  
                  {/* Subtle background glow */}
                  <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${item.color} opacity-[0.03] blur-3xl group-hover:opacity-[0.1] transition-opacity`} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
