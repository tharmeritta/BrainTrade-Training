'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Save, RotateCcw, Target, Zap, TrendingUp, Loader2, CheckCircle2, AlertCircle, Edit3, Plus, Trash2, BookOpen, Sparkles, FileUp, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

type ConfigType = 'quizzes' | 'pitch' | 'ai-eval' | 'learn';

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
        <button onClick={() => setActiveTab('pitch')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'pitch' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <TrendingUp size={16} /> Pitch Scenarios
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {activeTab === 'learn' && <LearnEditor data={configs.learn} onSave={(data) => handleSave('learn', data)} saving={saving} />}
        {activeTab === 'quizzes' && <QuizzesEditor data={configs.quizzes} onSave={(data) => handleSave('quizzes', data)} saving={saving} />}
        {activeTab === 'ai-eval' && <AiEvalEditor data={configs.ai_eval} onSave={(data) => handleSave('ai_eval', data)} saving={saving} />}
        {activeTab === 'pitch' && <PitchEditor configs={configs} onSave={handleSave} saving={saving} />}
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
          // Append: add new questions after existing ones
          currentQuiz.questions = [...(currentQuiz.questions || []), ...result.questions];
        } else {
          // Replace: swap all questions, and optionally update title/id
          currentQuiz.questions = result.questions;

          if (result.title) {
            currentQuiz.title = result.title;
          }

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
      setMagicError(err.name === 'AbortError' ? 'Request timed out. Try with shorter text or check your connection.' : err.message);
    } finally {
      setMagicParsing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        question_en: "What is Forex?",
        question_th: "Forex คืออะไร?",
        type: "mcq",
        option_1_en: "Foreign Exchange",
        option_1_th: "การแลกเปลี่ยนเงินตรา",
        option_2_en: "Food Export",
        option_2_th: "การส่งออกอาหาร",
        option_3_en: "Financial Exit",
        option_3_th: "ทางออกทางการเงิน",
        option_4_en: "Forward Extra",
        option_4_th: "สัญญาซื้อขายล่วงหน้า",
        correct_index: 0,
        explanation_en: "Forex stands for Foreign Exchange.",
        explanation_th: "Forex ย่อมาจากการแลกเปลี่ยนเงินตราต่างประเทศ"
      }
    ];

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
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) throw new Error('File is empty');

        const parsedQuestions = data.map((row: any, idx: number) => {
          // Flexible mapping
          const qEn = row.question_en || row.en || row.Question || '';
          const qTh = row.question_th || row.th || row.QuestionTH || '';
          
          if (!qEn && !qTh) return null;

          const optionsEn = [];
          const optionsTh = [];
          
          for (let i = 1; i <= 6; i++) {
            const optEn = row[`option_${i}_en`] || row[`opt_${i}_en`];
            const optTh = row[`option_${i}_th`] || row[`opt_${i}_th`];
            if (optEn !== undefined) optionsEn.push(String(optEn));
            if (optTh !== undefined) optionsTh.push(String(optTh));
          }

          // Fallback if th options are missing or mismatch
          while (optionsTh.length < optionsEn.length) optionsTh.push(optionsEn[optionsTh.length]);

          return {
            en: qEn,
            th: qTh || qEn,
            type: row.type || 'mcq',
            options: {
              en: optionsEn,
              th: optionsTh
            },
            correctIdx: parseInt(row.correct_index ?? row.correctIdx ?? 0),
            explain: {
              en: row.explanation_en || row.explain_en || '',
              th: row.explanation_th || row.explain_th || ''
            }
          };
        }).filter(Boolean);

        const updated = { ...definitions };
        const currentQuiz = updated[selectedQuiz];

        if (magicMode === 'append') {
          currentQuiz.questions = [...(currentQuiz.questions || []), ...parsedQuestions];
        } else {
          currentQuiz.questions = parsedQuestions;
        }

        setDefinitions(updated);
        setShowStructuredImport(false);
        e.target.value = ''; // Reset input
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse file');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleUpdateQuiz = (quizId: string, field: string, value: any) => {
    const updated = { ...definitions };
    if (field.includes('.')) {
      const [p1, p2] = field.split('.');
      updated[quizId][p1][p2] = value;
    } else {
      updated[quizId][field] = value;
    }
    setDefinitions(updated);
  };

  const handleUpdateQuizId = (oldId: string, newId: string) => {
    const trimmedNewId = newId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (oldId === trimmedNewId || !trimmedNewId) return;
    if (definitions[trimmedNewId]) {
      alert('Quiz ID already exists!');
      return;
    }
    const updated = { ...definitions };
    updated[trimmedNewId] = updated[oldId];
    delete updated[oldId];
    setDefinitions(updated);
    setSelectedQuiz(trimmedNewId);
  };

  const handleAddQuiz = () => {
    const newId = `new_quiz_${Date.now()}`;
    const updated = { ...definitions };
    updated[newId] = {
      title: { en: 'New Quiz', th: 'ควิซใหม่' },
      passThreshold: 0.7,
      questions: []
    };
    setDefinitions(updated);
    setSelectedQuiz(newId);
    setSelectedQuestions([]);
  };

  const handleDeleteQuiz = (id: string) => {
    if (confirm(`Are you sure you want to delete quiz "${id}"?`)) {
      const updated = { ...definitions };
      delete updated[id];
      setDefinitions(updated);
      if (selectedQuiz === id) {
        setSelectedQuiz(null);
        setSelectedQuestions([]);
      }
    }
  };

  const toggleQuestionSelection = (idx: number) => {
    setSelectedQuestions(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const toggleAllQuestions = () => {
    if (!selectedQuiz || !definitions[selectedQuiz].questions) return;
    if (selectedQuestions.length === definitions[selectedQuiz].questions.length && definitions[selectedQuiz].questions.length > 0) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(definitions[selectedQuiz].questions.map((_: any, idx: number) => idx));
    }
  };

  const deleteSelectedQuestions = () => {
    if (!selectedQuiz || selectedQuestions.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedQuestions.length} selected question(s)?`)) {
      const updated = { ...definitions };
      updated[selectedQuiz].questions = updated[selectedQuiz].questions.filter((_: any, idx: number) => !selectedQuestions.includes(idx));
      setDefinitions(updated);
      setSelectedQuestions([]);
    }
  };

  const saveAll = () => onSave({ ...data, definitions });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-primary"><Target size={18} /> Quiz Definition Management</h3>
        <div className="flex items-center gap-2">
          <button onClick={handleAddQuiz} disabled={saving} className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-secondary/80 transition-colors disabled:opacity-50">
            <Plus size={16} /> Add Quiz
          </button>
          <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save All Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['foundation', 'product', 'process'].map((id) => {
          const quiz = definitions[id];
          if (!quiz) return null;
          return (
            <div key={id} className={`group relative p-4 rounded-2xl border text-left transition-all ${selectedQuiz === id ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-border bg-secondary/10 hover:border-primary/50'}`}>
              <button onClick={() => { setSelectedQuiz(id); setSelectedQuestions([]); setShowMagicImport(false); }} className="w-full text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">{id}</span>
                <h4 className="font-bold text-sm truncate">{quiz?.title?.en || 'Untitled Quiz'}</h4>
                <p className="text-[10px] text-muted-foreground">{(quiz?.questions?.length || 0)} Questions</p>
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(id); }} className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
        {Object.keys(definitions).filter(id => !['foundation', 'product', 'process'].includes(id)).map((id) => (
          <div key={id} className={`group relative p-4 rounded-2xl border text-left transition-all ${selectedQuiz === id ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-border bg-secondary/10 hover:border-primary/50'}`}>
            <button onClick={() => { setSelectedQuiz(id); setSelectedQuestions([]); setShowMagicImport(false); }} className="w-full text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">{id}</span>
              <h4 className="font-bold text-sm truncate">{definitions[id]?.title?.en || 'Untitled Quiz'}</h4>
              <p className="text-[10px] text-muted-foreground">{(definitions[id]?.questions?.length || 0)} Questions</p>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(id); }} className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedQuiz && definitions[selectedQuiz] && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="p-6 rounded-2xl border border-primary/20 bg-card shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h4 className="font-black text-lg">Editing Quiz: <span className="text-primary">{selectedQuiz}</span></h4>
                  <p className="text-xs text-muted-foreground">Adjust global settings and individual questions below.</p>
                </div>
                <button onClick={() => setSelectedQuiz(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Close Editor</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Category / ID (Unique Key)</label>
                  <input key={selectedQuiz} type="text" defaultValue={selectedQuiz} onBlur={e => handleUpdateQuizId(selectedQuiz, e.target.value)} placeholder="e.g. product_knowledge" className="w-full bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20" title="Click outside to save category ID change" />
                  <p className="text-[10px] text-muted-foreground mt-1">Change and click outside the input to update the ID.</p>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Pass Threshold (Percentage)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="1" min="0" max="100" value={Math.round((definitions[selectedQuiz].passThreshold || 0.7) * 100)} onChange={e => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) val = 0;
                      handleUpdateQuiz(selectedQuiz, 'passThreshold', val / 100);
                    }} className="w-full bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20" />
                    <span className="text-sm font-bold text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Quiz Titles (EN/TH)</label>
                <div className="flex gap-2">
                  <input type="text" value={definitions[selectedQuiz].title.en} onChange={e => handleUpdateQuiz(selectedQuiz, 'title.en', e.target.value)} className="flex-1 bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20" placeholder="English Title" />
                  <input type="text" value={definitions[selectedQuiz].title.th} onChange={e => handleUpdateQuiz(selectedQuiz, 'title.th', e.target.value)} className="flex-1 bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20" placeholder="Thai Title" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Questions ({definitions[selectedQuiz].questions?.length || 0})</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setShowMagicImport(!showMagicImport); setShowStructuredImport(false); }} className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${showMagicImport ? 'bg-primary text-primary-foreground' : 'text-primary hover:text-primary/80 bg-primary/10'}`}>
                      <Sparkles size={14} /> AI Magic Import
                    </button>
                    <button onClick={() => { setShowStructuredImport(!showStructuredImport); setShowMagicImport(false); }} className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${showStructuredImport ? 'bg-primary text-primary-foreground' : 'text-primary hover:text-primary/80 bg-primary/10'}`}>
                      <FileUp size={14} /> Structured Import
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showStructuredImport && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold flex items-center gap-2"><FileUp size={16} className="text-primary" /> Structured Import (CSV/Excel)</h5>
                          <button onClick={() => setShowStructuredImport(false)} className="text-xs text-muted-foreground">Cancel</button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-2">Upload a CSV or Excel file with your quiz data. Use our template for best results.</p>
                            <div className="flex items-center gap-2">
                              <button onClick={downloadTemplate} className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                                <Download size={14} /> Download Template
                              </button>
                            </div>
                          </div>
                          
                          {/* Mode toggle */}
                          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/40 w-fit">
                            <button
                              onClick={() => setMagicMode('replace')}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${magicMode === 'replace' ? 'bg-red-500/20 text-red-400' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                              Replace
                            </button>
                            <button
                              onClick={() => setMagicMode('append')}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${magicMode === 'append' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                              Append
                            </button>
                          </div>
                        </div>

                        <div className="relative group">
                          <input 
                            type="file" 
                            accept=".csv, .xlsx, .xls"
                            onChange={handleFileImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={importing}
                          />
                          <div className="border-2 border-dashed border-border group-hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-background/50 transition-colors">
                            {importing ? (
                              <Loader2 size={24} className="animate-spin text-primary" />
                            ) : (
                              <FileUp size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                            <p className="text-xs font-bold">Click to upload or drag and drop</p>
                            <p className="text-[10px] text-muted-foreground">CSV, XLSX or XLS (max 5MB)</p>
                          </div>
                        </div>

                        {importError && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-2 rounded-lg">{importError}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showMagicImport && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold flex items-center gap-2"><Sparkles size={16} className="text-primary" /> AI Magic Import</h5>
                          <button onClick={() => setShowMagicImport(false)} className="text-xs text-muted-foreground">Cancel</button>
                        </div>

                        {/* Mode toggle */}
                        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/40 w-fit">
                          <button
                            onClick={() => setMagicMode('replace')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${magicMode === 'replace' ? 'bg-red-500/20 text-red-400' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            Replace All
                          </button>
                          <button
                            onClick={() => setMagicMode('append')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${magicMode === 'append' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            Append
                          </button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {magicMode === 'replace'
                            ? <>Paste quiz content below. AI will extract questions and <strong className="text-red-500">replace all existing questions</strong>. Best for 10–15 questions at a time.</>
                            : <>Paste a batch of questions below. AI will extract them and <strong className="text-primary">add to the end</strong> of existing questions. Use this to import in chunks.</>
                          }
                        </p>
                        <textarea value={magicText} onChange={e => setMagicText(e.target.value)} placeholder="e.g. 1. What is Forex? A) Foreign Exchange B) Food Export..." className="w-full h-32 text-xs bg-background p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20" />
                        {magicError && <p className="text-xs text-red-500 font-bold">{magicError}</p>}
                        <div className="flex justify-end">
                          <button onClick={handleMagicImport} disabled={magicParsing || !magicText.trim()} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                            {magicParsing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {magicMode === 'replace' ? 'Parse & Replace' : 'Parse & Append'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {!definitions[selectedQuiz].questions || definitions[selectedQuiz].questions.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">No questions yet. Use AI Magic Import to paste your quiz.</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2 p-2 bg-secondary/30 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedQuestions.length > 0 && selectedQuestions.length === definitions[selectedQuiz].questions.length}
                            onChange={toggleAllQuestions}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-xs font-bold">Select All</span>
                        </label>
                        {selectedQuestions.length > 0 && (
                          <button onClick={deleteSelectedQuestions} className="text-xs font-bold flex items-center gap-1 text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
                            <Trash2 size={14} /> Delete Selected ({selectedQuestions.length})
                          </button>
                        )}
                      </div>
                      {definitions[selectedQuiz].questions.map((q: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border border-border bg-secondary/10 flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            checked={selectedQuestions.includes(idx)}
                            onChange={() => toggleQuestionSelection(idx)}
                            className="mt-1 rounded border-border text-primary focus:ring-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">Q{idx+1}: {q.en}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{q.th}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PitchEditor({ configs, onSave, saving }: { configs: any, onSave: (id: string, d: any) => void, saving: boolean }) {
  const levels = [1, 2, 3];
  return (
    <div className="p-6 space-y-8">
      {levels.map(l => {
        const id = `pitch_l${l}`;
        const config = configs[id] || { prompt: '' };
        return (
          <div key={l} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><TrendingUp size={16} className="text-orange-400" /> Level {l} Prompt</h3>
              <button onClick={() => {
                const prompt = (document.getElementById(`prompt-${id}`) as HTMLTextAreaElement).value;
                onSave(id, { ...config, prompt });
              }} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Level {l}
              </button>
            </div>
            <textarea 
              id={`prompt-${id}`}
              defaultValue={config.prompt}
              className="w-full h-48 text-sm bg-secondary/20 p-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        );
      })}
    </div>
  );
}

function AiEvalEditor({ data, onSave, saving }: { data: any, onSave: (d: any) => void, saving: boolean }) {
  const [prompt, setPrompt] = useState(data?.systemPrompt || '');
  const levels = [1, 2, 3, 4];
  
  return (
    <div className="p-6 space-y-8">
      {/* Global System Prompt */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2"><Zap size={16} className="text-purple-400" /> AI Trainer System Prompt</h3>
          <button onClick={() => onSave({ ...data, systemPrompt: prompt })} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save System Prompt
          </button>
        </div>
        <p className="text-xs text-muted-foreground italic">This global prompt controls the base behavior and JSON output format. Be extremely careful with changes.</p>
        <textarea 
          value={prompt} onChange={e => setPrompt(e.target.value)}
          className="w-full h-96 text-sm bg-secondary/20 p-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
        />
      </div>

      <div className="h-px bg-border" />

      {/* Level Specific Contexts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levels.map(l => {
          const field = `level${l}Prompt`;
          const currentVal = data?.[field] || '';
          return (
            <div key={l} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Level {l} Context</h4>
                <button 
                  onClick={() => {
                    const val = (document.getElementById(`ai-eval-l${l}`) as HTMLTextAreaElement).value;
                    onSave({ ...data, [field]: val });
                  }} 
                  disabled={saving}
                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                </button>
              </div>
              <textarea 
                id={`ai-eval-l${l}`}
                defaultValue={currentVal}
                placeholder={`Specific instructions for Level ${l} persona and objections...`}
                className="w-full h-40 text-sm bg-secondary/10 p-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const LEARN_DEFAULT_MODULES: Record<string, any> = {
  product: {
    id: 'product',
    title: 'What is Stock?',
    titleTh: 'หุ้นคืออะไร?',
    description: 'Learn the fundamentals of stocks, equity, and how the stock market works.',
    descriptionTh: 'เรียนรู้พื้นฐานของหุ้น ส่วนของผู้ถือหุ้น และวิธีการทำงานของตลาดหลักทรัพย์',
    gradient: 'from-blue-600 to-indigo-700',
    presentations: {
      th: { presentationId: '1SNZxAJAZets0wMIGsLSoaVDtV2tTP21i', totalSlides: 16 },
      en: { presentationId: '1U0Vbd0NgJIfKfiTl17Q4c67ytl1GMtY-', totalSlides: 16 },
    },
  },
  kyc: {
    id: 'kyc',
    title: 'Know Your Customer (KYC)',
    titleTh: 'รู้จักลูกค้า (KYC)',
    description: 'Learn the KYC process, customer verification, and compliance requirements for financial services.',
    descriptionTh: 'เรียนรู้กระบวนการ KYC การตรวจสอบตัวตนลูกค้า และข้อกำหนดด้านการปฏิบัติตามกฎระเบียบสำหรับบริการทางการเงิน',
    gradient: 'from-emerald-600 to-teal-700',
    presentations: {
      th: { presentationId: '1DMs0-BZ1dI0KE6HYncMzeNjDUavdPOtA', totalSlides: 11 },
      en: { presentationId: '1SeHjETc4hrYlo4QAQREk5yzjOMznfdxm', totalSlides: 11 },
    },
  },
  website: {
    id: 'website',
    title: 'BrainTrade Website',
    titleTh: 'เว็บไซต์ BrainTrade',
    description: 'A walkthrough of the BrainTrade platform, its features, and how to navigate and use the website effectively.',
    descriptionTh: 'แนะนำแพลตฟอร์ม BrainTrade ฟีเจอร์ต่างๆ และวิธีการใช้งานเว็บไซต์อย่างมีประสิทธิภาพ',
    gradient: 'from-violet-600 to-purple-700',
    presentations: {
      th: { presentationId: '1DZvsOEv_0G4ZLm1hC6JQlxm2EpaLHqk6', totalSlides: 16 },
      en: { presentationId: '1FW-wC8qqlvHyTo8mhliCqoOC0kL7mYXK', totalSlides: 16 },
    },
  },
};

function LearnEditor({ data, onSave, saving }: { data: any, onSave: (d: any) => void, saving: boolean }) {
  const initialModules = data?.modules && Object.keys(data.modules).length > 0
    ? data.modules
    : LEARN_DEFAULT_MODULES;
  const [modules, setModules] = useState<any>(initialModules);
  const [editingId, setEditingId] = useState<string | null>(null);

  const extractPresentationId = (input: string) => {
    try {
      const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : input;
    } catch {
      return input;
    }
  };

  const handleUpdateModule = (id: string, field: string, value: any) => {
    const updated = { ...modules };
    let finalValue = value;
    if (field.endsWith('presentationId')) {
      finalValue = extractPresentationId(value);
    }

    if (field === 'id') {
      const newId = finalValue.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!newId || newId === id) return;
      if (updated[newId]) {
        alert('Module ID already exists!');
        return;
      }
      updated[newId] = { ...updated[id], id: newId };
      delete updated[id];
      setModules(updated);
      setEditingId(newId);
      return;
    }

    if (field.includes('.')) {
      const [p1, p2, p3] = field.split('.');
      if (p3) updated[id][p1][p2][p3] = finalValue;
      else updated[id][p1][p2] = finalValue;
    } else {
      updated[id][field] = finalValue;
    }
    setModules(updated);
  };

  const handleAddModule = () => {
    const newId = `mod_${Date.now()}`;
    setModules({
      ...modules,
      [newId]: {
        id: newId,
        title: 'New Module',
        titleTh: 'โมดูลใหม่',
        description: '',
        descriptionTh: '',
        gradient: 'from-slate-600 to-gray-700',
        presentations: {
          en: { presentationId: '', totalSlides: 1 },
          th: { presentationId: '', totalSlides: 1 }
        }
      }
    });
    setEditingId(newId);
  };

  const handleDeleteModule = (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    const updated = { ...modules };
    delete updated[id];
    setModules(updated);
    if (editingId === id) setEditingId(null);
  };

  const saveAll = () => onSave({ ...data, modules });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-blue-600"><BookOpen size={18} /> Learn Course Management</h3>
        <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save All Changes
        </button>
      </div>

      <div className="flex justify-end">
        <button onClick={handleAddModule} className="flex items-center gap-2 text-sm font-bold bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Add Module
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(modules).map(([id, mod]: [string, any]) => (
          <div key={id} className={`p-4 rounded-2xl border transition-all ${editingId === id ? 'border-primary ring-2 ring-primary/10 bg-primary/5' : 'border-border bg-secondary/10'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{id}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => handleDeleteModule(id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setEditingId(editingId === id ? null : id)} className="p-2 rounded-lg hover:bg-background text-primary transition-colors">
                  <Edit3 size={16} />
                </button>
              </div>
            </div>
            <h4 className="font-bold truncate">{mod.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{mod.titleTh}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editingId && modules[editingId] && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-6 rounded-2xl border border-primary/20 bg-card shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h4 className="font-black text-lg">Editing Module: <span className="text-primary">{editingId}</span></h4>
              <button onClick={() => setEditingId(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Close Editor</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Titles & Descriptions</label>
                <div className="space-y-3">
                  <input type="text" placeholder="Module ID (e.g. kyc)" value={modules[editingId].id || editingId} onChange={e => handleUpdateModule(editingId, 'id', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" placeholder="English Title" value={modules[editingId].title} onChange={e => handleUpdateModule(editingId, 'title', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" placeholder="Thai Title" value={modules[editingId].titleTh} onChange={e => handleUpdateModule(editingId, 'titleTh', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20" />
                  <textarea placeholder="English Description" value={modules[editingId].description} onChange={e => handleUpdateModule(editingId, 'description', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20 h-20" />
                  <textarea placeholder="Thai Description" value={modules[editingId].descriptionTh} onChange={e => handleUpdateModule(editingId, 'descriptionTh', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20 h-20" />
                  <input type="text" placeholder="Gradient Classes (e.g. from-blue-600 to-indigo-700)" value={modules[editingId].gradient || ''} onChange={e => handleUpdateModule(editingId, 'gradient', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Google Slides Config (Link or ID)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground">EN Link or ID</span>
                    <input type="text" placeholder="https://docs.google.com/presentation/d/.../edit" value={modules[editingId].presentations.en.presentationId} onChange={e => handleUpdateModule(editingId, 'presentations.en.presentationId', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-xs border-none focus:ring-2 focus:ring-primary/20" />
                    <input type="number" placeholder="Total Slides" value={modules[editingId].presentations.en.totalSlides} onChange={e => handleUpdateModule(editingId, 'presentations.en.totalSlides', parseInt(e.target.value) || 1)} className="w-full bg-secondary/30 p-3 rounded-xl text-xs border-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground">TH Link or ID</span>
                    <input type="text" placeholder="https://docs.google.com/presentation/d/.../edit" value={modules[editingId].presentations.th.presentationId} onChange={e => handleUpdateModule(editingId, 'presentations.th.presentationId', e.target.value)} className="w-full bg-secondary/30 p-3 rounded-xl text-xs border-none focus:ring-2 focus:ring-primary/20" />
                    <input type="number" placeholder="Total Slides" value={modules[editingId].presentations.th.totalSlides} onChange={e => handleUpdateModule(editingId, 'presentations.th.totalSlides', parseInt(e.target.value) || 1)} className="w-full bg-secondary/30 p-3 rounded-xl text-xs border-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-xs text-blue-400">
                    <strong>Tip:</strong> Paste the full Google Drive URL (e.g., <code>https://docs.google.com/presentation/d/1FW-wC8q.../edit</code>) and it will automatically extract the ID. Make sure the presentation is set to <strong>&quot;Anyone with the link can view&quot;</strong>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
