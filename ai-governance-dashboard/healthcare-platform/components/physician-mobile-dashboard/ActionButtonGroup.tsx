'use client';

import React from 'react';
import { ActionButtonGroupProps } from './types';

/**
 * ActionButtonGroup Component
 * 
 * Container for action buttons with mobile-optimized touch targets.
 * 
 * Button Specifications:
 * - Minimum dimensions: 48px height × 48px width
 * - Gap between buttons: 0.75rem (12px)
 * - Order MRI: Primary button (Healing Teal background, white text)
 * - Generate Referral: Secondary button (white background, Deep Slate border and text)
 * 
 * Accessibility:
 * - Semantic <button> elements
 * - Descriptive aria-labels
 * - Keyboard accessible (tab order, enter/space activation)
 * - Focus visible indicators
 * 
 * @param props - Component props
 * @returns Action button group component
 */
export function ActionButtonGroup({ 
  onOrderMRI, 
  onGenerateReferral, 
  className = '' 
}: ActionButtonGroupProps) {
  const handleOrderMRI = () => {
    try {
      onOrderMRI();
    } catch (error) {
      console.error('Error executing Order MRI action:', error);
    }
  };

  const handleGenerateReferral = () => {
    try {
      onGenerateReferral();
    } catch (error) {
      console.error('Error executing Generate Referral action:', error);
    }
  };

  return (
    <div 
      className={`
        flex flex-col sm:flex-row gap-3
        ${className}
      `.trim()}
    >
      {/* Order MRI Button - Primary */}
      <button
        onClick={handleOrderMRI}
        aria-label="Order MRI scan for patient"
        className="
          touch-target
          flex-1
          bg-healing-teal
          hover:bg-healing-teal/90
          active:scale-98
          text-white
          font-medium
          text-sm
          px-3 py-2.5
          rounded-lg
          transition-all
          duration-150
          focus:outline-none
          focus:ring-2
          focus:ring-healing-teal
          focus:ring-offset-2
        "
      >
        Order MRI
      </button>

      {/* Generate Specialist Referral Button - Secondary */}
      <button
        onClick={handleGenerateReferral}
        aria-label="Generate specialist referral for patient"
        className="
          touch-target
          flex-1
          bg-white
          hover:bg-gray-50
          active:scale-98
          text-deep-slate
          border-2
          border-deep-slate
          font-medium
          text-sm
          px-3 py-2.5
          rounded-lg
          transition-all
          duration-150
          focus:outline-none
          focus:ring-2
          focus:ring-deep-slate
          focus:ring-offset-2
        "
      >
        Generate Specialist Referral
      </button>
    </div>
  );
}
