/**
 * Unit Tests for ActionButtonGroup Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionButtonGroup } from '@/components/physician-mobile-dashboard/ActionButtonGroup';

describe('ActionButtonGroup Unit Tests', () => {
  describe('Button Rendering', () => {
    it('should render Order MRI button', () => {
      render(<ActionButtonGroup onOrderMRI={() => {}} onGenerateReferral={() => {}} />);
      expect(screen.getByText('Order MRI')).toBeInTheDocument();
    });

    it('should render Generate Specialist Referral button', () => {
      render(<ActionButtonGroup onOrderMRI={() => {}} onGenerateReferral={() => {}} />);
      expect(screen.getByText('Generate Specialist Referral')).toBeInTheDocument();
    });
  });

  describe('Button Click Handlers', () => {
    it('should call onOrderMRI when Order MRI button is clicked', async () => {
      const mockOrderMRI = vi.fn();
      const user = userEvent.setup();
      
      render(<ActionButtonGroup onOrderMRI={mockOrderMRI} onGenerateReferral={() => {}} />);
      
      await user.click(screen.getByText('Order MRI'));
      expect(mockOrderMRI).toHaveBeenCalledTimes(1);
    });

    it('should call onGenerateReferral when Generate Referral button is clicked', async () => {
      const mockGenerateReferral = vi.fn();
      const user = userEvent.setup();
      
      render(<ActionButtonGroup onOrderMRI={() => {}} onGenerateReferral={mockGenerateReferral} />);
      
      await user.click(screen.getByText('Generate Specialist Referral'));
      expect(mockGenerateReferral).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have ARIA label for Order MRI button', () => {
      render(<ActionButtonGroup onOrderMRI={() => {}} onGenerateReferral={() => {}} />);
      expect(screen.getByLabelText('Order MRI scan for patient')).toBeInTheDocument();
    });

    it('should have ARIA label for Generate Referral button', () => {
      render(<ActionButtonGroup onOrderMRI={() => {}} onGenerateReferral={() => {}} />);
      expect(screen.getByLabelText('Generate specialist referral for patient')).toBeInTheDocument();
    });

    it('should use semantic button elements', () => {
      const { container } = render(<ActionButtonGroup onOrderMRI={() => {}} onGenerateReferral={() => {}} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Touch Target Sizing', () => {
    it('should apply touch-target class to both buttons', () => {
      const { container } = render(<ActionButtonGroup onOrderMRI={() => {}} onGenerateReferral={() => {}} />);
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        expect(button.className).toContain('touch-target');
      });
    });
  });

  describe('Styling', () => {
    it('should style Order MRI as primary button', () => {
      render(<ActionButtonGroup onOrderMRI={() => {}} onGenerateReferral={() => {}} />);
      const button = screen.getByText('Order MRI');
      
      expect(button.className).toContain('bg-healing-teal');
      expect(button.className).toContain('text-white');
    });

    it('should style Generate Referral as secondary button', () => {
      render(<ActionButtonGroup onOrderMRI={() => {}} onGenerateReferral={() => {}} />);
      const button = screen.getByText('Generate Specialist Referral');
      
      expect(button.className).toContain('bg-white');
      expect(button.className).toContain('border-deep-slate');
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <ActionButtonGroup 
          onOrderMRI={() => {}} 
          onGenerateReferral={() => {}} 
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
