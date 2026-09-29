'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900">
      <h1 className="text-4xl font-bold text-red-400">Something went wrong</h1>
      <p className="mt-4 text-slate-400">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-500"
      >
        Try Again
      </button>
    </main>
  );
}
