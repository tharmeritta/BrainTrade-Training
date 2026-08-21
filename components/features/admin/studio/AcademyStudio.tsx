'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  GraduationCap, Edit3, Zap, Presentation, ShieldCheck, 
  Eye, EyeOff, Smartphone, Monitor, Sparkles, Loader2, 
  CheckCircle2, AlertCircle, Play, BookOpen, Check 
} from 'lucide-react';

import { useConfigEditor } from '@/lib/hooks/useConfigEditor';
import { COURSE_MODULES } from '@/lib/courses';
import { SkeletonTable } from '@/components/ui/Skeleton';

// Editors
import LearnEditor from '../adjustments/LearnEditor';
import QuizzesEditor from '../adjustments/QuizzesEditor';
import OverridesManager from '../adjustments/OverridesManager';
import AiScenariosTab from '../AiScenariosTab';
import ShowcaseTab from '../ShowcaseTab';
import { PresentationSystemTab } from '../../trainer/PresentationSystemTab';

export type StudioSubTab = 'courses' | 'quizzes' | 'scenarios' | 'presentation' | 'showcase' | 'overrides';

interface AcademyStudioProps {
  role: string;
  readOnly?: boolean;
  activeSubTab?: string;
  initialSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}

export default function AcademyStudio({ 
  role, 
  readOnly, 
  activeSubTab: controlledSubTab,
  initialSubTab = 'courses',
  onSubTabChange 
}: AcademyStudioProps) {
  const t = useTranslations('admin');
  const [internalSubTab, setInternalSubTab] = useState<StudioSubTab>(
    (controlledSubTab as StudioSubTab) || (initialSubTab as StudioSubTab) || 'courses'
  );

  const activeSubTab = (controlledSubTab as StudioSubTab) || internalSubTab;

  const handleSubTabClick = (sub: StudioSubTab) => {
    setInternalSubTab(sub);
    setHasUnsavedChanges(false);
    onSubTabChange?.(sub);
  };

  const [showLivePreview, setShowLivePreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewLang, setPreviewLang] = useState<'th' | 'en'>('th');

  const { 
    configs, 
    loading, 
    saving, 
    saveStatus, 
    hasUnsavedChanges, 
    setHasUnsavedChanges, 
    handleSave 
  } = useConfigEditor(role);

  const initialModules = useMemo(() => {
    if (configs.learn?.modules && Object.keys(configs.learn.modules).length > 0) {
      return configs.learn.modules as any;
    }
    return { ...COURSE_MODULES } as any;
  }, [configs.learn]);

  const SUB_TABS = useMemo(() => [
    { id: 'courses',      label: t('workspaces.subTabs.courses'),      icon: GraduationCap, desc: 'Curriculum & Slide Decks' },
    { id: 'quizzes',      label: t('workspaces.subTabs.quizzes'),      icon: Edit3,         desc: 'Phase Assessments & MCQs' },
    { id: 'scenarios',    label: t('workspaces.subTabs.scenarios'),    icon: Zap,           desc: 'AI Call Simulator Personas' },
    { id: 'presentation', label: t('workspaces.subTabs.presentation'), icon: Presentation,  desc: 'Live Trainer Deck & Broadcast' },
    { id: 'showcase',     label: t('workspaces.subTabs.showcase'),     icon: Presentation,  desc: 'Client Presentation Suite', adminOnly: true },
    { id: 'overrides',    label: t('workspaces.subTabs.overrides'),    icon: ShieldCheck,   desc: 'Pass Scores & Exemptions', adminOnly: true },
  ], [t]);

  const visibleSubTabs = useMemo(() => {
    if (role === 'admin') return SUB_TABS;
    return SUB_TABS.filter(st => !st.adminOnly);
  }, [role, SUB_TABS]);

  if (loading) {
    return (
      <div className="space-y-4 p-2">
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Studio Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card/80 backdrop-blur-xl border border-border/70 p-4 rounded-2xl shadow-sm">
        {/* Left: Studio Sub-tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {visibleSubTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSubTabClick(tab.id as StudioSubTab)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${active 
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                  }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{tab.label}</span>
                {tab.id === 'presentation' && (
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md transition-colors ${active ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                    LIVE
                  </span>
                )}
                {tab.id === 'showcase' && (
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md transition-colors ${active ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'}`}>
                    DEMO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Live Preview Toggle & Status Indicator */}
        <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
          {/* Save Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted/60 border border-border/50">
            {saving ? (
              <span className="flex items-center gap-1.5 text-primary">
                <Loader2 size={13} className="animate-spin" />
                <span>Saving...</span>
              </span>
            ) : saveStatus === 'success' ? (
              <span className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle2 size={13} />
                <span>Saved & Live</span>
              </span>
            ) : saveStatus === 'error' ? (
              <span className="flex items-center gap-1.5 text-rose-500">
                <AlertCircle size={13} />
                <span>Save Error</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Ready</span>
            )}
          </div>

          {/* Toggle Live Preview */}
          <button
            onClick={() => setShowLivePreview(prev => !prev)}
            title="Toggle Live Agent Preview"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
              ${showLivePreview 
                ? 'bg-primary/10 border-primary/30 text-primary font-bold' 
                : 'bg-secondary/60 border-border text-muted-foreground hover:text-foreground'
              }`}
          >
            {showLivePreview ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="hidden sm:inline">{showLivePreview ? 'Live Preview ON' : 'Live Preview OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Editor + Split-Screen Live Preview */}
      <div className={`grid gap-6 transition-all duration-300 ${showLivePreview ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left / Main Column: Active Editor */}
        <div className={showLivePreview ? 'lg:col-span-7 xl:col-span-8' : 'w-full'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="w-full bg-card/60 backdrop-blur-md border border-border/70 rounded-2xl p-4 sm:p-6 shadow-sm"
            >
              {activeSubTab === 'courses' && (
                <LearnEditor
                  initialModules={initialModules}
                  data={configs.learn}
                  onSave={(d) => handleSave('learn', d)}
                  onChange={() => setHasUnsavedChanges(true)}
                  saving={saving}
                  readOnly={readOnly}
                />
              )}

              {activeSubTab === 'quizzes' && (
                <QuizzesEditor
                  data={configs.quizzes}
                  onSave={(d) => handleSave('quizzes', d)}
                  onChange={() => setHasUnsavedChanges(true)}
                  saving={saving}
                  readOnly={readOnly}
                />
              )}

              {activeSubTab === 'scenarios' && (
                <AiScenariosTab readOnly={readOnly} />
              )}

              {activeSubTab === 'presentation' && (
                <PresentationSystemTab 
                  role={role as any} 
                  readOnly={readOnly}
                />
              )}

              {activeSubTab === 'showcase' && (
                <ShowcaseTab />
              )}

              {activeSubTab === 'overrides' && (
                <OverridesManager
                  readOnly={readOnly}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Live Agent Preview Device */}
        {showLivePreview && (
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6 self-start space-y-3">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg space-y-4">
              {/* Preview Header & Controls */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">Agent Live Preview</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Language Toggle */}
                  <div className="flex items-center bg-muted p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      onClick={() => setPreviewLang('th')}
                      className={`px-2 py-0.5 rounded ${previewLang === 'th' ? 'bg-background shadow-xs text-primary' : 'text-muted-foreground'}`}
                    >
                      TH
                    </button>
                    <button
                      onClick={() => setPreviewLang('en')}
                      className={`px-2 py-0.5 rounded ${previewLang === 'en' ? 'bg-background shadow-xs text-primary' : 'text-muted-foreground'}`}
                    >
                      EN
                    </button>
                  </div>

                  {/* Device Form Factor */}
                  <button
                    onClick={() => setPreviewDevice(d => d === 'desktop' ? 'mobile' : 'desktop')}
                    className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                    title={`Switch to ${previewDevice === 'desktop' ? 'Mobile' : 'Desktop'} view`}
                  >
                    {previewDevice === 'desktop' ? <Smartphone size={14} /> : <Monitor size={14} />}
                  </button>
                </div>
              </div>

              {/* Virtual Agent Screen Frame */}
              <div className={`mx-auto transition-all duration-300 rounded-xl overflow-hidden border border-border bg-background shadow-inner
                ${previewDevice === 'mobile' ? 'max-w-[280px] p-3' : 'w-full p-4'}
              `}>
                {/* Agent Hub Header Mockup */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                      A1
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-foreground leading-tight">Somchai Trainee</p>
                      <p className="text-[9px] text-muted-foreground">Wave 2026-A · Level 2</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                {/* SubTab Specific Agent Preview Content */}
                {activeSubTab === 'courses' && (
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/20">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                        <BookOpen size={14} />
                        <span>{previewLang === 'th' ? 'โมดูล 1: ความรู้ผลิตภัณฑ์' : 'Module 1: Product Knowledge'}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {previewLang === 'th' 
                          ? 'เรียนรู้จุดเด่น ข้อได้เปรียบ และการวิเคราะห์กลุ่มลูกค้าเป้าหมาย' 
                          : 'Learn key product features, advantages, and target customer profiles.'}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-primary">
                        <span>12 Slides · Voiceover Ready</span>
                        <span className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-md">
                          <Play size={10} /> Start
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'quizzes' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                        <span>Question 1 of 5</span>
                        <span className="text-primary font-extrabold">80% Pass Req</span>
                      </div>
                      <p className="text-xs font-bold text-foreground">
                        {previewLang === 'th' 
                          ? 'ขั้นตอนแรกเมื่อลูกค้ามีข้อโต้แย้งเรื่องราคาคืออะไร?' 
                          : 'What is the first step when a customer raises a price objection?'}
                      </p>
                      <div className="space-y-1.5 pt-1">
                        {['Acknowledge & Clarify Value', 'Immediately Give Discount', 'End Conversation'].map((opt, i) => (
                          <div 
                            key={i} 
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border flex items-center justify-between
                              ${i === 0 ? 'bg-primary/10 border-primary/40 text-primary font-bold' : 'bg-background/80 border-border text-foreground'}
                            `}
                          >
                            <span>{opt}</span>
                            {i === 0 && <Check size={12} className="text-primary" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'scenarios' && (
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-md">
                          AI Call Simulator
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">Turn 1/6</span>
                      </div>
                      <p className="text-xs font-bold text-foreground">Khun Ploy (Price Sensitive Lead)</p>
                      <div className="p-2 rounded-lg bg-background/80 border border-border text-[11px] italic text-muted-foreground">
                        &ldquo;แพ็คเกจนี้ราคาค่อนข้างสูงกว่าที่อื่นนะ มีส่วนลดหรืออะไรที่คุ้มค่ากว่านี้ไหม?&rdquo;
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="text-emerald-500 font-bold">🎯 Win: Highlight ROI</span>
                        <span className="text-rose-500 font-bold">⚠️ Avoid: Cheapening</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'presentation' && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                    <Presentation size={24} className="mx-auto text-amber-500 animate-pulse" />
                    <p className="text-xs font-bold text-foreground">Trainer Presenter HUD Active</p>
                    <p className="text-[10px] text-muted-foreground">Laser pointer, drawing board, speaker notes, and live trainee sync are active.</p>
                  </div>
                )}

                {activeSubTab === 'showcase' && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center space-y-2">
                    <Presentation size={24} className="mx-auto text-purple-500" />
                    <p className="text-xs font-bold text-foreground">Full Presentation Mode Ready</p>
                    <p className="text-[10px] text-muted-foreground">Real-time slide synchronization & drawing board active.</p>
                  </div>
                )}

                {activeSubTab === 'overrides' && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs">
                      <ShieldCheck size={14} />
                      <span>Standard Pass Criteria</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Quiz Pass Score: <b className="text-foreground">80%</b></p>
                    <p className="text-[10px] text-muted-foreground">AI Eval Pass Score: <b className="text-foreground">75%</b></p>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-center text-muted-foreground/70">
                Changes saved in Studio apply immediately to all active agent sessions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
