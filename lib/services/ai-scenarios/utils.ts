import * as XLSX from 'xlsx';

export const DEFAULT_CRITERIA = ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'];

export const AI_SCENARIO_TEMPLATE = [
  {
    Name: 'The Skeptical Investor',
    Difficulty: 'intermediate',
    Threshold: 7,
    SystemPrompt: 'เล่นบทเป็นลูกค้าคนไทยที่เคยขาดทุนมาก่อน...',
    ExternalPrompt: 'เล่นบทเป็นลูกค้าคนไทย: The Skeptical Investor\nอารมณ์: กังวลและสงสัย\nเป้าหมาย: เข้าใจความเสี่ยง...',
    AuditInstructions: 'Check if agent explained the 1:1 coaching and regulatory compliance clearly.',
    Persona: 'A middle-aged business owner who has lost money in stocks before.',
    Objective: 'Understand the risk management and safety of the platform.',
    Mood: 'Cautious and skeptical',
    MaxTurns: 12,
    Criteria: DEFAULT_CRITERIA.join(','),
    WinHint: 'Agent explains the 1:1 coaching and regulatory compliance.',
    FailHint: 'Agent is too pushy or dismisses the customer\'s past bad experience.'
  }
];

export function downloadScenarioTemplate() {
  const ws = XLSX.utils.json_to_sheet(AI_SCENARIO_TEMPLATE);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Scenarios');
  XLSX.writeFile(wb, 'ai_scenario_template.xlsx');
}

export async function parseScenarioFile(file: File): Promise<any[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet) as any[];

  return json
    .map(row => {
      const difficulty = (row.Difficulty || row.difficulty || row['ความยาก'] || 'beginner').toLowerCase();
      const levelMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
      const level = levelMap[difficulty] || 1;

      return {
        name: row.Name || row.name || row['ชื่อ'] || row['ชื่อสถานการณ์'],
        difficulty,
        level,
        passThreshold: parseInt(row.Threshold || row.threshold || row.passThreshold || row['เกณฑ์คะแนน'] || row['คะแนนผ่าน'] || 7),
        systemPrompt: row.SystemPrompt || row.systemPrompt || row['พรอมต์ระบบ'] || row['คำสั่งระบบ'],
        isMaster: row.IsMaster === true || row.isMaster === true || row.IsMaster === 'TRUE' || row.isMaster === 'true' || row['แซนด์บ็อกซ์'] === 'TRUE',
        customerPersona: row.Persona || row.persona || row.customerPersona || row['บุคลิกลูกค้า'] || row['ข้อมูลลูกค้า'],
        objective: row.Objective || row.objective || row['วัตถุประสงค์'],
        initialMood: row.Mood || row.mood || row.initialMood || row['อารมณ์'],
        maxTurns: parseInt(row.MaxTurns || row.maxTurns || row['รอบสูงสุด'] || row['จำนวนรอบ'] || 12),
        externalPrompt: row.ExternalPrompt || row.externalPrompt || row['พรอมต์ภายนอก'],
        auditInstructions: row.AuditInstructions || row.auditInstructions || row['คำแนะนำการตรวจสอบ'],
        winCondition: row.WinHint || row.winHint || row.winCondition || row['เงื่อนไขการชนะ'] || row['คำแนะนำการชนะ'],
        failCondition: row.FailHint || row.failHint || row.failCondition || row['เงื่อนไขการแพ้'] || row['คำแนะนำการแพ้'],
        requiredCriteria: (() => {
          const raw = row.Criteria || row.criteria || row.requiredCriteria || row['เกณฑ์การประเมิน'];
          if (!raw) return DEFAULT_CRITERIA;
          return String(raw).split(',').map((s: string) => s.trim()).filter(Boolean);
        })(),
        isActive: true
      };
    })
    .filter(s => s.name && s.customerPersona);
}
