'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Locale Error Boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
      <p className="text-sm opacity-70 mb-6 max-w-md">
        {error.message || 'An unexpected error occurred during rendering.'}
      </p>
      {error.digest && (
        <p className="text-[10px] font-mono opacity-40 mb-8">Digest: {error.digest}</p>
      )}
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-white rounded-xl font-bold"
      >
        Try again
      </button>
    </div>
  );
}
