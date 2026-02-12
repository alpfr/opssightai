/**
 * Property-Based Tests for HistoricalContextSection Component
 * 
 * These tests verify universal properties that should hold true
 * for all valid inputs using fast-check library.
 * 
 * Each test runs a minimum of 100 iterations with randomized inputs.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { HistoricalContextSection } from '@/components/physician-mobile-dashboard/HistoricalContextSection';

// Test configuration: minimum 100 iterations per property test
const testConfig = { numRuns: 100 };

describe('HistoricalContextSection Property-Based Tests', () => {
  /**
   * Property 7: Historical Context Display
   * 
   * For any historical context data (string or array of strings),
   * the Historical Context Section should display that content
   * in the rendered output.
   * 
   * Validates: Requirements 3.1
   */
  it('Property 7: Historical Context Display', () => {
    // Feature: physician-mobile-dashboard, Property 7: Historical Context Display
    fc.assert(
      fc.property(
        fc.oneof(
          // Test with single non-empty string
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          // Test with array of non-empty strings
          fc.array(
            fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), 
            { minLength: 1, maxLength: 5 }
          )
        ),
        (context) => {
          const { container, unmount } = render(<HistoricalContextSection context={context} />);
          
          // Normalize context to array for verification
          const contextItems = Array.isArray(context) ? context : [context];
          
          // Verify each context item is displayed
          contextItems.forEach((item) => {
            if (item && item.trim().length > 0) {
              // Use container.textContent to check if item is present
              expect(container.textContent).toContain(item);
            }
          });
          
          // Clean up
          unmount();
        }
      ),
      testConfig
    );
  });
});
