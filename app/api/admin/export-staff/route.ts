import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrIT } from '@/lib/session';
import { fsGetAll } from '@/lib/firestore-db';
import type { StaffAccount } from '@/types';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    await requireAdminOrIT();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allStaff = await fsGetAll<StaffAccount>('staff_accounts');
    
    // Filter out admins from the export list
    const exportData = allStaff.filter(s => s.role !== 'admin');

    const headers = ['Name', 'Role', 'Username', 'Password'];
    const rows = exportData.map(s => [
      s.name,
      s.role.charAt(0).toUpperCase() + s.role.slice(1),
      s.username,
      s.password
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    ws['!cols'] = [25, 15, 20, 20].map(wch => ({ wch }));

    XLSX.utils.book_append_sheet(wb, ws, 'Staff Accounts');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Staff_Accounts_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Staff export error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
