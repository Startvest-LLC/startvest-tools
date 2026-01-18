'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export function PageViewTracker() {
  useEffect(() => {
    trackPageView();
  }, []);

  return null;
}