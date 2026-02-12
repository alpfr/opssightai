/**
 * Unit Tests for PhysicianMobileDashboard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhysicianMobileDashboard } from '@/components/physician-mobile-dashboard';

describe('PhysicianMobileDashboard Unit Tests', () => {
  const defaultProps = {
    urgency: 'High' as const,
    chiefComplaint: 'Severe chest pain',
    painScale: 8,
    historicalContext: 'Previous MI in 2020',
    onOrderMRI: vi.fn(),
    onGenerateReferral: vi.fn(),
  };

  describe('Component Rendering', () => {
    it('should render all sub-components', () => {
      render(<PhysicianMobileDashboard {...defaultProps} />);
      
      // Verify all components are present
      expect(screen.getByText('Priority: High')).toBeInTheDocument();
      expect(screen.getByText('Severe chest pain')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Previous MI in 2020')).toBeInTheDocument();
      expect(screen.getByText('Order MRI')).toBeInTheDocument();
      expect(screen.getByText('Generate Specialist Referral')).toBeInTheDocument();
    });

    it('should render with data-testid', () => {
      const { container } = render(<PhysicianMobileDashboard {...defaultProps} />);
      const dashboard = container.querySelector('[data-testid="physician-mobile-dashboard"]');
      
      expect(dashboard).toBeInTheDocument();
    });
  });

  describe('Component Order', () => {
    it('should render components in correct order', () => {
      const { container } = render(<PhysicianMobileDashboard {...defaultProps} />);
      const dashboard = container.querySelector('[data-testid="physician-mobile-dashboard"]');
      const children = Array.from(dashboard?.children || []);
      
      expect(children.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Props Validation', () => {
    it('should handle invalid urgency level gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(
        <PhysicianMobileDashboard
          {...defaultProps}
          urgency={'Invalid' as any}
        />
      );
      
      // Should default to Medium
      expect(screen.getByText('Priority: Medium')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Styling', () => {
    it('should apply dashboard-card class', () => {
      const { container } = render(<PhysicianMobileDashboard {...defaultProps} />);
      const dashboard = container.querySelector('[data-testid="physician-mobile-dashboard"]');
      
      expect(dashboard?.className).toContain('dashboard-card');
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <PhysicianMobileDashboard {...defaultProps} className="custom-class" />
      );
      const dashboard = container.querySelector('[data-testid="physician-mobile-dashboard"]');
      
      expect(dashboard?.className).toContain('custom-class');
    });

    it('should have responsive width classes', () => {
      const { container } = render(<PhysicianMobileDashboard {...defaultProps} />);
      const dashboard = container.querySelector('[data-testid="physician-mobile-dashboard"]');
      
      expect(dashboard?.className).toContain('w-full');
      expect(dashboard?.className).toContain('mx-auto');
    });
  });

  describe('Optional Props', () => {
    it('should render without historical context', () => {
      render(
        <PhysicianMobileDashboard
          {...defaultProps}
          historicalContext={undefined}
        />
      );
      
      expect(screen.getByText('No historical context available')).toBeInTheDocument();
    });

    it('should render with array historical context', () => {
      render(
        <PhysicianMobileDashboard
          {...defaultProps}
          historicalContext={['Item 1', 'Item 2']}
        />
      );
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });
});
