import { NextResponse } from 'next/server';
import { fsQuery, fsGetWhere, fsGetAll } from '@/lib/firestore-db';
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
    const agents = await fsQuery<Agent>('agents', {
      where: [
        { field: 'normalizedName', op: '==', value: cleanName },
        { field: 'active', op: '==', value: true }
      ],
      limit: 1
    });

    const match = agents[0];

    if (!match) {
      // Fallback 1: Query by exact name match (case-sensitive in Firestore)
      const fallbackMatches = await fsGetWhere<Agent>('agents', 'name', name.trim());
      let legacyMatch = fallbackMatches.find(
        a => a.active && normalizeName(a.name).toLowerCase() === cleanName
      );

      if (!legacyMatch) {
        // Fallback 2: Ultimate fallback for manual entries (fetch all active)
        try {
          console.log(`[Login] Performing ultimate fallback for: ${cleanName}`);
          const allAgents = await fsGetAll<Agent>('agents');
          console.log(`[Login] Fetched ${allAgents.length} agents for fallback search`);
          legacyMatch = allAgents.find(
            a => a.active && normalizeName(a.name || '').toLowerCase() === cleanName
          );
        } catch (fallbackErr: any) {
          console.error('[Login] Ultimate fallback failed:', fallbackErr.message);
          // Don't throw, just continue to 404 if this failed
        }
      }

      if (!legacyMatch) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      
      return NextResponse.json({ 
        id: legacyMatch.id, 
        name: legacyMatch.name, 
        stageName: legacyMatch.stageName || '' 
      });
    }

    return NextResponse.json({ 
      id: match.id, 
      name: match.name, 
      stageName: match.stageName || '' 
    });
  } catch (err: any) {
    console.error('[API Agent Login] error:', err.message);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
