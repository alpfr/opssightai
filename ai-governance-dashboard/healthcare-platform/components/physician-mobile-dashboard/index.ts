/**
 * Physician's Mobile Dashboard - Component Exports
 * 
 * This module exports all components and types for the
 * Physician's Mobile Dashboard feature.
 */

// Main component
export { PhysicianMobileDashboard } from './PhysicianMobileDashboard';

// Sub-components (exported for testing and flexibility)
export { TriagePriorityBadge } from './TriagePriorityBadge';
export { ClinicalBriefCard } from './ClinicalBriefCard';
export { HistoricalContextSection } from './HistoricalContextSection';
export { ActionButtonGroup } from './ActionButtonGroup';

// Types and utilities
export type {
  UrgencyLevel,
  PainScaleValue,
  HistoricalContext,
  PhysicianMobileDashboardProps,
  TriagePriorityBadgeProps,
  ClinicalBriefCardProps,
  HistoricalContextSectionProps,
  ActionButtonGroupProps,
} from './types';

export {
  isValidUrgency,
  validatePainScale,
  normalizeHistoricalContext,
} from './types';
