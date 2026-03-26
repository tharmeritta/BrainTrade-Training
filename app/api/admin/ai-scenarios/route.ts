import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, requireAdminOrManager } from '@/lib/session';
import { fsGet, fsSet, fsDelete, fsGetAll } from '@/lib/firestore-db';
import { AiEvalScenario } from '@/types/ai-eval';
import { AiEvalService } from '@/lib/services/ai-eval-service';
import { createApprovalRequest } from '@/lib/services/approval-service';

const COLLECTION = 'aiev_scenarios';

export async function GET(req: NextRequest) {
  try {
    await requireAdminOrManager();
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
    const user = await getServerUser();
    if (!user || !['admin', 'manager', 'it'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    
    // IT and Manager roles require approval
    if (user.role === 'it' || user.role === 'manager') {
      await createApprovalRequest(
        { uid: user.uid, name: user.name },
        'create_ai_scenario',
        Array.isArray(body) ? body : { ...body, id: crypto.randomUUID() },
        { name: Array.isArray(body) ? `Bulk Import (${body.length} scenarios)` : body.name }
      );
      return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
    }
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        if (!item.name) continue;
        const id = item.id || crypto.randomUUID();
        const scenario: AiEvalScenario = {
          ...item,
          id,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: item.isActive ?? true,
          difficulty: item.difficulty || 'beginner',
          maxTurns: item.maxTurns || 12,
          passThreshold: item.passThreshold || 7
        };
        await fsSet(COLLECTION, id, scenario);
        results.push(scenario);
      }
      return NextResponse.json({ success: true, count: results.length });
    }

    // Handle single creation
    const id = crypto.randomUUID();
    const scenario: AiEvalScenario = {
      ...body,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: body.isActive ?? true
    };

    await fsSet(COLLECTION, id, scenario);
    return NextResponse.json({ success: true, scenario });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'manager', 'it'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, data } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing = await fsGet<AiEvalScenario>(COLLECTION, id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // IT and Manager roles require approval
    if (user.role === 'it' || user.role === 'manager') {
      await createApprovalRequest(
        { uid: user.uid, name: user.name },
        'edit_ai_scenario',
        data,
        { id, name: existing.name }
      );
      return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
    }

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
    const user = await getServerUser();
    if (!user || (user.role !== 'admin' && user.role !== 'it')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const existing = await fsGet<AiEvalScenario>(COLLECTION, id);

    // IT role requires approval
    if (user.role === 'it') {
      await createApprovalRequest(
        { uid: user.uid, name: user.name },
        'delete_ai_scenario',
        null,
        { id, name: existing?.name || id }
      );
      return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
    }

    await fsDelete(COLLECTION, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
