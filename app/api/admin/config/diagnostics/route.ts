import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { getAdminDb } from '@/lib/firebase-admin';
import { fsGetAll } from '@/lib/firestore-db';
import { Agent, TrainingPeriod, AgentEvaluation } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const results: any[] = [];

    // 1. Database Connectivity & Latency
    const dbStart = Date.now();
    await db.collection('configs').doc('features').get();
    const dbLatency = Date.now() - dbStart;
    results.push({
      id: 'database',
      name: 'Firestore Connectivity',
      status: dbLatency < 500 ? 'pass' : 'warn',
      message: `Database responded in ${dbLatency}ms`,
      details: dbLatency > 500 ? 'Latency is higher than usual.' : 'Healthy connection.'
    });

    // 2. Configuration Integrity
    const configIds = ['learn', 'quizzes', 'ai_eval', 'features'];
    const missingConfigs = [];
    for (const id of configIds) {
      const doc = await db.collection('configs').doc(id).get();
      if (!doc.exists) missingConfigs.push(id);
    }
    results.push({
      id: 'configurations',
      name: 'System Configurations',
      status: missingConfigs.length === 0 ? 'pass' : 'fail',
      message: missingConfigs.length === 0 ? 'All configurations found' : `Missing: ${missingConfigs.join(', ')}`,
      details: missingConfigs.length > 0 ? 'System might behave unexpectedly without these documents.' : 'Core config documents are intact.'
    });

    // 3. Relational Integrity (Orphans)
    const [evals, agents] = await Promise.all([
      fsGetAll<AgentEvaluation>('agent_evaluations'),
      fsGetAll<Agent>('agents')
    ]);
    const agentIds = new Set(agents.map(a => a.id));
    const agentOrphans = evals.filter(e => !agentIds.has(e.agentId));
    const batchOrphans = evals.filter(e => !e.trainingPeriodId);
    
    results.push({
      id: 'integrity',
      name: 'Relational Integrity',
      status: (agentOrphans.length === 0 && batchOrphans.length === 0) ? 'pass' : 'warn',
      message: (agentOrphans.length === 0 && batchOrphans.length === 0) 
        ? 'No orphaned records' 
        : `${agentOrphans.length} agent-orphans, ${batchOrphans.length} batch-orphans`,
      details: batchOrphans.length > 0 
        ? 'Some evaluations are not linked to any training batch. They won\'t appear in archives.' 
        : agentOrphans.length > 0 ? 'Evaluations found for agents that no longer exist.' : 'All records correctly linked.'
    });

    // 4. Batch Consistency
    const periods = await fsGetAll<TrainingPeriod>('training_periods');
    const activeWithNoAgents = [];
    for (const p of periods.filter(p => p.active)) {
      const batchAgents = agents.filter(a => p.agentIds.includes(a.id));
      if (batchAgents.length === 0) activeWithNoAgents.push(p.name);
    }
    results.push({
      id: 'batches',
      name: 'Batch Consistency',
      status: activeWithNoAgents.length === 0 ? 'pass' : 'warn',
      message: activeWithNoAgents.length === 0 ? 'All batches consistent' : `${activeWithNoAgents.length} empty active batches`,
      details: activeWithNoAgents.length > 0 ? `Empty active batches: ${activeWithNoAgents.join(', ')}` : 'Active batches have assigned agents.'
    });

    // 5. Counter Drift (Simple check)
    const statsDoc = await db.collection('stats').doc('global').get();
    const stats = statsDoc.data() || {};
    const actualActiveCount = agents.filter(a => a.active).length;
    const drift = Math.abs((stats.activeAgents || 0) - actualActiveCount);

    results.push({
      id: 'counters',
      name: 'Data Counter Sync',
      status: drift === 0 ? 'pass' : 'warn',
      message: drift === 0 ? 'Counters are synchronized' : `Drift detected: ${drift} agents`,
      details: drift > 0 ? 'Global stats do not perfectly match actual record counts.' : 'Cached statistics are accurate.'
    });

    return NextResponse.json({ 
      timestamp: new Date().toISOString(),
      overall: results.every(r => r.status !== 'fail') ? 'healthy' : 'degraded',
      results 
    });

  } catch (error: any) {
    console.error('Diagnostics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
