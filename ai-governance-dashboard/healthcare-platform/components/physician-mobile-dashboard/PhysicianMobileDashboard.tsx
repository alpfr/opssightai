'use client';

import React from 'react';
import { PhysicianMobileDashboardProps, isValidUrgency } from './types';
import { TriagePriorityBadge } from './TriagePriorityBadge';
import { ClinicalBriefCard } from './ClinicalBriefCard';
import { HistoricalContextSection } from './HistoricalContextSection';
import { ActionButtonGroup } from './ActionButtonGroup';

/**
 * PhysicianMobileDashboard Component
 * 
 * Main container component that orchestrates all sub-components for the
 * physician's mobile dashboard interface.
 * 
 * Component Order (top to bottom):
 * 1. Triage Priority Badge
 * 2. Clinical Brief Card
 * 3. Historical Context Section
 * 4. Action Button Group
 * 
 * Features:
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliance
 * - Props validation and normalization
 * - Error boundary support
 * - Healthcare theme integration
 * 
 * @param props - Component props
 * @returns Physician mobile dashboard component
 */
export function PhysicianMobileDashboard({
  urgency,
  chiefComplaint,
  painScale,
  historicalContext,
  onOrderMRI,
  onGenerateReferral,
  className = ''
}: PhysicianMobileDashboardProps) {
  // Validate urgency level
  const validatedUrgency = isValidUrgency(urgency) ? urgency : 'Medium';
  
  if (!isValidUrgency(urgency)) {
    console.warn(`Invalid urgency level "${urgency}". Defaulting to "Medium".`);
  }

  return (
    <div 
      className={`
        dashboard-card
        w-full
        mx-auto
        ${className}
      `.trim()}
      data-testid="physician-mobile-dashboard"
    >
      {/* 1. Triage Priority Badge */}
      <TriagePriorityBadge urgency={validatedUrgency} />

      {/* 2. Clinical Brief Card */}
      <ClinicalBriefCard 
        chiefComplaint={chiefComplaint}
        painScale={painScale}
      />

      {/* 3. Historical Context Section */}
      <HistoricalContextSection context={historicalContext} />

      {/* 4. Action Button Group */}
      <ActionButtonGroup 
        onOrderMRI={onOrderMRI}
        onGenerateReferral={onGenerateReferral}
      />
    </div>
  );
}
