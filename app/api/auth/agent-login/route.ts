import { NextResponse } from 'next/server';
import { fsQuery, fsGetWhere, fsGetAll } from '@/lib/server/db';
import type { Agent } from '@/types';

/**
 * Normalizes a name by trimming and collapsing multiple spaces.
 */
function normalizeName(n: string) {
  return n.trim().replace(/\s+/g, ' ');
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const cleanName = normalizeName(name).toLowerCase();

    // Optimized: Query directly by normalizedName
    // Allow login if active OR graduated
    const agents = await fsQuery<Agent>('agents', {
      where: [
        { field: 'normalizedName', op: '==', value: cleanName }
      ],
      limit: 1
    });

    const match = agents[0];

    // Check if the agent is allowed to log in (active or graduated)
    const isAllowed = match && (match.active || match.graduated);

    if (!match || !isAllowed) {
      // Fallback 1: Query by exact name match (case-sensitive in Firestore)
      const fallbackMatches = await fsGetWhere<Agent>('agents', 'name', name.trim());
      let legacyMatch = fallbackMatches.find(
        a => (a.active || a.graduated) && normalizeName(a.name).toLowerCase() === cleanName
      );

      if (!legacyMatch) {
        // Fallback 2: Targeted query for active/graduated agents
        try {
          console.log(`[Login] Performing fallback query for: ${cleanName}`);
          const activeAgents = await fsQuery<Agent>('agents', {
            where: [{ field: 'active', op: '==', value: true }]
          });
          legacyMatch = activeAgents.find(
            a => normalizeName(a.name || '').toLowerCase() === cleanName
          );
        } catch (fallbackErr: any) {
          console.error('[Login] Fallback query failed:', fallbackErr.message);
        }
      }

      if (!legacyMatch) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      
      return NextResponse.json({ 
        id: legacyMatch.id, 
        name: legacyMatch.name, 
        stageName: legacyMatch.stageName || '',
        graduated: legacyMatch.graduated || false
      });
    }

    return NextResponse.json({ 
      id: match.id, 
      name: match.name, 
      stageName: match.stageName || '',
      graduated: match.graduated || false
    });
  } catch (err: any) {
    console.error('[API Agent Login] error:', err.message);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
