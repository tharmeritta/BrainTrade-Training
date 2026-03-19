import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrManager } from '@/lib/session';
import { getAllAgentStats } from '@/lib/agents';
import type { AgentStats } from '@/types';
import * as XLSX from 'xlsx';

const GREEN = { fgColor: { rgb: 'C6EFCE' } };
const AMBER = { fgColor: { rgb: 'FFEB9C' } };
const RED   = { fgColor: { rgb: 'FFC7CE' } };

function scoreFill(score: number | undefined) {
  if (!score) return RED;
  if (score >= 70) return GREEN;
  if (score >= 50) return AMBER;
  return RED;
}

function buildOverviewSheet(agents: AgentStats[]) {
  const headers = ['Agent Name','Product %','Process %','Payment %','AI Eval Avg','Pitch Level','Overall Score','Performance'];
  const rows = agents.map(a => [
    a.agent.name,
    a.quiz.product?.bestScore ?? 'N/A',
    a.quiz.process?.bestScore ?? 'N/A',
    a.quiz.payment?.bestScore ?? 'N/A',
    a.aiEval?.avgScore        ?? 'N/A',
    a.pitch?.highestLevel     ?? 'N/A',
    a.overallScore,
    a.badge.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  for (let R = 1; R <= rows.length; R++) {
    const s = agents[R - 1];
    [
      scoreFill(s.quiz.product?.bestScore),
      scoreFill(s.quiz.process?.bestScore),
      scoreFill(s.quiz.payment?.bestScore),
      scoreFill(s.aiEval?.avgScore),
      s.pitch?.highestLevel === 3 ? GREEN : s.pitch?.highestLevel === 2 ? AMBER : RED,
      scoreFill(s.overallScore),
    ].forEach((fill, ci) => {
      const addr = XLSX.utils.encode_cell({ r: R, c: ci + 1 });
      if (ws[addr]) ws[addr].s = { fill };
    });
  }

  ws['!cols'] = [22,12,12,12,14,13,15,16].map(wch => ({ wch }));
  return ws;
}

function buildIndividualSheet(stat: AgentStats) {
  const rows: (string | number)[][] = [
    ['BrainTrade Training — Individual Performance Report'],
    ['Report Date:', new Date().toISOString().slice(0, 10)],
    [],
    ['AGENT PROFILE'],
    ['Name:', stat.agent.name],
    ['Overall Score:', `${stat.overallScore}%`],
    ['Performance Badge:', stat.badge.toUpperCase()],
    ['Last Active:', stat.lastActive ? stat.lastActive.slice(0, 16).replace('T', ' ') : 'N/A'],
    [],
    ['MODULE BREAKDOWN', 'Best Score %', 'Passed', 'Attempts'],
    ...(['product','process','payment'] as const).map(m => [
      m.toUpperCase(),
      stat.quiz[m]?.bestScore ?? '0',
      stat.quiz[m]?.passed ? 'YES' : 'NO',
      stat.quiz[m]?.attempts ?? 0,
    ]),
    [],
    ['DETAILED QUIZ HISTORY'],
    ['Module', 'Score', 'Result', 'Date'],
    ...(['product','process','payment'] as const).flatMap(m => 
      (stat.quiz[m]?.history || []).map(h => [
        m.toUpperCase(),
        `${h.score}/${h.total} (${Math.round(h.score/h.total*100)}%)`,
        h.passed ? 'PASS' : 'FAIL',
        h.timestamp.slice(0, 10)
      ])
    ),
    [],
    ['AI EVALUATION (Sales Objection Roleplay)'],
    ['Avg Score:', stat.aiEval?.avgScore ?? '0'],
    ['Total Sessions:', stat.aiEval?.count ?? 0],
    ['Completed Levels:', (stat.evalCompletedLevels ?? []).join(', ') || 'None'],
    [],
    ['AI EVAL SESSION LOGS'],
    ['Level', 'Score', 'Result', 'Date'],
    ...(stat.aiEval?.history || []).map(h => [
      `Level ${h.level}`,
      h.score,
      h.passed ? 'PASSED' : 'NOT PASSED',
      h.timestamp.slice(0, 10)
    ]),
    [],
    ['PITCH SIMULATOR (Closing Skills)'],
    ['Highest Level:', stat.pitch?.highestLevel ?? '0'],
    ['Total Sessions:', stat.pitch?.sessionCount ?? 0],
    ['Completed Levels:', (stat.pitch?.completedLevels ?? []).join(', ') || 'None'],
    [],
    ['PITCH SESSION LOGS'],
    ['Level', 'Outcome', 'Date'],
    ...(stat.pitch?.history || []).map(h => [
      `Level ${h.level}`,
      h.closedSale ? 'SALE CLOSED' : 'NO SALE',
      h.timestamp.slice(0, 10)
    ]),
    [],
    ['HUMAN EVALUATIONS (Quality Assurance)'],
    ['Evaluator', 'Score', 'Date', 'Comments'],
    ...(stat.humanEvaluations || []).map(h => [
      h.evaluatorName,
      h.totalScore,
      h.evaluatedAt.slice(0, 10),
      h.comments
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [25, 25, 20, 50].map(wch => ({ wch }));
  
  // Style headers
  const boldRows = [0, 3, 9, 12, 16, 21, 26, 31, 36, 37];
  boldRows.forEach(r => {
    for (let c = 0; c < 4; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (ws[addr]) {
        if (!ws[addr].s) ws[addr].s = {};
        ws[addr].s.font = { bold: true };
      }
    }
  });

  return ws;
}

export async function GET(req: NextRequest) {
  try { await requireAdminOrManager(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    const { searchParams } = new URL(req.url);
    const agentId  = searchParams.get('agentId');
    const allStats = await getAllAgentStats();
    const wb       = XLSX.utils.book_new();

    if (agentId) {
      const stat = allStats.find(s => s.agent.id === agentId);
      if (!stat) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      XLSX.utils.book_append_sheet(wb, buildIndividualSheet(stat), stat.agent.name.slice(0, 31));
    } else {
      XLSX.utils.book_append_sheet(wb, buildOverviewSheet(allStats.sort((a, b) => b.overallScore - a.overallScore)), 'All Agents');
    }

    const buffer   = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const agentName = agentId ? allStats.find(s => s.agent.id === agentId)?.agent.name ?? agentId : null;
    const filename  = agentName
      ? `BrainTrade_${agentName}.xlsx`
      : `BrainTrade_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
