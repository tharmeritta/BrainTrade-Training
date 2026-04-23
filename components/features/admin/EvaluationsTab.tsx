'use client';

import { useTranslations } from 'next-intl';
import { ClipboardList, Archive, Loader2, ChevronDown, Star, MonitorOff, ClipboardCheck } from 'lucide-react';
import { KpiCard } from './AdminComponents';
import { useEvaluationsData } from './evaluations/useEvaluationsData';
import ActiveBatchHeader from './evaluations/ActiveBatchHeader';
import ArchiveSelectionGrid from './evaluations/ArchiveSelectionGrid';
import EvaluationsDashboard from './evaluations/EvaluationsDashboard';

export default function EvaluationsTab({ readOnly }: { readOnly?: boolean }) {
  const t = useTranslations('admin');
  const {
    evaluatorSummaries,
    globalAvg,
    evMap,
    filteredEvals,
    activePeriods,
    inactivePeriods,
    selectedPeriod,
    activeTab,
    setActiveTab,
    selectedPeriodId,
    setSelectedPeriodId,
    loading,
    loadingEvals,
    filterEv,
    setFilterEv,
    searchTerm,
    setSearchTerm
  } = useEvaluationsData();

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-primary/20 rounded-full" />
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{t('evaluations.loading')}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Switcher */}
      <div className="flex p-1 bg-secondary/30 rounded-2xl w-fit border border-border/50 shadow-inner">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'current' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          <ClipboardList size={16} /> Active Training
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-[1.02]' : 'text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          <Archive size={16} /> Batch Archive
        </button>
      </div>

      {activeTab === 'current' ? (
        <div className="space-y-6">
          <ActiveBatchHeader 
            activePeriods={activePeriods} 
            selectedPeriodId={selectedPeriodId} 
            onSelectPeriod={setSelectedPeriodId} 
          />

          {activePeriods.length === 0 ? (
             <div className="bg-card/40 border border-dashed border-border rounded-3xl p-20 text-center">
                <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                   <MonitorOff size={32} />
                </div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight">No Active Training</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
                  There are currently no training batches being monitored. Data will appear here once a trainer starts a new session.
                </p>
             </div>
          ) : loadingEvals ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Loading live evaluations...</p>
            </div>
          ) : (
            <EvaluationsDashboard
              evals={[]}
              evaluatorSummaries={evaluatorSummaries}
              globalAvg={globalAvg}
              filterEv={filterEv}
              setFilterEv={setFilterEv}
              filteredEvals={filteredEvals}
              evMap={evMap}
              themeColor="blue"
              subLabel="Current Batch"
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {!selectedPeriodId ? (
            <ArchiveSelectionGrid 
              inactivePeriods={inactivePeriods}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSelectPeriod={setSelectedPeriodId}
            />
          ) : (
            <div className="space-y-6">
              {/* Archive Header with Back Button */}
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedPeriodId('')} className="p-2 rounded-lg bg-white/50 hover:bg-white transition-colors">
                       <ChevronDown size={16} className="rotate-90 text-amber-600" />
                    </button>
                    <div>
                       <h3 className="text-sm font-black text-amber-700 uppercase tracking-tight">Reviewing Archive: {selectedPeriod?.name}</h3>
                       <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest">
                         Training Period: {selectedPeriod?.startDate} to {selectedPeriod?.completedAt ? new Date(selectedPeriod.completedAt).toLocaleDateString() : 'End'}
                       </p>
                    </div>
                 </div>
                 <KpiCard label="Average" value={globalAvg ? `${globalAvg}%` : '—'} icon={Star} themeColor="amber" />
              </div>

              {loadingEvals ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-amber-500" size={24} />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Loading historical records...</p>
                </div>
              ) : filteredEvals.length === 0 ? (
                <div className="bg-amber-500/5 border border-dashed border-amber-500/20 rounded-3xl p-20 text-center">
                   <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-600">
                      <ClipboardCheck size={32} />
                   </div>
                   <h3 className="text-lg font-black text-amber-800 uppercase tracking-tight">No Historical Records</h3>
                   <p className="text-sm text-amber-600/60 max-w-md mx-auto mt-2 leading-relaxed">
                     This batch was finalized but contains no evaluation records in the archive. 
                   </p>
                </div>
              ) : (
                <EvaluationsDashboard
                  evals={[]}
                  evaluatorSummaries={evaluatorSummaries}
                  globalAvg={globalAvg}
                  filterEv={filterEv}
                  setFilterEv={setFilterEv}
                  filteredEvals={filteredEvals}
                  evMap={evMap}
                  themeColor="amber"
                  subLabel="In this batch"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
