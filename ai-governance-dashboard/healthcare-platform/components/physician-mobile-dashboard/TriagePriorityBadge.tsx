'use client';

import React from 'react';
import { TriagePriorityBadgeProps, UrgencyLevel } from './types';

/**
 * TriagePriorityBadge Component
 * 
 * Displays patient urgency level with color-coded background and text label.
 * 
 * Color Mapping:
 * - High: Red background (#EF4444), white text
 * - Medium: Amber background (#F59E0B), white text
 * - Low: Teal background (#1ABC9C), white text
 * 
 * Accessibility:
 * - ARIA role="status" for screen readers
 * - aria-label includes urgency level text
 * - Text label always visible (not color-only indication)
 * - Minimum 4.5:1 contrast ratio for all color combinations
 * 
 * @param props - Component props
 * @returns Triage priority badge component
 */
export function TriagePriorityBadge({ urgency, className = '' }: TriagePriorityBadgeProps) {
  // Map urgency level to CSS class
  const getBadgeClass = (level: UrgencyLevel): string => {
    switch (level) {
      case 'High':
        return 'badge-high';
      case 'Medium':
        return 'badge-medium';
      case 'Low':
        return 'badge-low';
      default:
        return 'badge-medium'; // Fallback to medium
    }
  };

  // Get urgency icon/indicator
  const getUrgencyIndicator = (level: UrgencyLevel): string => {
    switch (level) {
      case 'High':
        return '🔴';
      case 'Medium':
        return '🟡';
      case 'Low':
        return '🟢';
      default:
        return '🟡';
    }
  };

  const badgeClass = getBadgeClass(urgency);
  const indicator = getUrgencyIndicator(urgency);

  return (
    <div
      role="status"
      aria-label={`Patient urgency level: ${urgency}`}
      className={`
        ${badgeClass}
        inline-flex items-center gap-2
        px-3 py-2
        rounded-lg
        font-semibold
        text-sm md:text-base
        ${className}
      `.trim()}
    >
      <span aria-hidden="true">{indicator}</span>
      <span>Priority: {urgency}</span>
    </div>
  );
}
