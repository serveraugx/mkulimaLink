'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true when the component has mounted on the client.
 * Useful to avoid hydration mismatches for browser-only APIs.
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
