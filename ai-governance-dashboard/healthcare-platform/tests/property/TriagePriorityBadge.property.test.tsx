/**
 * Property-Based Tests for TriagePriorityBadge Component
 * 
 * These tests verify universal properties that should hold true
 * for all valid inputs using fast-check library.
 * 
 * Each test runs a minimum of 100 iterations with randomized inputs.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { TriagePriorityBadge } from '@/components/physician-mobile-dashboard/TriagePriorityBadge';
import { UrgencyLevel } from '@/components/physician-mobile-dashboard/types';

// Test configuration: minimum 100 iterations per property test
const testConfig = { numRuns: 100 };

describe('TriagePriorityBadge Property-Based Tests', () => {
  /**
   * Property 1: Urgency Level Color Mapping
   * 
   * For any urgency level (High, Medium, or Low), the Triage Priority Badge
   * should display with the correct corresponding background color:
   * - High → red (badge-high class)
   * - Medium → amber (badge-medium class)
   * - Low → teal (badge-low class)
   * 
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  it('Property 1: Urgency Level Color Mapping', () => {
    // Feature: physician-mobile-dashboard, Property 1: Urgency Level Color Mapping
    fc.assert(
      fc.property(
        fc.constantFrom<UrgencyLevel>('High', 'Medium', 'Low'),
        (urgency) => {
          const { container, unmount } = render(<TriagePriorityBadge urgency={urgency} />);
          const badge = container.querySelector('[role="status"]');
          
          expect(badge).toBeTruthy();
          
          // Verify correct CSS class is applied based on urgency level
          if (urgency === 'High') {
            expect(badge?.className).toContain('badge-high');
          } else if (urgency === 'Medium') {
            expect(badge?.className).toContain('badge-medium');
          } else if (urgency === 'Low') {
            expect(badge?.className).toContain('badge-low');
          }
          
          // Clean up after each iteration
          unmount();
        }
      ),
      testConfig
    );
  });

  /**
   * Property 2: Urgency Text Display
   * 
   * For any urgency level, the Triage Priority Badge should display
   * the urgency level text within the rendered output, ensuring
   * information is not conveyed by color alone.
   * 
   * Validates: Requirements 1.5, 6.7
   */
  it('Property 2: Urgency Text Display', () => {
    // Feature: physician-mobile-dashboard, Property 2: Urgency Text Display
    fc.assert(
      fc.property(
        fc.constantFrom<UrgencyLevel>('High', 'Medium', 'Low'),
        (urgency) => {
          const { unmount } = render(<TriagePriorityBadge urgency={urgency} />);
          
          // Verify urgency text is displayed
          const priorityText = screen.getByText(`Priority: ${urgency}`);
          expect(priorityText).toBeInTheDocument();
          
          // Verify ARIA label includes urgency level
          const badge = screen.getByRole('status');
          expect(badge).toHaveAttribute('aria-label', `Patient urgency level: ${urgency}`);
          
          // Clean up after each iteration
          unmount();
        }
      ),
      testConfig
    );
  });
});
