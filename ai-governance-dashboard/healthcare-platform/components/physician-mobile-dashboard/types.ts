/**
 * TypeScript interfaces and types for Physician's Mobile Dashboard
 * 
 * This file defines all the core data types and component prop interfaces
 * used throughout the dashboard component hierarchy.
 */

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * Urgency level enumeration for patient triage priority
 * - High: Critical/urgent cases requiring immediate attention
 * - Medium: Moderate priority cases
 * - Low: Non-urgent cases
 */
export type UrgencyLevel = 'High' | 'Medium' | 'Low';

/**
 * Pain scale value with validation metadata
 */
export interface PainScaleValue {
  value: number;
  isValid: boolean;
  normalizedValue: number; // Clamped to 0-10
}

/**
 * Historical medical context structure
 */
export interface HistoricalContext {
  recurrences: string[];
  lastOccurrence?: Date;
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

/**
 * Main dashboard component props
 */
export interface PhysicianMobileDashboardProps {
  /** Patient urgency level (High, Medium, or Low) */
  urgency: UrgencyLevel;
  
  /** Patient's chief complaint description */
  chiefComplaint: string;
  
  /** Patient's pain scale value (0-10) */
  painScale: number;
  
  /** Historical medical context (string or array of strings) */
  historicalContext?: string | string[];
  
  /** Callback when "Order MRI" button is clicked */
  onOrderMRI: () => void;
  
  /** Callback when "Generate Specialist Referral" button is clicked */
  onGenerateReferral: () => void;
  
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Triage Priority Badge component props
 */
export interface TriagePriorityBadgeProps {
  /** Patient urgency level */
  urgency: UrgencyLevel;
  
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Clinical Brief Card component props
 */
export interface ClinicalBriefCardProps {
  /** Patient's chief complaint */
  chiefComplaint: string;
  
  /** Patient's pain scale (0-10) */
  painScale: number;
  
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Historical Context Section component props
 */
export interface HistoricalContextSectionProps {
  /** Historical medical context (string or array) */
  context?: string | string[];
  
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Action Button Group component props
 */
export interface ActionButtonGroupProps {
  /** Callback for Order MRI action */
  onOrderMRI: () => void;
  
  /** Callback for Generate Referral action */
  onGenerateReferral: () => void;
  
  /** Optional additional CSS classes */
  className?: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Type guard to validate urgency level
 * @param value - Value to check
 * @returns True if value is a valid UrgencyLevel
 */
export function isValidUrgency(value: unknown): value is UrgencyLevel {
  return typeof value === 'string' && 
         ['High', 'Medium', 'Low'].includes(value);
}

/**
 * Validates and normalizes pain scale value
 * @param value - Pain scale value to validate
 * @returns Validation result with normalized value
 */
export function validatePainScale(value: number): PainScaleValue {
  const isValid = typeof value === 'number' && 
                  value >= 0 && 
                  value <= 10 && 
                  !isNaN(value);
  
  const normalizedValue = Math.max(0, Math.min(10, Math.round(value)));
  
  return { value, isValid, normalizedValue };
}

/**
 * Normalizes historical context to array format
 * @param context - Historical context (string, array, or undefined)
 * @returns Array of context strings
 */
export function normalizeHistoricalContext(
  context: string | string[] | undefined
): string[] {
  if (!context) return [];
  if (typeof context === 'string') {
    // Return array with string only if it's not empty after trimming
    return context.trim().length > 0 ? [context] : [];
  }
  // Filter out empty or whitespace-only strings
  return context.filter(item => typeof item === 'string' && item.trim().length > 0);
}
