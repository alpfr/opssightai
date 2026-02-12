/**
 * Property-Based Tests for ClinicalBriefCard Component
 * 
 * These tests verify universal properties that should hold true
 * for all valid inputs using fast-check library.
 * 
 * Each test runs a minimum of 100 iterations with randomized inputs.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { ClinicalBriefCard } from '@/components/physician-mobile-dashboard/ClinicalBriefCard';

// Test configuration: minimum 100 iterations per property test
const testConfig = { numRuns: 100 };

describe('ClinicalBriefCard Property-Based Tests', () => {
  /**
   * Property 4: Chief Complaint Display
   * 
   * For any non-empty chief complaint string, the Clinical Brief Card
   * should display that exact text in the rendered output.
   * 
   * Validates: Requirements 2.1
   */
  it('Property 4: Chief Complaint Display', () => {
    // Feature: physician-mobile-dashboard, Property 4: Chief Complaint Display
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 0, max: 10 }),
        (chiefComplaint, painScale) => {
          const { unmount } = render(
            <ClinicalBriefCard 
              chiefComplaint={chiefComplaint} 
              painScale={painScale} 
            />
          );
          
          // Verify chief complaint text is displayed (using flexible text matcher)
          const complaintElement = screen.getByText((content, element) => {
            return element?.textContent === chiefComplaint;
          });
          expect(complaintElement).toBeInTheDocument();
          
          // Clean up
          unmount();
        }
      ),
      testConfig
    );
  });

  /**
   * Property 5: Pain Scale Display and Validation
   * 
   * For any pain scale value between 0 and 10 (inclusive), the Clinical
   * Brief Card should display that value with appropriate labeling.
   * 
   * Validates: Requirements 2.2, 2.5
   */
  it('Property 5: Pain Scale Display and Validation', () => {
    // Feature: physician-mobile-dashboard, Property 5: Pain Scale Display and Validation
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (painScale, chiefComplaint) => {
          const { unmount } = render(
            <ClinicalBriefCard 
              chiefComplaint={chiefComplaint} 
              painScale={painScale} 
            />
          );
          
          // Verify pain scale value is displayed
          const painValue = screen.getByText(painScale.toString());
          expect(painValue).toBeInTheDocument();
          
          // Verify "/10" suffix is displayed
          expect(screen.getByText('/10')).toBeInTheDocument();
          
          // Verify ARIA label includes pain scale value
          const painElement = screen.getByLabelText(`Patient pain scale: ${painScale} out of 10`);
          expect(painElement).toBeInTheDocument();
          
          // Clean up
          unmount();
        }
      ),
      testConfig
    );
  });

  /**
   * Property 6: Invalid Pain Scale Handling
   * 
   * For any pain scale value outside the range 0-10 or non-numeric values,
   * the component should handle the invalid input gracefully without crashing.
   * 
   * Validates: Requirements 2.3
   */
  it('Property 6: Invalid Pain Scale Handling', () => {
    // Feature: physician-mobile-dashboard, Property 6: Invalid Pain Scale Handling
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: -100, max: -1 }), // Negative values
          fc.integer({ min: 11, max: 100 }),  // Values > 10
          fc.constant(NaN),                    // NaN
          fc.constant(Infinity),               // Infinity
          fc.constant(-Infinity)               // -Infinity
        ),
        fc.string({ minLength: 1, maxLength: 100 }),
        (painScale, chiefComplaint) => {
          // Should not crash
          const { unmount } = render(
            <ClinicalBriefCard 
              chiefComplaint={chiefComplaint} 
              painScale={painScale} 
            />
          );
          
          // Should display N/A for invalid values
          const naElement = screen.getByText('N/A');
          expect(naElement).toBeInTheDocument();
          
          // Should have appropriate ARIA label
          const painElement = screen.getByLabelText('Patient pain scale: not available');
          expect(painElement).toBeInTheDocument();
          
          // Clean up
          unmount();
        }
      ),
      testConfig
    );
  });
});
