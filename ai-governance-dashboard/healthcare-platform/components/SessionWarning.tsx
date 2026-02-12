'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(2);

  useEffect(() => {
    const handleWarning = (event: Event) => {
      const customEvent = event as CustomEvent;
      setMinutesRemaining(customEvent.detail.minutesRemaining);
      setShowWarning(true);
    };

    window.addEventListener('session-warning', handleWarning);

    return () => {
      window.removeEventListener('session-warning', handleWarning);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
      <div className="bg-warning text-white rounded-lg shadow-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Session Expiring Soon</h3>
          <p className="text-sm opacity-90">
            Your session will expire in {minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''} due to inactivity.
            Move your mouse or press any key to stay logged in.
          </p>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          aria-label="Dismiss warning"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
