'use client';

import React from 'react';
import { ClinicalBriefCardProps, validatePainScale } from './types';

/**
 * ClinicalBriefCard Component
 * 
 * Displays patient's chief complaint and pain scale in a card format.
 * 
 * Pain Scale Display:
 * - Format: "Pain Level: X/10"
 * - Color coding based on severity:
 *   - 0-3: Green (#10B981)
 *   - 4-6: Amber (#F59E0B)
 *   - 7-10: Red (#EF4444)
 * 
 * Accessibility:
 * - Accessible label: "Patient pain scale: X out of 10"
 * - Minimum 4.5:1 contrast ratio
 * - Semantic HTML structure
 * 
 * @param props - Component props
 * @returns Clinical brief card component
 */
export function ClinicalBriefCard({ 
  chiefComplaint, 
  painScale, 
  className = '' 
}: ClinicalBriefCardProps) {
  // Validate and normalize pain scale
  const { isValid, normalizedValue } = validatePainScale(painScale);
  
  // Determine pain scale color class based on severity
  const getPainScaleColorClass = (value: number): string => {
    if (value >= 0 && value <= 3) {
      return 'pain-low';
    } else if (value >= 4 && value <= 6) {
      return 'pain-medium';
    } else if (value >= 7 && value <= 10) {
      return 'pain-high';
    }
    return 'text-gray-600'; // Fallback
  };

  const painColorClass = getPainScaleColorClass(normalizedValue);
  
  // Handle empty chief complaint
  const displayComplaint = chiefComplaint && chiefComplaint.trim().length > 0
    ? chiefComplaint
    : 'No chief complaint provided';
  
  const isEmptyComplaint = !chiefComplaint || chiefComplaint.trim().length === 0;

  return (
    <div 
      className={`
        bg-white
        border border-gray-200
        rounded-lg
        p-4
        flex flex-col gap-3
        ${className}
      `.trim()}
    >
      {/* Chief Complaint Section */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Chief Complaint
        </h3>
        <p 
          className={`
            text-base md:text-lg
            ${isEmptyComplaint ? 'text-gray-400 italic' : 'text-deep-slate'}
          `.trim()}
        >
          {displayComplaint}
        </p>
      </div>

      {/* Pain Scale Section */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Pain Level
        </h3>
        <div className="flex items-baseline gap-2">
          {isValid ? (
            <>
              <span 
                className={`text-2xl md:text-3xl font-bold ${painColorClass}`}
                aria-label={`Patient pain scale: ${normalizedValue} out of 10`}
              >
                {normalizedValue}
              </span>
              <span className="text-lg text-gray-500">/10</span>
            </>
          ) : (
            <span 
              className="text-2xl md:text-3xl font-bold text-gray-400"
              aria-label="Patient pain scale: not available"
            >
              N/A
            </span>
          )}
        </div>
        {isValid && (
          <p className="text-xs text-gray-500 mt-1">
            {normalizedValue >= 0 && normalizedValue <= 3 && 'Mild pain'}
            {normalizedValue >= 4 && normalizedValue <= 6 && 'Moderate pain'}
            {normalizedValue >= 7 && normalizedValue <= 10 && 'Severe pain'}
          </p>
        )}
      </div>
    </div>
  );
}
