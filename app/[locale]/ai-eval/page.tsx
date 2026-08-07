'use client';

import { Suspense } from 'react';
import AiEvaluation from '@/components/features/ai-eval';
import { Loader2 } from 'lucide-react';

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );
}

export default function AiEvalPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AiEvaluation />
    </Suspense>
  );
}
