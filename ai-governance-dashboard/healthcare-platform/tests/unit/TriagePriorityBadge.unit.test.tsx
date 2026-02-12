/**
 * Unit Tests for TriagePriorityBadge Component
 * 
 * These tests verify specific examples and edge cases for the
 * TriagePriorityBadge component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TriagePriorityBadge } from '@/components/physician-mobile-dashboard/TriagePriorityBadge';

describe('TriagePriorityBadge Unit Tests', () => {
  describe('Urgency Level Rendering', () => {
    it('should render High urgency with red badge', () => {
      const { container } = render(<TriagePriorityBadge urgency="High" />);
      const badge = container.querySelector('[role="status"]');
      
      expect(badge).toBeTruthy();
      expect(badge?.className).toContain('badge-high');
      expect(screen.getByText('Priority: High')).toBeInTheDocument();
    });

    it('should render Medium urgency with amber badge', () => {
      const { container } = render(<TriagePriorityBadge urgency="Medium" />);
      const badge = container.querySelector('[role="status"]');
      
      expect(badge).toBeTruthy();
      expect(badge?.className).toContain('badge-medium');
      expect(screen.getByText('Priority: Medium')).toBeInTheDocument();
    });

    it('should render Low urgency with teal badge', () => {
      const { container } = render(<TriagePriorityBadge urgency="Low" />);
      const badge = container.querySelector('[role="status"]');
      
      expect(badge).toBeTruthy();
      expect(badge?.className).toContain('badge-low');
      expect(screen.getByText('Priority: Low')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" for screen readers', () => {
      render(<TriagePriorityBadge urgency="High" />);
      const badge = screen.getByRole('status');
      
      expect(badge).toBeInTheDocument();
    });

    it('should have descriptive aria-label for High urgency', () => {
      render(<TriagePriorityBadge urgency="High" />);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveAttribute('aria-label', 'Patient urgency level: High');
    });

    it('should have descriptive aria-label for Medium urgency', () => {
      render(<TriagePriorityBadge urgency="Medium" />);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveAttribute('aria-label', 'Patient urgency level: Medium');
    });

    it('should have descriptive aria-label for Low urgency', () => {
      render(<TriagePriorityBadge urgency="Low" />);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveAttribute('aria-label', 'Patient urgency level: Low');
    });

    it('should display urgency text (not color-only indication)', () => {
      render(<TriagePriorityBadge urgency="High" />);
      
      // Text should be visible, not just color
      expect(screen.getByText('Priority: High')).toBeInTheDocument();
    });

    it('should include visual indicator with aria-hidden', () => {
      const { container } = render(<TriagePriorityBadge urgency="High" />);
      const indicator = container.querySelector('[aria-hidden="true"]');
      
      expect(indicator).toBeInTheDocument();
      expect(indicator?.textContent).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(
        <TriagePriorityBadge urgency="High" className="custom-class" />
      );
      const badge = container.querySelector('[role="status"]');
      
      expect(badge?.className).toContain('custom-class');
    });

    it('should have responsive text sizing classes', () => {
      const { container } = render(<TriagePriorityBadge urgency="High" />);
      const badge = container.querySelector('[role="status"]');
      
      // Should have text-sm for mobile and md:text-base for tablet+
      expect(badge?.className).toContain('text-sm');
      expect(badge?.className).toContain('md:text-base');
    });

    it('should have rounded corners', () => {
      const { container } = render(<TriagePriorityBadge urgency="High" />);
      const badge = container.querySelector('[role="status"]');
      
      expect(badge?.className).toContain('rounded-lg');
    });

    it('should have appropriate padding', () => {
      const { container } = render(<TriagePriorityBadge urgency="High" />);
      const badge = container.querySelector('[role="status"]');
      
      expect(badge?.className).toContain('px-3');
      expect(badge?.className).toContain('py-2');
    });

    it('should have semibold font weight', () => {
      const { container } = render(<TriagePriorityBadge urgency="High" />);
      const badge = container.querySelector('[role="status"]');
      
      expect(badge?.className).toContain('font-semibold');
    });
  });

  describe('Visual Indicators', () => {
    it('should display red circle indicator for High urgency', () => {
      const { container } = render(<TriagePriorityBadge urgency="High" />);
      const indicator = container.querySelector('[aria-hidden="true"]');
      
      expect(indicator?.textContent).toBe('🔴');
    });

    it('should display yellow circle indicator for Medium urgency', () => {
      const { container } = render(<TriagePriorityBadge urgency="Medium" />);
      const indicator = container.querySelector('[aria-hidden="true"]');
      
      expect(indicator?.textContent).toBe('🟡');
    });

    it('should display green circle indicator for Low urgency', () => {
      const { container } = render(<TriagePriorityBadge urgency="Low" />);
      const indicator = container.querySelector('[aria-hidden="true"]');
      
      expect(indicator?.textContent).toBe('🟢');
    });
  });
});
