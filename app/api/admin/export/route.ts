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
    ['BrainTrade Training — Individual Report'],
    ['Agent:', stat.agent.name],
    ['Overall Score:', `${stat.overallScore}%`],
    ['Performance:', stat.badge.replace('-', ' ')],
    [],
    ['Module', 'Best Score %', 'Passed', 'Attempts'],
    ...(['product','process','payment'] as const).map(m => [
      m.charAt(0).toUpperCase() + m.slice(1),
      stat.quiz[m]?.bestScore ?? 'N/A',
      stat.quiz[m]?.passed ? 'Yes' : 'No',
      stat.quiz[m]?.attempts ?? 0,
    ]),
    [],
    ['AI Evaluation', 'Avg Score', 'Sessions'],
    ['AI Eval', stat.aiEval?.avgScore ?? 'N/A', stat.aiEval?.count ?? 0],
    [],
    ['Pitch Simulator', 'Highest Level', 'Sessions'],
    ['Pitch', stat.pitch?.highestLevel ?? 'N/A', stat.pitch?.sessionCount ?? 0],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [20,15,12,12].map(wch => ({ wch }));
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
