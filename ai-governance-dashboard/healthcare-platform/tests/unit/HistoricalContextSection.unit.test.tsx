/**
 * Unit Tests for HistoricalContextSection Component
 * 
 * These tests verify specific examples and edge cases for the
 * HistoricalContextSection component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoricalContextSection } from '@/components/physician-mobile-dashboard/HistoricalContextSection';

describe('HistoricalContextSection Unit Tests', () => {
  describe('String Input', () => {
    it('should display single string as paragraph', () => {
      const context = 'Previous MI in 2020';
      render(<HistoricalContextSection context={context} />);
      
      expect(screen.getByText(context)).toBeInTheDocument();
    });

    it('should display long string correctly', () => {
      const context = 'Patient has a history of hypertension diagnosed in 2018, with multiple emergency room visits for chest pain';
      render(<HistoricalContextSection context={context} />);
      
      expect(screen.getByText(context)).toBeInTheDocument();
    });
  });

  describe('Array Input', () => {
    it('should display array of strings as bulleted list', () => {
      const context = [
        'Previous MI in 2020',
        'Hypertension diagnosed 2018',
        'Type 2 Diabetes since 2015'
      ];
      render(<HistoricalContextSection context={context} />);
      
      context.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should render list items with proper structure', () => {
      const context = ['Item 1', 'Item 2'];
      const { container } = render(<HistoricalContextSection context={context} />);
      
      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
      
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(2);
    });

    it('should display single-item array as paragraph', () => {
      const context = ['Single medical history item'];
      const { container } = render(<HistoricalContextSection context={context} />);
      
      // Single item should be displayed as paragraph, not list
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph?.textContent).toBe(context[0]);
    });
  });

  describe('Empty State', () => {
    it('should display fallback message for undefined context', () => {
      render(<HistoricalContextSection context={undefined} />);
      
      expect(screen.getByText('No historical context available')).toBeInTheDocument();
    });

    it('should display fallback message for empty string', () => {
      render(<HistoricalContextSection context="" />);
      
      expect(screen.getByText('No historical context available')).toBeInTheDocument();
    });

    it('should display fallback message for empty array', () => {
      render(<HistoricalContextSection context={[]} />);
      
      expect(screen.getByText('No historical context available')).toBeInTheDocument();
    });

    it('should display fallback message for array with empty strings', () => {
      render(<HistoricalContextSection context={['', '  ', '']} />);
      
      expect(screen.getByText('No historical context available')).toBeInTheDocument();
    });

    it('should style empty state with italic text', () => {
      render(<HistoricalContextSection context={undefined} />);
      const fallbackText = screen.getByText('No historical context available');
      
      expect(fallbackText.className).toContain('italic');
      expect(fallbackText.className).toContain('text-blue-600');
    });
  });

  describe('Accessibility', () => {
    it('should use aside element for semantic HTML', () => {
      const { container } = render(<HistoricalContextSection context="Test" />);
      const aside = container.querySelector('aside');
      
      expect(aside).toBeInTheDocument();
    });

    it('should have ARIA label', () => {
      render(<HistoricalContextSection context="Test" />);
      const section = screen.getByLabelText('Historical medical context');
      
      expect(section).toBeInTheDocument();
    });

    it('should have ARIA label even with empty context', () => {
      render(<HistoricalContextSection context={undefined} />);
      const section = screen.getByLabelText('Historical medical context');
      
      expect(section).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have soft blue background', () => {
      const { container } = render(<HistoricalContextSection context="Test" />);
      const aside = container.querySelector('aside');
      
      expect(aside?.className).toContain('bg-blue-100');
    });

    it('should have blue left border', () => {
      const { container } = render(<HistoricalContextSection context="Test" />);
      const aside = container.querySelector('aside');
      
      expect(aside?.className).toContain('border-l-4');
      expect(aside?.className).toContain('border-blue-500');
    });

    it('should have rounded corners', () => {
      const { container } = render(<HistoricalContextSection context="Test" />);
      const aside = container.querySelector('aside');
      
      expect(aside?.className).toContain('rounded-md');
    });

    it('should have padding', () => {
      const { container } = render(<HistoricalContextSection context="Test" />);
      const aside = container.querySelector('aside');
      
      expect(aside?.className).toContain('p-4');
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <HistoricalContextSection context="Test" className="custom-class" />
      );
      const aside = container.querySelector('aside');
      
      expect(aside?.className).toContain('custom-class');
    });
  });

  describe('Section Header', () => {
    it('should display "Historical Context" header', () => {
      render(<HistoricalContextSection context="Test" />);
      
      expect(screen.getByText('Historical Context')).toBeInTheDocument();
    });

    it('should style header appropriately', () => {
      render(<HistoricalContextSection context="Test" />);
      const header = screen.getByText('Historical Context');
      
      expect(header.className).toContain('text-xs');
      expect(header.className).toContain('font-medium');
      expect(header.className).toContain('text-blue-900');
      expect(header.className).toContain('uppercase');
    });
  });

  describe('Content Filtering', () => {
    it('should filter out empty strings from array', () => {
      const context = ['Valid item', '', 'Another valid item', '  '];
      render(<HistoricalContextSection context={context} />);
      
      expect(screen.getByText('Valid item')).toBeInTheDocument();
      expect(screen.getByText('Another valid item')).toBeInTheDocument();
      
      // Should only have 2 list items (empty strings filtered out)
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });
});
