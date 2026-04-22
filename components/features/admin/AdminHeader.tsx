'use client';

import LangToggle  from '@/components/ui/LangToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { TabItem } from './dashboard-policy';

interface AdminHeaderProps {
  activeTab?: TabItem;
  mounted: boolean;
  t: any;
}

export default function AdminHeader({ activeTab, mounted, t }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-background/60 backdrop-blur-2xl border-b border-border/40">
      <div className="flex items-center gap-2 min-w-0">
        {activeTab && (
          <>
            <activeTab.icon size={18} className="text-primary shrink-0" />
            <div>
              <h1 className="text-sm font-black text-foreground tracking-tight leading-tight">
                {t(`tabs.${activeTab.labelKey}`)}
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {mounted && new Date().toLocaleDateString(
                  t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB',
                  { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
                )}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 p-1 bg-muted/50 border border-border/50 rounded-full">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
