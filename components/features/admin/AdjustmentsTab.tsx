'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  Save, Target, Zap, Loader2, CheckCircle2, AlertCircle, Edit3, Plus, 
  Trash2, BookOpen, FileUp, Download, Upload, HelpCircle, ChevronDown, 
  Database, Sparkles, Copy, ExternalLink, Eye, Search, FileJson, 
  ArrowUp, ArrowDown, MoveUp, MoveDown, Layers, FileText, ShieldCheck,
  Settings
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage, auth } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithCustomToken } from 'firebase/auth';
import { COURSE_MODULES } from '@/lib/courses';

// --- Types & Interfaces ---

type ConfigType = 'quizzes' | 'ai-eval' | 'learn' | 'features';

interface PresentationInfo {
  slideUrls?: string[];
  presentationId?: string;
  totalSlides: number;
  cacheKey?: string;
}

interface LearnModule {
  id: string;
  title: string;
  titleTh: string;
  description: string;
  descriptionTh: string;
  gradient: string;
  presentations: {
    th: PresentationInfo;
    en: PresentationInfo;
  };
}

interface LearnConfig {
  modules: Record<string, LearnModule>;
  order: string[];
}

interface QuizQuestion {
  en: string;
  th: string;
  type: 'mcq' | 'matching' | 'true-false';
  options: {
    en: string[];
    th: string[];
  };
  correctIdx: number;
  explain: {
    en: string;
    th: string;
  };
}

interface QuizDefinition {
  title: { en: string; th: string };
  passThreshold: number;
  questions: QuizQuestion[];
}

interface QuizzesConfig {
  definitions: Record<string, QuizDefinition>;
  order?: string[];
}

interface AiEvalConfig {
  systemPrompt: string;
  agentGuideline: string;
  passThreshold?: number;
  criteria?: string[];
  provider?: 'openai' | 'gemini';
  [key: string]: any;
}

interface FeaturesConfig {
  allowMockupMode: boolean;
  [key: string]: any;
}

interface ConfigData {
  learn?: LearnConfig;
  quizzes?: QuizzesConfig;
  ai_eval?: AiEvalConfig;
  features?: FeaturesConfig;
}

export default function AdjustmentsTab({ role }: { role: string }) {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<ConfigType>('learn');
  const [configs, setConfigs] = useState<ConfigData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isIT = role === 'it';
  const confirmITAction = useCallback(() => {
    if (!isIT) return true;
    return confirm("Confirm to send this request for administrator approval?");
  }, [isIT]);

  const initialConfigsRef = useRef<ConfigData>({});

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        const fetchedConfigs = data.configs || {};
        setConfigs(fetchedConfigs);
        initialConfigsRef.current = JSON.parse(JSON.stringify(fetchedConfigs));
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Load config error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleSave = async (id: string, data: any) => {
    if (!confirmITAction()) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, data })
      });
      if (res.ok) {
        setSaveStatus('success');
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
        // We don't necessarily need to reload everything, just update the local "initial" state
        const updatedConfigs = { ...configs, [id]: data };
        setConfigs(updatedConfigs);
        initialConfigsRef.current = JSON.parse(JSON.stringify(updatedConfigs));
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const confirmTabChange = (newTab: ConfigType) => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to switch tabs? Your changes will be lost.')) {
        setActiveTab(newTab);
        setHasUnsavedChanges(false);
        // Reset to initial state for that tab if needed, but for now we just switch
      }
    } else {
      setActiveTab(newTab);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="animate-spin text-primary" size={32} />
      <p className="text-sm text-muted-foreground animate-pulse">Loading configurations...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Module Adjustments
            {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes" />}
          </h2>
          <p className="text-sm text-muted-foreground">Modify training content, quiz questions, and AI behavior.</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {saveStatus === 'success' && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"
              >
                <CheckCircle2 size={14} /> Saved successfully
              </motion.span>
            )}
            {saveStatus === 'error' && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20"
              >
                <AlertCircle size={14} /> Failed to save
              </motion.span>
            )}
          </AnimatePresence>
          {hasUnsavedChanges && (
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-1 rounded">Unsaved Changes</span>
          )}
        </div>
      </div>

      <div className="flex p-1 rounded-xl bg-secondary/30 border border-border w-fit overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => confirmTabChange('learn')} 
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'learn' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <BookOpen size={16} /> Learn Courses
        </button>
        <button 
          onClick={() => confirmTabChange('quizzes')} 
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'quizzes' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Target size={16} /> Quizzes
        </button>
        <button 
          onClick={() => confirmTabChange('ai-eval')} 
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'ai-eval' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Zap size={16} /> AI Eval Prompt
        </button>
        <button 
          onClick={() => confirmTabChange('features')} 
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'features' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Settings size={16} /> System
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {activeTab === 'learn' && (
          <LearnEditor 
            data={configs.learn} 
            onSave={(data) => handleSave('learn', data)} 
            onChange={() => setHasUnsavedChanges(true)}
            saving={saving} 
          />
        )}
        {activeTab === 'quizzes' && (
          <QuizzesEditor 
            data={configs.quizzes} 
            onSave={(data) => handleSave('quizzes', data)} 
            onChange={() => setHasUnsavedChanges(true)}
            saving={saving} 
          />
        )}
        {activeTab === 'ai-eval' && (
          <AiEvalEditor 
            data={configs.ai_eval} 
            onSave={(data) => handleSave('ai_eval', data)} 
            onChange={() => setHasUnsavedChanges(true)}
            saving={saving} 
          />
        )}
        {activeTab === 'features' && (
          <SystemEditor 
            data={configs.features} 
            onSave={(data) => handleSave('features', data)} 
            onChange={() => setHasUnsavedChanges(true)}
            saving={saving} 
          />
        )}
      </div>
    </div>
  );
}


// --- Editor Components ---

function QuizzesEditor({ data, onSave, onChange, saving }: { data: QuizzesConfig | undefined, onSave: (d: QuizzesConfig) => void, onChange: () => void, saving: boolean }) {
  const [definitions, setDefinitions] = useState<Record<string, QuizDefinition>>(data?.definitions || {});
  const [order, setOrder] = useState<string[]>(data?.order || Object.keys(definitions));
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Synchronize order when definitions change
  useEffect(() => {
    const quizIds = Object.keys(definitions);
    let changed = false;
    
    const newOrder = [...order];
    quizIds.forEach(id => {
      if (!newOrder.includes(id)) {
        newOrder.push(id);
        changed = true;
      }
    });

    const filteredOrder = newOrder.filter(id => definitions[id]);
    if (filteredOrder.length !== newOrder.length) changed = true;

    if (changed) {
      setOrder(filteredOrder);
    }
  }, [definitions, order]);

  const moveQuiz = (idx: number, direction: 'up' | 'down') => {
    const newOrder = [...order];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    
    [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
    setOrder(newOrder);
    onChange();
  };

  const moveQuestion = (quizId: string, idx: number, direction: 'up' | 'down') => {
    const updated = { ...definitions };
    const questions = [...(updated[quizId].questions || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    [questions[idx], questions[targetIdx]] = [questions[targetIdx], questions[idx]];
    updated[quizId].questions = questions;
    setDefinitions(updated);
    
    // Update selected questions indices if they moved
    setSelectedQuestions(prev => prev.map(sIdx => {
      if (sIdx === idx) return targetIdx;
      if (sIdx === targetIdx) return idx;
      return sIdx;
    }));
    
    onChange();
  };

  const downloadTemplate = () => {
    const template = [{
      question_en: "What is Forex?",
      question_th: "Forex คืออะไร?",
      type: "mcq",
      option_1_en: "Foreign Exchange",
      option_1_th: "การแลกเปลี่ยนเงินตรา",
      option_2_en: "International Bank",
      option_2_th: "ธนาคารระหว่างประเทศ",
      option_3_en: "Stock Market",
      option_3_th: "ตลาดหุ้น",
      option_4_en: "Global Trade",
      option_4_th: "การค้าโลก",
      correct_index: 0,
      explanation_en: "Forex stands for Foreign Exchange.",
      explanation_th: "Forex ย่อมาจาก Foreign Exchange"
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quiz Template");
    XLSX.writeFile(wb, "quiz_template.xlsx");
  };

  const exportToJson = () => {
    const blob = new Blob([JSON.stringify(definitions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizzes_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedQuiz) return;
    setImporting(true);
    setImportError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const parsed: QuizQuestion[] = data.map((row: any) => ({
          en: row.question_en || row.en || '',
          th: row.question_th || row.th || '',
          type: (row.type as any) || 'mcq',
          options: { 
            en: [row.option_1_en, row.option_2_en, row.option_3_en, row.option_4_en].filter(v => v !== undefined && v !== null && v !== ''), 
            th: [row.option_1_th, row.option_2_th, row.option_3_th, row.option_4_th].filter(v => v !== undefined && v !== null && v !== '') 
          },
          correctIdx: parseInt(row.correct_index ?? 0),
          explain: { en: row.explanation_en || row.explain_en || '', th: row.explanation_th || row.explain_th || '' }
        }));
        
        if (parsed.length === 0) throw new Error("No data found in file");

        const updated = { ...definitions };
        updated[selectedQuiz].questions = importMode === 'append' ? [...(updated[selectedQuiz].questions || []), ...parsed] : parsed;
        setDefinitions(updated);
        onChange();
        e.target.value = '';
      } catch (err: any) { 
        setImportError(err.message); 
      } finally { 
        setImporting(false); 
      }
    };
    reader.onerror = () => {
      setImportError("Failed to read file");
      setImporting(false);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpdateQuiz = (quizId: string, field: string, value: any) => {
    const updated = { ...definitions };
    if (field.includes('.')) {
      const parts = field.split('.');
      let curr: any = updated[quizId];
      for (let i = 0; i < parts.length - 1; i++) {
        curr[parts[i]] = { ...curr[parts[i]] };
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = value;
    } else {
      (updated[quizId] as any)[field] = value;
    }
    setDefinitions(updated);
    onChange();
  };

  const handleUpdateQuizId = (oldId: string, newId: string) => {
    const trimmed = newId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!trimmed || oldId === trimmed || definitions[trimmed]) return;
    const updated = { ...definitions };
    updated[trimmed] = updated[oldId];
    delete updated[oldId];
    setDefinitions(updated);
    setSelectedQuiz(trimmed);
    onChange();
  };

  const handleAddQuiz = () => {
    const newId = `new_quiz_${Date.now()}`;
    setDefinitions({ ...definitions, [newId]: { title: { en: 'New Quiz', th: 'ควิซใหม่' }, passThreshold: 0.7, questions: [] } });
    setSelectedQuiz(newId);
    onChange();
  };

  const handleDuplicateQuiz = (id: string) => {
    const newId = `${id}_copy_${Date.now()}`;
    const copy = JSON.parse(JSON.stringify(definitions[id]));
    if (copy.title) {
      copy.title.en = (copy.title.en || '') + ' (Copy)';
      copy.title.th = (copy.title.th || '') + ' (สำเนา)';
    } else {
      copy.title = { en: 'New Quiz (Copy)', th: 'ควิซใหม่ (สำเนา)' };
    }
    setDefinitions({ ...definitions, [newId]: copy });
    setSelectedQuiz(newId);
    onChange();
  };

  const handleDeleteQuiz = (id: string) => {
    const title = definitions[id]?.title?.en || id;
    if (confirm(`Delete quiz "${title}" (${id})?`)) {
      const updated = { ...definitions };
      delete updated[id];
      setDefinitions(updated);
      if (selectedQuiz === id) setSelectedQuiz(null);
      onChange();
    }
  };

  const toggleQuestionSelection = (idx: number) => setSelectedQuestions(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  const toggleAllQuestions = (filteredIndices: number[]) => {
    if (selectedQuestions.length === filteredIndices.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredIndices);
    }
  };

  const deleteSelectedQuestions = () => {
    if (!selectedQuiz) return;
    if (confirm(`Delete ${selectedQuestions.length} questions?`)) {
      const updated = { ...definitions };
      updated[selectedQuiz].questions = (updated[selectedQuiz].questions || []).filter((_, i) => !selectedQuestions.includes(i));
      setDefinitions(updated);
      setSelectedQuestions([]);
      onChange();
    }
  };

  const filteredQuestions = selectedQuiz ? (definitions[selectedQuiz].questions || []).map((q, i) => ({ q, i })).filter(({ q }) => 
    (q?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (q?.th || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="font-bold flex items-center gap-2 text-primary"><Target size={18} /> Quiz Management</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportToJson} className="bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors" title="Export all as JSON">
            <FileJson size={14} /> Export JSON
          </button>
          <button onClick={handleAddQuiz} className="bg-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"><Plus size={14} /> Add Quiz</button>
          <button 
            onClick={() => onSave({ definitions, order })} 
            disabled={saving}
            className="bg-primary text-white px-5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All Quizzes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {order.map((id, idx) => {
          const isSystem = ['foundation', 'product', 'process'].includes(id.toLowerCase());
          return (
            <div key={id} className={`group relative p-4 rounded-xl border transition-all ${selectedQuiz === id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-secondary/10 hover:border-primary/30'}`}>
              <button 
                onClick={() => { setSelectedQuiz(id); setSelectedQuestions([]); setSearchQuery(''); }} 
                className="w-full text-left font-bold text-sm truncate pr-12"
              >
                <div className="flex items-center gap-1.5">
                  {definitions[id]?.title?.en || id}
                  {isSystem && <span title="System Module"><ShieldCheck size={12} className="text-primary" /></span>}
                </div>
                <span className="block text-[10px] font-medium opacity-50 mt-0.5">{id} · {(definitions[id]?.questions || []).length} Qs</span>
              </button>
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  disabled={idx === 0}
                  onClick={() => moveQuiz(idx, 'up')}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  disabled={idx === order.length - 1}
                  onClick={() => moveQuiz(idx, 'down')}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                >
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => handleDuplicateQuiz(id)} className="p-1 text-primary hover:bg-primary/10 rounded" title="Duplicate"><Layers size={14} /></button>
                {!isSystem && (
                  <button onClick={() => handleDeleteQuiz(id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded" title="Delete"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          );
        })}
        {Object.keys(definitions).length === 0 && (
          <div className="col-span-full py-12 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Database size={32} className="opacity-20" />
            <p className="text-sm font-bold">No quizzes defined yet</p>
            <button onClick={handleAddQuiz} className="text-xs text-primary font-bold hover:underline">Create your first quiz</button>
          </div>
        )}
      </div>

      {selectedQuiz && definitions[selectedQuiz] && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-primary/20 bg-card space-y-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm uppercase tracking-wider text-primary flex items-center gap-2">
              <Edit3 size={16} /> Editing: {definitions[selectedQuiz]?.title?.en || selectedQuiz}
            </h4>
            <button onClick={() => setSelectedQuiz(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Close Editor</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50 px-1">Internal ID (No spaces)</label>
              <input 
                type="text" 
                defaultValue={selectedQuiz} 
                onBlur={e => handleUpdateQuizId(selectedQuiz, e.target.value)} 
                className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50 px-1">Pass Threshold (%)</label>
              <input 
                type="number" 
                value={Math.round((definitions[selectedQuiz]?.passThreshold || 0.7) * 100)} 
                onChange={e => handleUpdateQuiz(selectedQuiz, 'passThreshold', parseInt(e.target.value) / 100)} 
                className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
              />
            </div>
            <div className="space-y-1 sm:col-span-1">
               <label className="text-[10px] font-black uppercase opacity-50 px-1 flex items-center gap-1"><Sparkles size={10} /> Quick Actions</label>
               <div className="flex gap-2">
                 <button onClick={downloadTemplate} className="flex-1 py-2.5 rounded-xl border border-border bg-secondary/20 text-[10px] font-black uppercase flex items-center justify-center gap-1.5 hover:bg-secondary/40 transition-all">
                   <Download size={12} /> Template
                 </button>
                 <button onClick={() => document.getElementById('quiz-excel-import')?.click()} className="flex-1 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 text-[10px] font-black uppercase flex items-center justify-center gap-1.5 hover:bg-emerald-500/10 transition-all">
                   <FileUp size={12} /> {importing ? '...' : 'Import'}
                 </button>
                 <input type="file" id="quiz-excel-import" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50 px-1">Display Title EN</label>
              <input type="text" value={definitions[selectedQuiz]?.title?.en || ''} onChange={e => handleUpdateQuiz(selectedQuiz, 'title.en', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase opacity-50 px-1">Display Title TH</label>
              <input type="text" value={definitions[selectedQuiz]?.title?.th || ''} onChange={e => handleUpdateQuiz(selectedQuiz, 'title.th', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-black uppercase tracking-tighter">Questions ({(definitions[selectedQuiz]?.questions || []).length})</label>
                <div className="flex p-0.5 rounded-lg bg-secondary/50 border border-border">
                  <button onClick={() => setImportMode('replace')} className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${importMode === 'replace' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>Replace</button>
                  <button onClick={() => setImportMode('append')} className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${importMode === 'append' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>Append</button>
                </div>
              </div>
              
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search questions..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-secondary/30 pl-9 pr-4 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            {importError && (
              <p className="text-[10px] font-bold text-red-500 bg-red-500/5 p-2 rounded-lg border border-red-500/20 flex items-center gap-1.5">
                <AlertCircle size={12} /> {importError}
              </p>
            )}

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleAllQuestions(filteredQuestions.map(f => f.i))} 
                  className="text-[10px] font-black text-primary hover:underline"
                >
                  {selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0 ? 'Deselect All' : `Select All (${filteredQuestions.length})`}
                </button>
                {selectedQuestions.length > 0 && (
                  <button onClick={deleteSelectedQuestions} className="text-[10px] font-black text-red-500 hover:underline flex items-center gap-1">
                    <Trash2 size={12} /> Delete Selected ({selectedQuestions.length})
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-[10px] font-medium text-muted-foreground">Found {filteredQuestions.length} matches</p>
              )}
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {filteredQuestions.map(({ q, i }) => (
                <div key={i} className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${selectedQuestions.includes(i) ? 'border-primary bg-primary/5' : 'border-border bg-secondary/5 hover:border-primary/20'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedQuestions.includes(i)} 
                    onChange={() => toggleQuestionSelection(i)}
                    className="mt-1 rounded border-border text-primary focus:ring-primary bg-transparent"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            disabled={i === 0}
                            onClick={(e) => { e.stopPropagation(); moveQuestion(selectedQuiz, i, 'up'); }}
                            className="p-0.5 rounded bg-background border border-border hover:bg-secondary disabled:opacity-20"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button 
                            disabled={i === (definitions[selectedQuiz]?.questions || []).length - 1}
                            onClick={(e) => { e.stopPropagation(); moveQuestion(selectedQuiz, i, 'down'); }}
                            className="p-0.5 rounded bg-background border border-border hover:bg-secondary disabled:opacity-20"
                          >
                            <ArrowDown size={10} />
                          </button>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded mr-2">Q{i+1}</span>
                          <span className="text-sm font-bold text-foreground">{q.en}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm('Delete this question?')) {
                            const updated = { ...definitions };
                            updated[selectedQuiz].questions = (updated[selectedQuiz].questions || []).filter((_, idx) => idx !== i);
                            setDefinitions(updated);
                            setSelectedQuestions(prev => prev.filter(idx => idx !== i).map(idx => idx > i ? idx - 1 : idx));
                            onChange();
                          }
                        }}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 pl-11">{q.th}</p>
                    
                    <div className="mt-3 pl-11 grid grid-cols-2 gap-2">
                      {(q.options?.en || []).map((opt, optIdx) => (
                        <div key={optIdx} className={`text-[10px] p-2 rounded-lg border ${optIdx === q.correctIdx ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 font-bold' : 'bg-secondary/20 border-border text-muted-foreground'}`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                    
                    {(q.explain?.en || q.explain?.th) && (
                      <div className="mt-3 pl-11">
                         <div className="bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-lg">
                           <p className="text-[9px] font-black text-blue-600 uppercase mb-1 flex items-center gap-1"><HelpCircle size={10} /> Explanation</p>
                           {q.explain?.en && <p className="text-[10px] text-blue-800/70 italic leading-relaxed">{q.explain.en}</p>}
                           {q.explain?.th && <p className="text-[10px] text-blue-800/50 mt-1">{q.explain.th}</p>}
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredQuestions.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center gap-3 opacity-20 border-2 border-dashed border-border rounded-2xl">
                  {searchQuery ? <Search size={40} /> : <Database size={40} />}
                  <p className="text-xs font-black uppercase tracking-widest">{searchQuery ? 'No matching questions' : 'No questions yet'}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}


function AiEvalEditor({ data, onSave, onChange, saving }: { data: AiEvalConfig | undefined, onSave: (d: AiEvalConfig) => void, onChange: () => void, saving: boolean }) {
  const [systemPrompt, setSystemPrompt] = useState(data?.systemPrompt || '');
  const [agentGuideline, setAgentGuideline] = useState(data?.agentGuideline || '');
  const [passThreshold, setPassThreshold] = useState(data?.passThreshold ?? 7);
  const [criteria, setCriteria] = useState<string[]>(data?.criteria || ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness']);
  const [provider, setProvider] = useState<'openai' | 'gemini'>(
    (data?.provider === 'gemini' || data?.provider === 'openai') ? data.provider : 'openai'
  );
  const [previewMode, setPreviewMode] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const handleUpdate = (type: 'prompt' | 'guideline' | 'threshold' | 'criteria' | 'provider', val: any) => {
    if (type === 'prompt') setSystemPrompt(val);
    else if (type === 'guideline') setAgentGuideline(val);
    else if (type === 'threshold') setPassThreshold(val);
    else if (type === 'criteria') setCriteria(val);
    else if (type === 'provider') setProvider(val);
    onChange();
  };

  return (
    <div className="p-6 space-y-8">
      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-4 border-b border-border">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase opacity-50 px-1">AI Provider</label>
          <select 
            value={provider} 
            onChange={e => handleUpdate('provider', e.target.value)}
            className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
          >
            <option value="openai">OpenAI (GPT-4o mini)</option>
            <option value="gemini">Google Gemini (1.5 Flash)</option>
          </select>
          <p className="text-[9px] text-muted-foreground italic px-1">Choose which AI engine powers the evaluation. System will fallback to Gemini if OpenAI key is missing.</p>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase opacity-50 px-1">Pass Threshold (Score 1-10)</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="0.5"
              value={passThreshold} 
              onChange={e => handleUpdate('threshold', Number(e.target.value))} 
              className="flex-1 accent-primary" 
            />
            <span className="w-12 text-center font-black text-sm bg-primary/10 text-primary py-1 rounded-lg border border-primary/20">{passThreshold}</span>
          </div>
          <p className="text-[9px] text-muted-foreground italic px-1">Agents must average this score across all criteria to pass.</p>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase opacity-50 px-1">Evaluation Criteria (Keys)</label>
          <input 
            type="text" 
            value={criteria.join(', ')} 
            onChange={e => handleUpdate('criteria', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
            className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono" 
            placeholder="rapport, closing, credibility..."
          />
          <p className="text-[9px] text-muted-foreground italic px-1">Comma-separated keys. Must match keys used in the System Prompt JSON schema.</p>
        </div>
      </div>

      {/* Agent-facing Guideline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2"><BookOpen size={16} /> Agent Guideline</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mt-1">Shown to agents on the intro screen before they start. Use line breaks for formatting.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPreviewMode(!previewMode)} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${previewMode ? 'bg-primary text-white' : 'bg-secondary text-foreground'}`}
            >
              {previewMode ? <Edit3 size={14} /> : <Eye size={14} />} {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => onSave({ ...data, systemPrompt, agentGuideline, passThreshold, criteria, provider })}
              className="bg-primary text-white px-5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2"
              disabled={saving}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
            </button>
          </div>
        </div>

        <div className="relative">
          {previewMode ? (
            <div className="w-full min-h-48 bg-secondary/10 p-6 rounded-xl border border-dashed border-border whitespace-pre-wrap text-sm leading-relaxed text-foreground font-medium">
              {agentGuideline || <span className="opacity-30 italic">No guideline content yet...</span>}
            </div>
          ) : (
            <>
              <textarea
                value={agentGuideline}
                onChange={e => handleUpdate('guideline', e.target.value)}
                className="w-full h-48 bg-secondary/20 p-4 rounded-xl border text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="Enter human-readable instructions for agents (what to do, how to pass, tips)..."
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-black text-muted-foreground bg-background/80 px-2 py-1 rounded border border-border backdrop-blur-sm">
                {agentGuideline.length} characters
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI System Prompt */}
      <div className="space-y-4 border-t border-border pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2"><Zap size={16} /> AI System Prompt</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mt-1">Internal prompt sent to the AI. Defines the customer persona and JSON schema.</p>
          </div>
          <button 
            onClick={() => copyToClipboard(systemPrompt)}
            className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Copy size={14} /> Copy Prompt
          </button>
        </div>
        <div className="relative group">
          <textarea
            value={systemPrompt}
            onChange={e => handleUpdate('prompt', e.target.value)}
            className="w-full h-[600px] bg-slate-900 text-slate-300 p-6 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-primary/20 transition-all outline-none scrollbar-hide"
            placeholder="Enter AI system prompt..."
          />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">MONO EDITOR</span>
          </div>
        </div>
      </div>
    </div>
  );
}


function LearnEditor({ data, onSave, onChange, saving }: { data: LearnConfig | undefined, onSave: (d: LearnConfig) => void, onChange: () => void, saving: boolean }) {
  // Merge baseline from lib/courses.ts with data from Firestore
  const initialModules = useMemo(() => {
    const baseline = { ...COURSE_MODULES } as unknown as Record<string, LearnModule>;
    if (data?.modules) {
      Object.keys(data.modules).forEach(id => {
        baseline[id] = data.modules[id];
      });
    }
    return baseline;
  }, [data?.modules]);

  const [modules, setModules] = useState<Record<string, LearnModule>>(initialModules);
  const [order, setOrder] = useState<string[]>(data?.order || Object.keys(modules));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({});

  // Sync state when initialModules change (e.g. after save or fetch)
  useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  const ensureFirebaseSession = async () => {
    if (auth.currentUser) return;
    try {
      const res = await fetch('/api/auth/firebase-token');
      const { firebaseToken } = await res.json();
      if (firebaseToken) {
        await signInWithCustomToken(auth, firebaseToken);
      }
    } catch (err) {
      console.error('Failed to re-sync Firebase session:', err);
    }
  };

  const moveModule = (idx: number, direction: 'up' | 'down') => {
    const newOrder = [...order];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    
    [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
    setOrder(newOrder);
    onChange();
  };

  const handleFileUpload = async (moduleId: string, lang: 'en' | 'th', files: FileList) => {
    const key = `${moduleId}_${lang}`;
    setUploadStatus(prev => ({ ...prev, [key]: 'loading' }));
    try {
      await ensureFirebaseSession();
      const sorted = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      const slideUrls: string[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const filePath = `slides/${moduleId}/${lang}/${i + 1}.png`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, sorted[i]);
        slideUrls.push(await getDownloadURL(storageRef));
      }
      
      setModules((prev) => {
        const updated = { ...prev };
        updated[moduleId] = { 
          ...updated[moduleId], 
          presentations: { 
            ...updated[moduleId].presentations, 
            [lang]: { ...updated[moduleId].presentations[lang], slideUrls, totalSlides: slideUrls.length } 
          } 
        };
        return updated;
      });
      
      setUploadStatus(prev => ({ ...prev, [key]: 'done' }));
      onChange();
    } catch (err: any) { 
      alert(err.message); 
      setUploadStatus(prev => ({ ...prev, [key]: 'error' })); 
    }
  };

  const handleUpdateModule = (id: string, field: string, value: any) => {
    if (field === 'id') {
      const trimmed = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!trimmed || trimmed === id || modules[trimmed]) return;
      
      if (!confirm(`Warning: Changing the ID will not move existing slides in Storage. You should re-upload slides after changing the ID. Continue?`)) return;

      const updated = { ...modules }; 
      updated[trimmed] = { ...updated[id], id: trimmed }; 
      delete updated[id];
      
      const newOrder = order.map(o => o === id ? trimmed : o);
      setOrder(newOrder);
      setModules(updated); 
      setEditingId(trimmed); 
      onChange();
      return;
    }

    setModules((prev) => {
      const updated = { ...prev };
      const mod = { ...updated[id] };
      if (field.includes('.')) {
        const parts = field.split('.');
        let curr: any = mod;
        for (let i = 0; i < parts.length - 1; i++) {
          curr[parts[i]] = { ...curr[parts[i]] };
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = value;
      } else {
        (mod as any)[field] = value;
      }
      updated[id] = mod;
      return updated;
    });
    onChange();
  };

  const handleAddModule = () => {
    const id = `module_${Date.now()}`;
    const newModule: LearnModule = { 
      id, 
      title: 'New Course', 
      titleTh: 'คอร์สใหม่', 
      description: 'Course description.', 
      descriptionTh: 'คำอธิบายคอร์ส', 
      gradient: 'from-gray-600 to-slate-700', 
      presentations: { 
        th: { slideUrls: [], totalSlides: 0 }, 
        en: { slideUrls: [], totalSlides: 0 } 
      } 
    };
    setModules({ ...modules, [id]: newModule });
    setOrder([...order, id]);
    setEditingId(id);
    onChange();
  };

  const handleDeleteModule = (id: string) => {
    if (confirm(`Delete course "${modules[id].title}" (${id})?`)) {
      const updated = { ...modules };
      delete updated[id];
      setModules(updated);
      setOrder(order.filter(o => o !== id));
      if (editingId === id) setEditingId(null);
      onChange();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-bold flex items-center gap-2 text-blue-600"><BookOpen size={18} /> Learn Courses</h3>
          <button onClick={handleAddModule} className="bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
            <Plus size={14} /> Add Module
          </button>
        </div>
        <button 
          onClick={() => onSave({ modules, order })} 
          disabled={saving}
          className="bg-primary text-white px-5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Learn Config
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {order.map((id, idx) => {
          const mod = modules[id];
          if (!mod) return null;
          const slideCount = (mod.presentations?.en?.slideUrls?.length || 0) + (mod.presentations?.th?.slideUrls?.length || 0);
          return (
            <div key={id} className={`group p-4 rounded-xl border transition-all ${editingId === id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-secondary/10 hover:border-primary/30'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-40 tracking-tight">{id}</span>
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      disabled={idx === 0}
                      onClick={() => moveModule(idx, 'up')}
                      className="p-1 rounded bg-background/50 hover:bg-background border border-border disabled:opacity-20"
                    >
                      <ArrowUp size={10} />
                    </button>
                    <button 
                      disabled={idx === order.length - 1}
                      onClick={() => moveModule(idx, 'down')}
                      className="p-1 rounded bg-background/50 hover:bg-background border border-border disabled:opacity-20"
                    >
                      <ArrowDown size={10} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingId(editingId === id ? null : id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDeleteModule(id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 className="font-bold truncate text-sm mb-1">{mod.title || 'Untitled'}</h4>
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                   <FileText size={10} /> {(mod.presentations?.en?.slideUrls?.length || 0) + (mod.presentations?.th?.slideUrls?.length || 0)} Uploaded Slides
                 </div>
                 {(mod.presentations?.en?.presentationId || mod.presentations?.th?.presentationId) && (
                   <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                     <ExternalLink size={10} /> Has Google Slides
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {editingId && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-primary/20 bg-card space-y-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm uppercase tracking-wider text-primary flex items-center gap-2">
              <Edit3 size={16} /> Editing Module: {editingId}
            </h4>
            <button onClick={() => setEditingId(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Close Editor</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-50 px-1">Internal ID (Affects storage path)</label>
                <input type="text" value={modules[editingId].id} onBlur={e => handleUpdateModule(editingId, 'id', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50 px-1">Title EN</label>
                  <input type="text" value={modules[editingId].title} onChange={e => handleUpdateModule(editingId, 'title', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Title EN" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50 px-1">Title TH</label>
                  <input type="text" value={modules[editingId].titleTh} onChange={e => handleUpdateModule(editingId, 'titleTh', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Title TH" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50 px-1">Description EN</label>
                  <textarea value={modules[editingId].description} onChange={e => handleUpdateModule(editingId, 'description', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm h-20 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" placeholder="Description EN" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-50 px-1">Description TH</label>
                  <textarea value={modules[editingId].descriptionTh} onChange={e => handleUpdateModule(editingId, 'descriptionTh', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm h-20 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" placeholder="Description TH" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-50 px-1">Visual Gradient (Tailwind classes)</label>
                <input type="text" value={modules[editingId].gradient} onChange={e => handleUpdateModule(editingId, 'gradient', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. from-blue-600 to-indigo-700" />
                <div className={`mt-2 h-4 w-full rounded-full bg-gradient-to-r ${modules[editingId].gradient}`} />
              </div>
            </div>

            <div className="space-y-6">
              {['en', 'th'].map((lang) => {
                const pres = modules[editingId].presentations[lang as 'en' | 'th'];
                const hasUploaded = (pres?.slideUrls?.length || 0) > 0;
                
                return (
                  <div key={lang} className="space-y-4 p-5 rounded-2xl bg-secondary/10 border border-border">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black uppercase tracking-widest text-primary">{lang === 'en' ? 'English' : 'Thai'} Presentation</h5>
                      {uploadStatus[`${editingId}_${lang}`] === 'loading' && <Loader2 size={14} className="animate-spin text-primary" />}
                    </div>

                    {/* Google Slides Integration */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase opacity-60">Google Slides Integration</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase opacity-40 px-1">Presentation ID</label>
                          <input 
                            type="text" 
                            value={pres?.presentationId || ''} 
                            onChange={e => handleUpdateModule(editingId, `presentations.${lang}.presentationId`, e.target.value)} 
                            className="w-full bg-background/50 border border-border p-2 rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary/30 outline-none transition-all" 
                            placeholder="e.g. 1SNZxAJAZets0w..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase opacity-40 px-1">Total Slides</label>
                          <input 
                            type="number" 
                            value={pres?.totalSlides || 0} 
                            onChange={e => handleUpdateModule(editingId, `presentations.${lang}.totalSlides`, parseInt(e.target.value) || 0)} 
                            className="w-full bg-background/50 border border-border p-2 rounded-lg text-xs focus:ring-1 focus:ring-primary/30 outline-none transition-all" 
                          />
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground px-1 italic">
                        If Presentation ID is set, it will be used instead of uploaded slides.
                      </p>
                    </div>

                    <div className="relative h-px bg-border my-2">
                       <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary/10 px-2 text-[9px] font-black opacity-30">OR</span>
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Upload size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase opacity-60">Manual Slide Upload (PNG)</span>
                      </div>
                      <div className="flex gap-2">
                        <input type="file" id={`up-${lang}`} className="hidden" multiple accept="image/*" onChange={e => e.target.files && handleFileUpload(editingId, lang as any, e.target.files)} />
                        <button onClick={() => document.getElementById(`up-${lang}`)?.click()} className="flex-1 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-[10px] font-black uppercase text-primary flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
                          <Upload size={14} /> {hasUploaded ? 'Re-upload' : 'Upload PNGs'}
                        </button>
                      </div>

                      {hasUploaded ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
                              {pres.slideUrls!.length} Slides Uploaded
                            </p>
                            <button 
                              onClick={() => {
                                 if (confirm('Clear all uploaded slides?')) {
                                   handleUpdateModule(editingId, `presentations.${lang}.slideUrls`, []);
                                   if (!pres.presentationId) handleUpdateModule(editingId, `presentations.${lang}.totalSlides`, 0);
                                 }
                              }} 
                              className="text-[10px] text-red-500 font-bold hover:underline"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-40 overflow-y-auto p-2 bg-black/5 rounded-xl scrollbar-hide">
                            {pres.slideUrls!.map((url: string, sIdx: number) => (
                              <div key={sIdx} className="relative group aspect-video bg-black/20 rounded-lg border border-white/10 overflow-hidden shadow-sm">
                                <Image src={url} fill className="object-cover" alt="" unoptimized />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 z-10">
                                  <button 
                                    disabled={sIdx === 0}
                                    onClick={() => {
                                      const urls = [...pres.slideUrls!];
                                      [urls[sIdx], urls[sIdx-1]] = [urls[sIdx-1], urls[sIdx]];
                                      handleUpdateModule(editingId, `presentations.${lang}.slideUrls`, urls);
                                    }}
                                    className="p-1 bg-white/20 hover:bg-white/40 rounded-md disabled:opacity-20"
                                  >
                                    <ArrowUp size={10} className="text-white -rotate-90" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm('Delete this slide?')) {
                                        const urls = pres.slideUrls!.filter((_: any, i: number) => i !== sIdx);
                                        handleUpdateModule(editingId, `presentations.${lang}.slideUrls`, urls);
                                        if (!pres.presentationId) handleUpdateModule(editingId, `presentations.${lang}.totalSlides`, urls.length);
                                      }
                                    }}
                                    className="p-1 bg-red-500/40 hover:bg-red-500/60 rounded-md"
                                  >
                                    <Trash2 size={10} className="text-white" />
                                  </button>
                                </div>
                                <span className="absolute bottom-0.5 right-1 bg-black/60 text-[8px] text-white px-1 rounded-sm font-black">{sIdx + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 border border-dashed border-border rounded-xl flex flex-col items-center justify-center opacity-30 gap-1">
                          <Layers size={16} />
                          <p className="text-[9px] font-black uppercase">No slides uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SystemEditor({ data, onSave, onChange, saving }: { data: FeaturesConfig | undefined, onSave: (d: FeaturesConfig) => void, onChange: () => void, saving: boolean }) {
  const [config, setConfig] = useState<FeaturesConfig>(data || { allowMockupMode: true });

  const handleToggle = (key: keyof FeaturesConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    onChange();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold flex items-center gap-2 text-primary"><Settings size={18} /> Global Features</h3>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mt-1">Enable or disable core platform functionalities.</p>
        </div>
        <button
          onClick={() => onSave(config)}
          className="bg-primary text-white px-5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
          disabled={saving}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-secondary/5 flex items-center justify-between group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${config.allowMockupMode ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-secondary text-muted-foreground border border-border'}`}>
              <Eye size={24} />
            </div>
            <div>
              <p className="text-sm font-bold">Mockup Agent Mode</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight max-w-[200px] leading-tight mt-0.5">Allows guests to try the agent dashboard via &quot;Demo&quot; button</p>
            </div>
          </div>
          <button 
            onClick={() => handleToggle('allowMockupMode')}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 outline-none ${config.allowMockupMode ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${config.allowMockupMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

