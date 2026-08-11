'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Plus, Save, Loader2, FileJson, ArrowUp, ArrowDown, 
  Layers, Trash2, Edit3, Database, ShieldCheck, Search, 
  Download, FileUp, AlertCircle, HelpCircle 
} from 'lucide-react';
import { EditorHeader, FormField, EmptyState } from './SharedUI';
import { updateDeep } from '@/lib/hooks/useConfigEditor';

interface QuizQuestion {
  en: string;
  th: string;
  type: 'mcq' | 'matching' | 'true-false';
  options: { en: string[]; th: string[] };
  correctIdx: number;
  explain: { en: string; th: string };
}

interface QuizDefinition {
  title: { en: string; th: string };
  passThreshold: number;
  questions: QuizQuestion[];
  required?: boolean;
}

interface QuizzesConfig {
  definitions: Record<string, QuizDefinition>;
  order?: string[];
}

export default function QuizzesEditor({ data, onSave, onChange, saving, readOnly }: { data: QuizzesConfig | undefined, onSave: (d: QuizzesConfig) => void, onChange: () => void, saving: boolean, readOnly?: boolean }) {
  const [definitions, setDefinitions] = useState<Record<string, QuizDefinition>>(data?.definitions || {});
  const [order, setOrder] = useState<string[]>(data?.order || Object.keys(definitions));
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    const quizIds = Object.keys(definitions);
    const newOrder = [...order];
    let changed = false;
    quizIds.forEach(id => { if (!newOrder.includes(id)) { newOrder.push(id); changed = true; } });
    const filtered = newOrder.filter(id => definitions[id]);
    if (filtered.length !== newOrder.length) changed = true;
    if (changed) setOrder(filtered);
  }, [definitions, order]);

  const handleUpdate = (quizId: string, path: string, val: any) => {
    if (path === 'id') {
      const trimmed = val.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!trimmed || trimmed === quizId || definitions[trimmed]) return;
      const updated: Record<string, QuizDefinition> = { ...definitions, [trimmed]: definitions[quizId] };
      delete updated[quizId];
      setDefinitions(updated);
      setSelectedQuiz(trimmed);
      onChange();
      return;
    }
    setDefinitions(prev => updateDeep(prev, `${quizId}.${path}`, val));
    onChange();
  };

  const downloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet([{ question_en: "Q?", question_th: "Q?", type: "mcq", option_1_en: "A", option_1_th: "A", correct_index: 0, explanation_en: "E", explanation_th: "E" }]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "quiz_template.xlsx");
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !selectedQuiz) return;
    setImporting(true); setImportError('');
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = XLSX.utils.sheet_to_json(XLSX.read(evt.target?.result, { type: 'binary' }).Sheets[XLSX.read(evt.target?.result, { type: 'binary' }).SheetNames[0]]);
          const parsed: QuizQuestion[] = data.map((row: any) => {
            const rawIdx = parseInt(row.correct_index, 10);
            const correctIdx = Number.isNaN(rawIdx) ? 0 : Math.max(0, rawIdx);
            return {
              en: row.question_en || '',
              th: row.question_th || '',
              type: (row.type as any) || 'mcq',
              options: {
                en: [row.option_1_en, row.option_2_en, row.option_3_en, row.option_4_en].filter((x): x is string => typeof x === 'string' && x.trim().length > 0),
                th: [row.option_1_th, row.option_2_th, row.option_3_th, row.option_4_th].filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
              },
              correctIdx,
              explain: { en: row.explanation_en || '', th: row.explanation_th || '' }
            };
          });
          setDefinitions(prev => updateDeep(prev, `${selectedQuiz}.questions`, importMode === 'append' ? [...(prev[selectedQuiz].questions || []), ...parsed] : parsed));
          onChange();
        } catch (err: any) { setImportError(err.message); } finally { setImporting(false); }
      };
      reader.readAsBinaryString(file);
    } catch (err: any) { setImportError(err.message); setImporting(false); }
  };

  const filteredQuestions = selectedQuiz ? (definitions[selectedQuiz].questions || []).map((q, i) => ({ q, i })).filter(({ q }) => 
    (q?.en || '').toLowerCase().includes(searchQuery.toLowerCase()) || (q?.th || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="p-6 space-y-6">
      <EditorHeader title="Quiz Management" icon={Target} onSave={() => onSave({ definitions, order })} saving={saving} saveLabel="Save All Quizzes">
        <button onClick={() => {
           const id = `new_quiz_${Date.now()}`;
           setDefinitions({ ...definitions, [id]: { title: { en: 'New Quiz', th: 'ควิซใหม่' }, passThreshold: 0.7, questions: [] } });
           setSelectedQuiz(id); onChange();
        }} className="bg-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"><Plus size={14} /> Add Quiz</button>
      </EditorHeader>

      {/* Admin live sync notice banner */}
      <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-3 text-xs text-foreground">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-primary shrink-0" />
          <span><strong>Live Agent Synchronization:</strong> Changes saved here directly reflect on the Agent Quiz page (<code className="font-mono bg-background px-1.5 py-0.5 rounded text-primary">/quiz</code>) and within course modules.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {order.map((id, idx) => {
          const isRequired = definitions[id]?.required;
          const section = (definitions[id] as any)?.section || 'sales';
          return (
            <div key={id} className={`group relative p-4 rounded-xl border transition-all ${selectedQuiz === id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-secondary/10 hover:border-primary/30'}`}>
              <button onClick={() => { setSelectedQuiz(id); setSelectedQuestions([]); setSearchQuery(''); }} className="w-full text-left font-bold text-sm truncate pr-12">
                <div className="flex items-center gap-1.5">{definitions[id]?.title?.en || id} {isRequired && <ShieldCheck size={12} className="text-primary" />}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{id}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{(definitions[id]?.questions || []).length} Qs</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">{section}</span>
                </div>
              </button>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => { const n = [...order]; [n[idx], n[idx-1]] = [n[idx-1], n[idx]]; setOrder(n); onChange(); }} disabled={idx===0} className="p-1 disabled:opacity-20"><ArrowUp size={14} /></button>
                 <button onClick={() => { const n = [...order]; [n[idx], n[idx+1]] = [n[idx+1], n[idx]]; setOrder(n); onChange(); }} disabled={idx===order.length-1} className="p-1 disabled:opacity-20"><ArrowDown size={14} /></button>
                 {!isRequired && <button onClick={() => { if (window.confirm('Delete?')) { const d = {...definitions}; delete d[id]; setDefinitions(d); if(selectedQuiz===id)setSelectedQuiz(null); onChange(); }}} className="p-1 text-red-500"><Trash2 size={14} /></button>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedQuiz && definitions[selectedQuiz] && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-primary/20 bg-card space-y-6 shadow-sm">
          <div className="flex justify-between border-b border-border pb-4">
            <h4 className="font-black text-sm uppercase text-primary flex items-center gap-2"><Edit3 size={16} /> Editing: {selectedQuiz}</h4>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="text-[10px] font-black uppercase opacity-50">Required for Graduation</div>
                <input 
                  type="checkbox" 
                  checked={!!definitions[selectedQuiz].required} 
                  onChange={e => handleUpdate(selectedQuiz, 'required', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
              </label>
              <button onClick={() => setSelectedQuiz(null)} className="text-xs font-bold text-muted-foreground">Close</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField id="q-id" label="Internal ID"><input id="q-id" defaultValue={selectedQuiz} onBlur={e => handleUpdate(selectedQuiz, 'id', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm font-mono outline-none" /></FormField>
            <FormField id="q-pass" label="Pass Threshold (%)">
              <input
                id="q-pass"
                type="number"
                min="0"
                max="100"
                value={Math.round((definitions[selectedQuiz].passThreshold ?? 0.7) * 100)}
                onChange={e => {
                  const raw = parseInt(e.target.value, 10);
                  const validVal = Number.isNaN(raw) ? 70 : Math.min(100, Math.max(0, raw));
                  handleUpdate(selectedQuiz, 'passThreshold', validVal / 100);
                }}
                className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm outline-none"
              />
            </FormField>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase opacity-50 px-1">Import Mode</span>
                <div className="flex items-center gap-2 text-[10px]">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="importMode" value="replace" checked={importMode === 'replace'} onChange={() => setImportMode('replace')} />
                    <span>Replace</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="importMode" value="append" checked={importMode === 'append'} onChange={() => setImportMode('append')} />
                    <span>Append</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadTemplate} className="flex-1 py-2 rounded-xl border border-border text-[10px] font-black"><Download size={12} className="inline mr-1"/>Tmpl</button>
                <button onClick={() => document.getElementById('q-imp')?.click()} className="flex-1 py-2 rounded-xl bg-emerald-500/5 text-emerald-600 text-[10px] font-black"><FileUp size={12} className="inline mr-1"/>{importing ? '...' : 'Imp'}</button>
                <input type="file" id="q-imp" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
              </div>
            </div>
          </div>
          {importError && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-2.5 rounded-xl">
              <AlertCircle size={14} />
              <span>{importError}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="q-t-en" label="Title EN"><input id="q-t-en" value={definitions[selectedQuiz].title?.en || ''} onChange={e => handleUpdate(selectedQuiz, 'title.en', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm outline-none" /></FormField>
            <FormField id="q-t-th" label="Title TH"><input id="q-t-th" value={definitions[selectedQuiz].title?.th || ''} onChange={e => handleUpdate(selectedQuiz, 'title.th', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm outline-none" /></FormField>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-black uppercase">Questions ({(definitions[selectedQuiz].questions || []).length})</span>
              <div className="relative max-w-xs w-full"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" /><input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-secondary/30 pl-9 pr-4 py-1.5 rounded-lg text-xs outline-none" /></div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {filteredQuestions.map(({ q, i }) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-secondary/5 flex gap-4">
                  <input type="checkbox" checked={selectedQuestions.includes(i)} onChange={() => setSelectedQuestions(p => p.includes(i) ? p.filter(x=>x!==i) : [...p, i])} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start"><span className="text-sm font-bold">{q.en}</span><button onClick={() => { if(window.confirm('Delete?')){ const d = {...definitions}; d[selectedQuiz].questions = d[selectedQuiz].questions.filter((_, idx)=>idx!==i); setDefinitions(d); onChange(); }}} className="text-red-500"><Trash2 size={14} /></button></div>
                    <p className="text-xs text-muted-foreground mt-1">{q.th}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">{(q.options?.en || []).map((opt, oIdx) => (<div key={oIdx} className={`text-[10px] p-2 rounded-lg border ${oIdx === q.correctIdx ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 font-bold' : 'bg-secondary/20 text-muted-foreground'}`}>{opt}</div>))}</div>
                  </div>
                </div>
              ))}
              {filteredQuestions.length === 0 && <EmptyState icon={Database} title="No matching questions" />}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
