/**
 * Evaluator page — server component that checks session auth,
 * then renders the EvaluatorDashboard.
 *
 * Requires:
 *  - /api/auth/session to set role='evaluator' in session cookie
 *  - lib/session.ts requireEvaluator() helper (similar to requireAdmin)
 *  - Env vars: EVALUATOR_USERNAME, EVALUATOR_PASSWORD
 */

import { redirect } from 'next/navigation';
import EvaluatorDashboard from '@/components/features/EvaluatorDashboard';
// import { getServerUser } from '@/lib/session'; // Uncomment when auth is wired

export default async function EvaluatorPage() {
  // Auth check — uncomment once session supports evaluator role:
  //
  // const user = await getServerUser();
  // if (!user || user.role !== 'evaluator') redirect('/login');

  // For development: pass placeholder evaluator identity
  // In production, derive from the session cookie
  const evaluatorId   = 'evaluator-session';
  const evaluatorName = 'Evaluator';

  return (
    <EvaluatorDashboard
      evaluatorId={evaluatorId}
      evaluatorName={evaluatorName}
    />
  );
}
