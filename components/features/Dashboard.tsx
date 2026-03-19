'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardList, PlayCircle, BarChart3, LucideIcon } from 'lucide-react';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';

// --- Types & Constants ---

interface ModuleItem {
  label: string;
  href: string;
  sub: string;
  icon: LucideIcon;
  color: string;
}

const MODULES: ModuleItem[] = [
  { 
    label: 'เรียนรู้', 
    href: '/learn/product', 
    sub: 'ศึกษาข้อมูลผลิตภัณฑ์', 
    icon: BookOpen, 
    color: 'bg-blue-500' 
  },
  { 
    label: 'แบบทดสอบ', 
    href: '/quiz', 
    sub: 'วัดความรู้ของคุณ', 
    icon: ClipboardList, 
    color: 'bg-indigo-500' 
  },
  { 
    label: 'AI ประเมินผล', 
    href: '/ai-eval', 
    sub: 'วิเคราะห์การนำเสนอ', 
    icon: BarChart3, 
    color: 'bg-violet-500'
  },
  { 
    label: 'ฝึกพิช', 
    href: '/pitch', 
    sub: 'จำลองการขายเสมือนจริง', 
    icon: PlayCircle, 
    color: 'bg-orange-500' 
  },
];

// --- Sub-components ---

/**
 * Dashboard page header
 */
const DashboardHeader = () => (
  <motion.header 
    variants={FADE_IN}
    initial="initial"
    animate="animate"
  >
    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
      แดชบอร์ด <span className="text-primary">การพัฒนา</span>
    </h1>
    <p className="text-muted-foreground mt-2 text-lg">เลือกหัวข้อที่ต้องการฝึกฝนได้เลย</p>
  </motion.header>
);

/**
 * Individual module card
 */
const ModuleCard = ({ item, locale }: { item: ModuleItem; locale: string }) => {
  const Icon = item.icon;
  
  return (
    <motion.div variants={STAGGER_ITEM}>
      <Link
        href={`/${locale}${item.href}`}
        className="group relative overflow-hidden bg-card hover:bg-accent/50 p-6 rounded-3xl border border-border transition-all duration-300 flex flex-col items-center text-center gap-4 hover:shadow-2xl hover:-translate-y-1 h-full"
      >
        <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={28} />
        </div>
        <div>
          <h3 className="font-bold text-lg">{item.label}</h3>
          <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
        </div>
        
        {/* Glow effect */}
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${item.color} opacity-[0.03] blur-3xl group-hover:opacity-[0.1] transition-opacity`} />
      </Link>
    </motion.div>
  );
};

// --- Main Component ---

export default function Dashboard() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'th';

  return (
    <div className="space-y-12">
      <DashboardHeader />

      <section>
        <motion.h2 
          variants={FADE_IN}
          initial="initial"
          animate="animate"
          className="text-xl font-bold mb-6 flex items-center gap-2"
        >
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          เมนูทางลัด
        </motion.h2>

        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {MODULES.map((item) => (
            <ModuleCard 
              key={item.label} 
              item={item} 
              locale={locale} 
            />
          ))}
        </motion.div>
      </section>
    </div>
  );
}
