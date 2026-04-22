'use client';

import { ShieldCheck } from 'lucide-react';

export default function AccessNotes() {
  return (
    <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-5 text-sm text-blue-400">
      <p className="font-semibold mb-1 flex items-center gap-2">
        <ShieldCheck size={16} /> System Access Notes
      </p>
      <ul className="space-y-1 text-blue-400/80 list-disc list-inside">
        <li>Staff accounts are used for management and evaluation.</li>
        <li>Agent accounts are used for training and practice.</li>
        <li>Managers can see all stats and export reports.</li>
        <li>IT Support can manage staff accounts.</li>
      </ul>
    </div>
  );
}
