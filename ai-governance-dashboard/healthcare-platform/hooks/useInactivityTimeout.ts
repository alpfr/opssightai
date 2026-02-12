'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * HIPAA-compliant inactivity timeout hook
 * Automatically logs out users after 15 minutes of inactivity
 * 
 * @param timeoutMinutes - Timeout duration in minutes (default: 15 for HIPAA compliance)
 * @param onTimeout - Optional callback function to execute before logout
 */
export function useInactivityTimeout(
  timeoutMinutes: number = 15,
  onTimeout?: () => void
) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const timeoutMs = timeoutMinutes * 60 * 1000; // Convert to milliseconds
  const warningMs = (timeoutMinutes - 2) * 60 * 1000; // Warning 2 minutes before timeout

  const handleLogout = useCallback(() => {
    // Clear any existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    // Execute custom callback if provided
    if (onTimeout) {
      onTimeout();
    }
    
    // Clear session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session');
      sessionStorage.clear();
    }
    
    // Redirect to login
    router.push('/login?reason=timeout');
  }, [router, onTimeout]);

  const showWarning = useCallback(() => {
    // Show warning notification 2 minutes before timeout
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('session-warning', {
        detail: { minutesRemaining: 2 }
      });
      window.dispatchEvent(event);
    }
  }, []);

  const resetTimer = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    // Set warning timeout (2 minutes before logout)
    warningTimeoutRef.current = setTimeout(showWarning, warningMs);
    
    // Set logout timeout
    timeoutRef.current = setTimeout(handleLogout, timeoutMs);
  }, [timeoutMs, warningMs, handleLogout, showWarning]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any user activity
    const handleActivity = () => {
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);

  return { resetTimer };
}
