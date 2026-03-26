import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrIT } from '@/lib/session';
import { fsGet, fsSet, fsDelete, fsGetAll } from '@/lib/firestore-db';
import { AiEvalScenario } from '@/types/ai-eval';
import { AiEvalService } from '@/lib/services/ai-eval-service';

const COLLECTION = 'aiev_scenarios';

export async function GET(req: NextRequest) {
  try {
    await requireAdminOrIT();
    const scenarios = await fsGetAll<AiEvalScenario>(COLLECTION);
    
    // Ensure at least the default scenario exists
    if (scenarios.length === 0) {
      await AiEvalService.startSession('internal', 'System', 'default');
      const refreshed = await fsGetAll<AiEvalScenario>(COLLECTION);
      return NextResponse.json({ scenarios: refreshed });
    }

    return NextResponse.json({ scenarios });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Forbidden' ? 403 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminOrIT();
    const data = await req.json();
    const id = crypto.randomUUID();
    
    const scenario: AiEvalScenario = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: data.isActive ?? true
    };

    await fsSet(COLLECTION, id, scenario);
    return NextResponse.json({ success: true, scenario });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminOrIT();
    const { id, data } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing = await fsGet<AiEvalScenario>(COLLECTION, id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = {
      ...existing,
      ...data,
      id, // ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    await fsSet(COLLECTION, id, updated);
    return NextResponse.json({ success: true, scenario: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminOrIT();
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    if (id === 'default') return NextResponse.json({ error: 'Cannot delete default scenario' }, { status: 400 });

    await fsDelete(COLLECTION, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
