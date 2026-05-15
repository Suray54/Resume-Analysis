'use client';

import React, { useEffect } from 'react';
import { usePuterStore } from '@/lib/store';

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const initialize = usePuterStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};
