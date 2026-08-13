import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebase-admin';
import type { TrainingPeriod } from '@/types';

// Helper to generate readable random invite code (e.g. WAVE-8K3P)
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WAVE-${code}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code')?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection('training_periods')
      .where('inviteCode', '==', code)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: 'Invalid or expired training wave code' }, { status: 444 });
    }

    const doc = snap.docs[0];
    const data = doc.data() as TrainingPeriod;

    return NextResponse.json({
      period: {
        id: doc.id,
        name: data.name,
        trainerName: data.trainerName,
        startDate: data.startDate,
        totalDays: data.totalDays,
        inviteCode: data.inviteCode,
        agentCount: (data.agentIds || []).length,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, agentName } = body;

    const trimmedCode = code?.trim().toUpperCase();
    const trimmedName = agentName?.trim();

    if (!trimmedCode || !trimmedName) {
      return NextResponse.json({ error: 'Code and full name are required' }, { status: 400 });
    }

    const db = getAdminDb();
    const periodSnap = await db.collection('training_periods')
      .where('inviteCode', '==', trimmedCode)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (periodSnap.empty) {
      return NextResponse.json({ error: 'Invalid or expired training wave code' }, { status: 444 });
    }

    const periodDoc = periodSnap.docs[0];
    const periodData = periodDoc.data() as TrainingPeriod;

    // Standardize agent ID (slugified from normalized name)
    const normalized = trimmedName.toLowerCase().replace(/\s+/g, ' ');
    const agentId = normalized.replace(/[^a-z0-9]/g, '_');

    // 1. Check or provision agent record in 'agents' collection
    const agentRef = db.collection('agents').doc(agentId);
    const agentDoc = await agentRef.get();

    if (!agentDoc.exists) {
      await agentRef.set({
        id: agentId,
        name: trimmedName,
        normalizedName: normalized,
        active: true,
        createdAt: new Date(),
        activePeriodId: periodDoc.id,
        status: 'active',
      });
    } else {
      await agentRef.update({
        active: true,
        activePeriodId: periodDoc.id,
        status: 'active',
      });
    }

    // 2. Add agent to training period if not already present
    const existingAgentIds = periodData.agentIds || [];
    const existingAgentNames = periodData.agentNames || {};

    if (!existingAgentIds.includes(agentId)) {
      const updatedAgentIds = [...existingAgentIds, agentId];
      const updatedAgentNames = { ...existingAgentNames, [agentId]: trimmedName };

      await periodDoc.ref.update({
        agentIds: updatedAgentIds,
        agentNames: updatedAgentNames,
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. Return session setup details
    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        name: trimmedName,
      },
      period: {
        id: periodDoc.id,
        name: periodData.name,
        trainerName: periodData.trainerName,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
