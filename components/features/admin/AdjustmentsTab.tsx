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
        {activeTab === 'learn' && <LearnEditor data={configs.learn} onSave={(data) => handleSave('learn', data)} saving={saving} />}
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
  const [showMagicImport, setShowMagicImport] = useState(false);
  const [showStructuredImport, setShowStructuredImport] = useState(false);
  const [magicMode, setMagicMode] = useState<'replace' | 'append'>('replace');
  const [magicText, setMagicText] = useState('');
  const [magicParsing, setMagicParsing] = useState(false);
  const [magicError, setMagicError] = useState('');

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const handleMagicImport = async () => {
    if (!magicText.trim() || !selectedQuiz) return;
    setMagicParsing(true);
    setMagicError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch('/api/admin/parse-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: magicText }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Parse failed');
      
      if (result.questions && Array.isArray(result.questions)) {
        const updated = { ...definitions };
        const currentQuiz = updated[selectedQuiz];

        if (magicMode === 'append') {
          currentQuiz.questions = [...(currentQuiz.questions || []), ...result.questions];
        } else {
          currentQuiz.questions = result.questions;
          if (result.title) currentQuiz.title = result.title;
          if (result.id) {
            const suggestedId = result.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
            if (suggestedId && suggestedId !== selectedQuiz && !updated[suggestedId]) {
              updated[suggestedId] = { ...currentQuiz };
              delete updated[selectedQuiz];
              setDefinitions(updated);
              setSelectedQuiz(suggestedId);
              setMagicText('');
              setShowMagicImport(false);
              setSelectedQuestions([]);
              return;
            }
          }
        }
        setDefinitions(updated);
        setMagicText('');
        setShowMagicImport(false);
        setSelectedQuestions([]);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setMagicError(err.name === 'AbortError' ? 'Timeout' : err.message);
    } finally {
      setMagicParsing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [{ question_en: "What is Forex?", question_th: "Forex คืออะไร?", type: "mcq", option_1_en: "Foreign Exchange", option_1_th: "การแลกเปลี่ยนเงินตรา", correct_index: 0 }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quiz Template");
    XLSX.writeFile(wb, "quiz_template.xlsx");
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedQuiz) return;
    setImporting(true);
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
          options: { en: [row.option_1_en, row.option_2_en].filter(Boolean), th: [row.option_1_th, row.option_2_th].filter(Boolean) },
          correctIdx: parseInt(row.correct_index || 0),
          explain: { en: row.explanation_en || '', th: row.explanation_th || '' }
        }));
        const updated = { ...definitions };
        updated[selectedQuiz].questions = magicMode === 'append' ? [...(updated[selectedQuiz].questions || []), ...parsed] : parsed;
        setDefinitions(updated);
        setShowStructuredImport(false);
      } catch (err: any) { setImportError(err.message); } finally { setImporting(false); }
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
            <div className="flex justify-between items-center"><label className="text-xs font-bold uppercase">Questions</label><div className="flex gap-2"><button onClick={() => setShowMagicImport(!showMagicImport)} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg">Magic Import</button></div></div>
            {showMagicImport && <div className="p-4 bg-primary/5 rounded-xl space-y-3"><textarea value={magicText} onChange={e => setMagicText(e.target.value)} className="w-full h-32 bg-background p-3 rounded-lg border" /><button onClick={handleMagicImport} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold">Parse</button></div>}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {definitions[selectedQuiz].questions.map((q: any, i: number) => (
                <div key={i} className="p-3 rounded-xl border border-border bg-secondary/10 flex items-start gap-3">
                  <input type="checkbox" checked={selectedQuestions.includes(i)} onChange={() => toggleQuestionSelection(i)} />
                  <p className="text-xs font-bold truncate">Q{i+1}: {q.en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AiEvalEditor({ data, onSave, saving }: { data: any, onSave: (d: any) => void, saving: boolean }) {
  const [prompt, setPrompt] = useState(data?.systemPrompt || '');
  const levels = [1, 2, 3, 4];
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h3 className="font-bold flex items-center gap-2"><Zap size={16} /> AI System Prompt</h3><button onClick={() => onSave({ ...data, systemPrompt: prompt })} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold">Save</button></div>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-96 bg-secondary/20 p-4 rounded-xl border font-mono text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        {levels.map(l => (
          <div key={l} className="space-y-3">
            <h4 className="font-bold text-xs uppercase">Level {l} Context</h4>
            <textarea id={`ai-eval-l${l}`} defaultValue={data?.[`level${l}Prompt`] || ''} onBlur={e => onSave({ ...data, [`level${l}Prompt`]: e.target.value })} className="w-full h-40 bg-secondary/10 p-3 rounded-xl border text-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

const LEARN_DEFAULT_MODULES: Record<string, any> = {
  product: { id: 'product', title: 'What is Stock?', titleTh: 'หุ้นคืออะไร?', description: 'Fundamentals of stocks.', descriptionTh: 'พื้นฐานของหุ้น', gradient: 'from-blue-600 to-indigo-700', presentations: { th: { presentationId: '', slideUrls: [], totalSlides: 0 }, en: { presentationId: '', slideUrls: [], totalSlides: 0 } } },
  kyc: { id: 'kyc', title: 'KYC', titleTh: 'รู้จักลูกค้า', description: 'KYC process.', descriptionTh: 'กระบวนการ KYC', gradient: 'from-emerald-600 to-teal-700', presentations: { th: { presentationId: '', slideUrls: [], totalSlides: 0 }, en: { presentationId: '', slideUrls: [], totalSlides: 0 } } },
  website: { id: 'website', title: 'Website', titleTh: 'เว็บไซต์', description: 'Platform walkthrough.', descriptionTh: 'แนะนำแพลตฟอร์ม', gradient: 'from-violet-600 to-purple-700', presentations: { th: { presentationId: '', slideUrls: [], totalSlides: 0 }, en: { presentationId: '', slideUrls: [], totalSlides: 0 } } },
};

function LearnEditor({ data, onSave, saving }: { data: any, onSave: (d: any) => void, saving: boolean }) {
  const [modules, setModules] = useState<any>(data?.modules && Object.keys(data.modules).length > 0 ? data.modules : LEARN_DEFAULT_MODULES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({});

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center"><h3 className="font-bold flex items-center gap-2 text-blue-600"><BookOpen size={18} /> Learn Courses</h3><button onClick={() => onSave({ ...data, modules })} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Save size={16} /> Save Changes</button></div>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(modules).map(([id, mod]: [string, any]) => (
          <div key={id} className={`p-4 rounded-2xl border ${editingId === id ? 'border-primary bg-primary/5' : 'border-border bg-secondary/10'}`}>
            <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-bold uppercase opacity-50">{id}</span><button onClick={() => setEditingId(editingId === id ? null : id)} className="text-primary"><Edit3 size={16} /></button></div>
            <h4 className="font-bold truncate">{mod.title}</h4>
          </div>
        ))}
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
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50 px-1">Google Slides ID (Optional)</label>
                <input type="text" value={modules[editingId].presentations.en.presentationId || ''} onChange={e => handleUpdateModule(editingId, 'presentations.en.presentationId', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm font-mono" placeholder="Presentation ID" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 px-1">Storage Slides</label>
                <input type="file" id="up-en" className="hidden" multiple accept="image/*" onChange={e => e.target.files && handleFileUpload(editingId, 'en', e.target.files)} />
                <button onClick={() => document.getElementById('up-en')?.click()} className="w-full py-4 rounded-xl border border-primary/30 bg-primary/10 text-xs font-bold text-primary flex items-center justify-center gap-2">
                  {uploadStatus[`${editingId}_en`] === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload Slide PNGs (EN)
                </button>
                {modules[editingId].presentations.en.slideUrls?.length > 0 && (
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] text-emerald-600 font-bold">{modules[editingId].presentations.en.slideUrls.length} Slides Uploaded</p>
                    <button onClick={() => handleUpdateModule(editingId, 'presentations.en.slideUrls', [])} className="text-[10px] text-red-500 font-bold hover:underline">Clear</button>
                  </div>
                )}
              </div>
            </div>

            {/* Thai Config */}
            <div className="space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-primary">Thai Presentation</h5>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50 px-1">Google Slides ID (Optional)</label>
                <input type="text" value={modules[editingId].presentations.th.presentationId || ''} onChange={e => handleUpdateModule(editingId, 'presentations.th.presentationId', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm font-mono" placeholder="Presentation ID" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 px-1">Storage Slides</label>
                <input type="file" id="up-th" className="hidden" multiple accept="image/*" onChange={e => e.target.files && handleFileUpload(editingId, 'th', e.target.files)} />
                <button onClick={() => document.getElementById('up-th')?.click()} className="w-full py-4 rounded-xl border border-primary/30 bg-primary/10 text-xs font-bold text-primary flex items-center justify-center gap-2">
                  {uploadStatus[`${editingId}_th`] === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload Slide PNGs (TH)
                </button>
                {modules[editingId].presentations.th.slideUrls?.length > 0 && (
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] text-emerald-600 font-bold">{modules[editingId].presentations.th.slideUrls.length} Slides Uploaded</p>
                    <button onClick={() => handleUpdateModule(editingId, 'presentations.th.slideUrls', [])} className="text-[10px] text-red-500 font-bold hover:underline">Clear</button>
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
