'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Save, Target, Zap, Loader2, CheckCircle2, AlertCircle, Edit3, Plus, Trash2, BookOpen, FileUp, Download, Upload, HelpCircle, ChevronDown, Database, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage, auth } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithCustomToken } from 'firebase/auth';

type ConfigType = 'quizzes' | 'ai-eval' | 'learn';

export default function AdjustmentsTab() {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<ConfigType>('learn');
  const [configs, setConfigs] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || {});
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
        setTimeout(() => setSaveStatus('idle'), 3000);
        loadConfigs();
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Module Adjustments</h2>
          <p className="text-sm text-muted-foreground">Modify training content, quiz questions, and AI behavior.</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'success' && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> Saved successfully</span>}
          {saveStatus === 'error' && <span className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14} /> Failed to save</span>}
        </div>
      </div>

      <div className="flex p-1 rounded-xl bg-secondary/30 border border-border w-fit overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('learn')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'learn' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <BookOpen size={16} /> Learn Courses
        </button>
        <button onClick={() => setActiveTab('quizzes')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'quizzes' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <Target size={16} /> Quizzes
        </button>
        <button onClick={() => setActiveTab('ai-eval')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'ai-eval' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <Zap size={16} /> AI Eval Prompt
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {activeTab === 'learn' && <LearnEditor data={configs.learn} onSave={(data) => handleSave('learn', data)} onRefresh={loadConfigs} saving={saving} />}
        {activeTab === 'quizzes' && <QuizzesEditor data={configs.quizzes} onSave={(data) => handleSave('quizzes', data)} saving={saving} />}
        {activeTab === 'ai-eval' && <AiEvalEditor data={configs.ai_eval} onSave={(data) => handleSave('ai_eval', data)} saving={saving} />}
      </div>
    </div>
  );
}

// --- Editor Components ---

function QuizzesEditor({ data, onSave, saving }: { data: any, onSave: (d: any) => void, saving: boolean }) {
  const [definitions, setDefinitions] = useState<any>(data?.definitions || {});
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

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
        const parsed = data.map((row: any) => ({
          en: row.question_en || row.en || '',
          th: row.question_th || row.th || '',
          type: row.type || 'mcq',
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
        // Reset file input
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
      const [p1, p2] = field.split('.');
      updated[quizId][p1][p2] = value;
    } else updated[quizId][field] = value;
    setDefinitions(updated);
  };

  const handleUpdateQuizId = (oldId: string, newId: string) => {
    const trimmed = newId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!trimmed || oldId === trimmed || definitions[trimmed]) return;
    const updated = { ...definitions };
    updated[trimmed] = updated[oldId];
    delete updated[oldId];
    setDefinitions(updated);
    setSelectedQuiz(trimmed);
  };

  const handleAddQuiz = () => {
    const newId = `new_quiz_${Date.now()}`;
    setDefinitions({ ...definitions, [newId]: { title: { en: 'New Quiz', th: 'ควิซใหม่' }, passThreshold: 0.7, questions: [] } });
    setSelectedQuiz(newId);
  };

  const handleDeleteQuiz = (id: string) => {
    if (confirm(`Delete quiz ${id}?`)) {
      const updated = { ...definitions };
      delete updated[id];
      setDefinitions(updated);
      if (selectedQuiz === id) setSelectedQuiz(null);
    }
  };

  const toggleQuestionSelection = (idx: number) => setSelectedQuestions(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  const toggleAllQuestions = () => setSelectedQuestions(selectedQuestions.length === definitions[selectedQuiz].questions.length ? [] : definitions[selectedQuiz].questions.map((_: any, i: number) => i));
  const deleteSelectedQuestions = () => {
    if (confirm(`Delete ${selectedQuestions.length} questions?`)) {
      const updated = { ...definitions };
      updated[selectedQuiz].questions = updated[selectedQuiz].questions.filter((_: any, i: number) => !selectedQuestions.includes(i));
      setDefinitions(updated);
      setSelectedQuestions([]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-primary"><Target size={18} /> Quiz Management</h3>
        <div className="flex items-center gap-2">
          <button onClick={handleAddQuiz} className="bg-secondary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16} /> Add Quiz</button>
          <button onClick={() => onSave({ ...data, definitions })} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Save size={16} /> Save Changes</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.keys(definitions).map(id => (
          <div key={id} className={`relative p-4 rounded-2xl border ${selectedQuiz === id ? 'border-primary bg-primary/5' : 'border-border bg-secondary/10'}`}>
            <button onClick={() => { setSelectedQuiz(id); setSelectedQuestions([]); }} className="w-full text-left font-bold text-sm truncate">{definitions[id].title.en}</button>
            <button onClick={() => handleDeleteQuiz(id)} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      {selectedQuiz && definitions[selectedQuiz] && (
        <div className="p-6 rounded-2xl border border-primary/20 bg-card space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <input type="text" defaultValue={selectedQuiz} onBlur={e => handleUpdateQuizId(selectedQuiz, e.target.value)} className="bg-secondary/30 p-3 rounded-xl text-sm" />
            <input type="number" value={Math.round(definitions[selectedQuiz].passThreshold * 100)} onChange={e => handleUpdateQuiz(selectedQuiz, 'passThreshold', parseInt(e.target.value) / 100)} className="bg-secondary/30 p-3 rounded-xl text-sm" />
          </div>
          <div className="flex gap-2">
            <input type="text" value={definitions[selectedQuiz].title.en} onChange={e => handleUpdateQuiz(selectedQuiz, 'title.en', e.target.value)} className="flex-1 bg-secondary/30 p-3 rounded-xl text-sm" />
            <input type="text" value={definitions[selectedQuiz].title.th} onChange={e => handleUpdateQuiz(selectedQuiz, 'title.th', e.target.value)} className="flex-1 bg-secondary/30 p-3 rounded-xl text-sm" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase">Questions ({definitions[selectedQuiz].questions.length})</label>
              <div className="flex gap-2">
                <div className="flex p-0.5 rounded-lg bg-secondary/50 border border-border mr-2">
                  <button onClick={() => setImportMode('replace')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${importMode === 'replace' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>Replace</button>
                  <button onClick={() => setImportMode('append')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${importMode === 'append' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>Append</button>
                </div>
                <button onClick={downloadTemplate} className="text-xs font-bold bg-secondary/80 text-foreground px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors hover:bg-secondary">
                  <Download size={14} /> Template
                </button>
                <button onClick={() => document.getElementById('quiz-excel-import')?.click()} className="text-xs font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors hover:bg-emerald-500/20">
                  <FileUp size={14} /> {importing ? 'Importing...' : 'Excel Import'}
                </button>
                <input type="file" id="quiz-excel-import" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
              </div>
            </div>

            {importError && (
              <p className="text-[10px] font-bold text-red-500 bg-red-500/5 p-2 rounded-lg border border-red-500/20 flex items-center gap-1.5">
                <AlertCircle size={12} /> {importError}
              </p>
            )}

            <div className="flex items-center justify-between py-1 border-b border-border/50">
              <div className="flex items-center gap-4">
                <button onClick={toggleAllQuestions} className="text-[10px] font-bold text-primary hover:underline">
                  {selectedQuestions.length === definitions[selectedQuiz].questions.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedQuestions.length > 0 && (
                  <button onClick={deleteSelectedQuestions} className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1">
                    <Trash2 size={12} /> Delete Selected ({selectedQuestions.length})
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
              {definitions[selectedQuiz].questions.map((q: any, i: number) => (
                <div key={i} className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${selectedQuestions.includes(i) ? 'border-primary bg-primary/5' : 'border-border bg-secondary/10 hover:border-primary/30'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedQuestions.includes(i)} 
                    onChange={() => toggleQuestionSelection(i)}
                    className="mt-1 rounded border-primary text-primary focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-bold truncate">Q{i+1}: {q.en}</p>
                      <button 
                        onClick={() => {
                          if (confirm('Delete this question?')) {
                            const updated = { ...definitions };
                            updated[selectedQuiz].questions = updated[selectedQuiz].questions.filter((_: any, idx: number) => idx !== i);
                            setDefinitions(updated);
                            setSelectedQuestions(prev => prev.filter(idx => idx !== i).map(idx => idx > i ? idx - 1 : idx));
                          }
                        }}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate italic">{q.th}</p>
                  </div>
                </div>
              ))}
              {definitions[selectedQuiz].questions.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-30">
                  <Database size={32} />
                  <p className="text-xs font-bold uppercase">No questions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AiEvalEditor({ data, onSave, saving }: { data: any, onSave: (d: any) => void, saving: boolean }) {
  const [systemPrompt, setSystemPrompt] = useState(data?.systemPrompt || '');
  const [agentGuideline, setAgentGuideline] = useState(data?.agentGuideline || '');

  return (
    <div className="p-6 space-y-8">
      {/* Agent-facing Guideline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2"><BookOpen size={16} /> Agent Guideline</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Shown to agents on the intro screen before they start. Should be human-readable instructions.</p>
          </div>
          <button
            onClick={() => onSave({ ...data, systemPrompt, agentGuideline })}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <textarea
          value={agentGuideline}
          onChange={e => setAgentGuideline(e.target.value)}
          className="w-full h-48 bg-secondary/20 p-4 rounded-xl border text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="Enter human-readable instructions for agents (what to do, how to pass, tips)..."
        />
      </div>

      {/* AI System Prompt */}
      <div className="space-y-4 border-t border-border pt-8">
        <div>
          <h3 className="font-bold flex items-center gap-2"><Zap size={16} /> AI System Prompt</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Internal prompt sent to the AI. Defines the customer persona, JSON schema, and scoring rules. Never shown to agents.</p>
        </div>
        <textarea
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          className="w-full h-[500px] bg-secondary/20 p-4 rounded-xl border font-mono text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="Enter AI system prompt..."
        />
      </div>
    </div>
  );
}

const LEARN_DEFAULT_MODULES: Record<string, any> = {
  product: { id: 'product', title: 'What is Stock?', titleTh: 'หุ้นคืออะไร?', description: 'Fundamentals of stocks.', descriptionTh: 'พื้นฐานของหุ้น', gradient: 'from-blue-600 to-indigo-700', presentations: { th: { presentationId: '', slideUrls: [], totalSlides: 0 }, en: { presentationId: '', slideUrls: [], totalSlides: 0 } } },
  kyc: { id: 'kyc', title: 'KYC', titleTh: 'รู้จักลูกค้า', description: 'KYC process.', descriptionTh: 'กระบวนการ KYC', gradient: 'from-emerald-600 to-teal-700', presentations: { th: { presentationId: '', slideUrls: [], totalSlides: 0 }, en: { presentationId: '', slideUrls: [], totalSlides: 0 } } },
  website: { id: 'website', title: 'Website', titleTh: 'เว็บไซต์', description: 'Platform walkthrough.', descriptionTh: 'แนะนำแพลตฟอร์ม', gradient: 'from-violet-600 to-purple-700', presentations: { th: { presentationId: '', slideUrls: [], totalSlides: 0 }, en: { presentationId: '', slideUrls: [], totalSlides: 0 } } },
};

function LearnEditor({ data, onSave, onRefresh, saving }: { data: any, onSave: (d: any) => void, onRefresh: () => void, saving: boolean }) {
  const [modules, setModules] = useState<any>(data?.modules && Object.keys(data.modules).length > 0 ? data.modules : LEARN_DEFAULT_MODULES);
  const [order, setOrder] = useState<string[]>(data?.order || Object.keys(modules));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({});

  // Synchronize order when modules change (e.g. if a new one is added but not in order yet)
  useEffect(() => {
    const moduleIds = Object.keys(modules);
    const newOrder = [...order];
    let changed = false;

    // Add missing IDs
    moduleIds.forEach(id => {
      if (!newOrder.includes(id)) {
        newOrder.push(id);
        changed = true;
      }
    });

    // Remove deleted IDs
    const filteredOrder = newOrder.filter(id => modules[id]);
    if (filteredOrder.length !== newOrder.length) changed = true;

    if (changed) setOrder(filteredOrder);
  }, [modules, order]);

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
      setModules((prev: any) => ({ ...prev, [moduleId]: { ...prev[moduleId], presentations: { ...prev[moduleId].presentations, [lang]: { ...prev[moduleId].presentations[lang], slideUrls, totalSlides: slideUrls.length } } } }));
      setUploadStatus(prev => ({ ...prev, [key]: 'done' }));
    } catch (err: any) { alert(err.message); setUploadStatus(prev => ({ ...prev, [key]: 'error' })); }
  };

  const handleUpdateModule = (id: string, field: string, value: any) => {
    if (field === 'id') {
      const trimmed = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!trimmed || trimmed === id || modules[trimmed]) return;
      const updated = { ...modules }; updated[trimmed] = { ...updated[id], id: trimmed }; delete updated[id];
      
      // Update order as well
      const newOrder = order.map(o => o === id ? trimmed : o);
      setOrder(newOrder);
      
      setModules(updated); setEditingId(trimmed); return;
    }
    setModules((prev: any) => {
      const mod = { ...prev[id] };
      if (field.includes('.')) {
        const parts = field.split('.');
        let curr = mod;
        for (let i = 0; i < parts.length - 1; i++) {
          curr[parts[i]] = { ...curr[parts[i]] };
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = value;
      } else mod[field] = value;
      return { ...prev, [id]: mod };
    });
  };

  const handleAddModule = () => {
    const id = `module_${Date.now()}`;
    const newModule = { 
      id, 
      title: 'New Course', 
      titleTh: 'คอร์สใหม่', 
      description: 'Course description.', 
      descriptionTh: 'คำอธิบายคอร์ส', 
      gradient: 'from-gray-600 to-slate-700', 
      presentations: { 
        th: { presentationId: '', slideUrls: [], totalSlides: 0 }, 
        en: { presentationId: '', slideUrls: [], totalSlides: 0 } 
      } 
    };
    setModules({ ...modules, [id]: newModule });
    setOrder([...order, id]);
    setEditingId(id);
  };

  const handleDeleteModule = (id: string) => {
    if (confirm(`Delete course ${id}?`)) {
      const updated = { ...modules };
      delete updated[id];
      setModules(updated);
      setOrder(order.filter(o => o !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="font-bold flex items-center gap-2 text-blue-600"><BookOpen size={18} /> Learn Courses</h3>
          <button onClick={handleAddModule} className="bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
            <Plus size={14} /> Add Module
          </button>
        </div>
        <button onClick={() => onSave({ ...data, modules, order })} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Save size={16} /> Save Changes</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {order.map((id, idx) => {
          const mod = modules[id];
          if (!mod) return null;
          return (
            <div key={id} className={`p-4 rounded-2xl border transition-all ${editingId === id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-secondary/10'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase opacity-50 tracking-tighter">{id}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <button 
                      disabled={idx === 0}
                      onClick={(e) => { e.stopPropagation(); moveModule(idx, 'up'); }}
                      className="p-1 rounded bg-black/5 hover:bg-black/10 disabled:opacity-20"
                    >
                      <ChevronDown size={12} className="rotate-180" />
                    </button>
                    <button 
                      disabled={idx === order.length - 1}
                      onClick={(e) => { e.stopPropagation(); moveModule(idx, 'down'); }}
                      className="p-1 rounded bg-black/5 hover:bg-black/10 disabled:opacity-20"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingId(editingId === id ? null : id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDeleteModule(id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 className="font-bold truncate text-sm">{mod.title}</h4>
            </div>
          );
        })}
      </div>
      {editingId && (
        <div className="p-6 rounded-2xl border border-primary/20 bg-card space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase opacity-50 px-1">Title EN</label>
              <input type="text" value={modules[editingId].title} onChange={e => handleUpdateModule(editingId, 'title', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm" placeholder="Title EN" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase opacity-50 px-1">Title TH</label>
              <input type="text" value={modules[editingId].titleTh} onChange={e => handleUpdateModule(editingId, 'titleTh', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm" placeholder="Title TH" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* English Config */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-primary">English Presentation</h5>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 px-1">Storage Slides</label>
                <input type="file" id="up-en" className="hidden" multiple accept="image/*" onChange={e => e.target.files && handleFileUpload(editingId, 'en', e.target.files)} />
                <div className="flex gap-2">
                  <button onClick={() => document.getElementById('up-en')?.click()} className="flex-1 py-4 rounded-xl border border-primary/30 bg-primary/10 text-xs font-bold text-primary flex items-center justify-center gap-2">
                    {uploadStatus[`${editingId}_en`] === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload PNGs
                  </button>
                </div>
                {modules[editingId].presentations.en.slideUrls?.length > 0 && (
                  <div className="space-y-2 px-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-emerald-600 font-bold">{modules[editingId].presentations.en.slideUrls.length} Slides Uploaded</p>
                      <button onClick={() => handleUpdateModule(editingId, 'presentations.en.slideUrls', [])} className="text-[10px] text-red-500 font-bold hover:underline">Clear All</button>
                    </div>
                    <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto p-1 bg-black/5 rounded-lg">
                      {modules[editingId].presentations.en.slideUrls.map((url: string, sIdx: number) => (
                        <div key={sIdx} className="relative group aspect-video bg-black/20 rounded border border-white/10 overflow-hidden">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5">
                            <button 
                              disabled={sIdx === 0}
                              onClick={() => {
                                const urls = [...modules[editingId].presentations.en.slideUrls];
                                [urls[sIdx], urls[sIdx-1]] = [urls[sIdx-1], urls[sIdx]];
                                handleUpdateModule(editingId, 'presentations.en.slideUrls', urls);
                              }}
                              className="p-0.5 bg-white/20 hover:bg-white/40 rounded disabled:opacity-20"
                            >
                              <ChevronDown size={10} className="rotate-180 text-white" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Delete this slide?')) {
                                  const urls = modules[editingId].presentations.en.slideUrls.filter((_: any, i: number) => i !== sIdx);
                                  setModules((prev: any) => {
                                    const mod = { ...prev[editingId] };
                                    mod.presentations = { ...mod.presentations };
                                    mod.presentations.en = { ...mod.presentations.en, slideUrls: urls, totalSlides: urls.length };
                                    return { ...prev, [editingId]: mod };
                                  });
                                }
                              }}
                              className="p-0.5 bg-red-500/40 hover:bg-red-500/60 rounded"
                            >
                              <Trash2 size={10} className="text-white" />
                            </button>
                            <button 
                              disabled={sIdx === modules[editingId].presentations.en.slideUrls.length - 1}
                              onClick={() => {
                                const urls = [...modules[editingId].presentations.en.slideUrls];
                                [urls[sIdx], urls[sIdx+1]] = [urls[sIdx+1], urls[sIdx]];
                                handleUpdateModule(editingId, 'presentations.en.slideUrls', urls);
                              }}
                              className="p-0.5 bg-white/20 hover:bg-white/40 rounded disabled:opacity-20"
                            >
                              <ChevronDown size={10} className="text-white" />
                            </button>
                          </div>
                          <span className="absolute bottom-0 right-0 bg-black/60 text-[8px] text-white px-0.5 font-bold">{sIdx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thai Config */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-primary">Thai Presentation</h5>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 px-1">Storage Slides</label>
                <input type="file" id="up-th" className="hidden" multiple accept="image/*" onChange={e => e.target.files && handleFileUpload(editingId, 'th', e.target.files)} />
                <div className="flex gap-2">
                  <button onClick={() => document.getElementById('up-th')?.click()} className="flex-1 py-4 rounded-xl border border-primary/30 bg-primary/10 text-xs font-bold text-primary flex items-center justify-center gap-2">
                    {uploadStatus[`${editingId}_th`] === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload PNGs
                  </button>
                </div>
                {modules[editingId].presentations.th.slideUrls?.length > 0 && (
                  <div className="space-y-2 px-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-emerald-600 font-bold">{modules[editingId].presentations.th.slideUrls.length} Slides Uploaded</p>
                      <button onClick={() => handleUpdateModule(editingId, 'presentations.th.slideUrls', [])} className="text-[10px] text-red-500 font-bold hover:underline">Clear All</button>
                    </div>
                    <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto p-1 bg-black/5 rounded-lg">
                      {modules[editingId].presentations.th.slideUrls.map((url: string, sIdx: number) => (
                        <div key={sIdx} className="relative group aspect-video bg-black/20 rounded border border-white/10 overflow-hidden">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5">
                            <button 
                              disabled={sIdx === 0}
                              onClick={() => {
                                const urls = [...modules[editingId].presentations.th.slideUrls];
                                [urls[sIdx], urls[sIdx-1]] = [urls[sIdx-1], urls[sIdx]];
                                handleUpdateModule(editingId, 'presentations.th.slideUrls', urls);
                              }}
                              className="p-0.5 bg-white/20 hover:bg-white/40 rounded disabled:opacity-20"
                            >
                              <ChevronDown size={10} className="rotate-180 text-white" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Delete this slide?')) {
                                  const urls = modules[editingId].presentations.th.slideUrls.filter((_: any, i: number) => i !== sIdx);
                                  setModules((prev: any) => {
                                    const mod = { ...prev[editingId] };
                                    mod.presentations = { ...mod.presentations };
                                    mod.presentations.th = { ...mod.presentations.th, slideUrls: urls, totalSlides: urls.length };
                                    return { ...prev, [editingId]: mod };
                                  });
                                }
                              }}
                              className="p-0.5 bg-red-500/40 hover:bg-red-500/60 rounded"
                            >
                              <Trash2 size={10} className="text-white" />
                            </button>
                            <button 
                              disabled={sIdx === modules[editingId].presentations.th.slideUrls.length - 1}
                              onClick={() => {
                                const urls = [...modules[editingId].presentations.th.slideUrls];
                                [urls[sIdx], urls[sIdx+1]] = [urls[sIdx+1], urls[sIdx]];
                                handleUpdateModule(editingId, 'presentations.th.slideUrls', urls);
                              }}
                              className="p-0.5 bg-white/20 hover:bg-white/40 rounded disabled:opacity-20"
                            >
                              <ChevronDown size={10} className="text-white" />
                            </button>
                          </div>
                          <span className="absolute bottom-0 right-0 bg-black/60 text-[8px] text-white px-0.5 font-bold">{sIdx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
