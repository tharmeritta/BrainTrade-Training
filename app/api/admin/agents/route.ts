import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, apiError } from '@/lib/api-utils';
import { fsAdd } from '@/lib/firestore-db';
import { createApprovalRequest } from '@/lib/services/approval-service';
import { getAllAgentStats } from '@/lib/agents';

export const GET = withApiAuth(async () => {
  const agents = await getAllAgentStats();
  return NextResponse.json({ agents });
}, ['admin', 'manager', 'it', 'trainer', 'hr']);

export const POST = withApiAuth(async (req, _, user) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  // Handle IT and Manager role approval (Always require approval for changes)
  if (user.role === 'it' || user.role === 'manager') {
    await createApprovalRequest(
      { uid: user.uid, name: user.name },
      'create_agent',
      body,
      { name: Array.isArray(body) ? `Bulk Import (${body.length} agents)` : body.name }
    );
    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
  }

  // Handle bulk import
  if (Array.isArray(body)) {
    const agentsToCreate = body.filter(a => a.name?.trim());
    if (agentsToCreate.length === 0) return apiError('No valid agents provided', 400);

    const results = [];
    for (const a of agentsToCreate) {
      const agent = await fsAdd('agents', { 
        name: a.name.trim(), 
        stageName: a.stageName?.trim() || '',
        normalizedName: a.name.trim().toLowerCase().replace(/\s+/g, ' '),
        active: true 
      });
      results.push(agent);
    }
    return NextResponse.json({ success: true, count: results.length, agents: results });
  }

  // Handle single creation
  const { name, stageName } = body;
  if (!name?.trim()) return apiError('Name required', 400);

  const agent = await fsAdd('agents', { 
    name: name.trim(), 
    stageName: stageName?.trim() || '',
    normalizedName: name.trim().toLowerCase().replace(/\s+/g, ' '),
    active: true 
  });
  return NextResponse.json(agent);
}, ['admin', 'manager']);
