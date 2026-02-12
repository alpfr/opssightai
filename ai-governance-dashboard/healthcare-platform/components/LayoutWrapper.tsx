'use client';

import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  // Initialize HIPAA-compliant 15-minute inactivity timeout
  useInactivityTimeout(15, () => {
    console.log('Session expired due to inactivity');
    // Additional cleanup can be performed here
  });

  return <>{children}</>;
}
