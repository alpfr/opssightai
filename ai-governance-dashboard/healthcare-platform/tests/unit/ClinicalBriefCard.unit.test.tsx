/**
 * Unit Tests for ClinicalBriefCard Component
 * 
 * These tests verify specific examples and edge cases for the
 * ClinicalBriefCard component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClinicalBriefCard } from '@/components/physician-mobile-dashboard/ClinicalBriefCard';

describe('ClinicalBriefCard Unit Tests', () => {
  describe('Chief Complaint Display', () => {
    it('should display chief complaint text', () => {
      const complaint = 'Severe chest pain radiating to left arm';
      render(<ClinicalBriefCard chiefComplaint={complaint} painScale={8} />);
      
      expect(screen.getByText(complaint)).toBeInTheDocument();
    });

    it('should display fallback message for empty chief complaint', () => {
      render(<ClinicalBriefCard chiefComplaint="" painScale={5} />);
      
      expect(screen.getByText('No chief complaint provided')).toBeInTheDocument();
    });

    it('should display fallback message for whitespace-only chief complaint', () => {
      render(<ClinicalBriefCard chiefComplaint="   " painScale={5} />);
      
      expect(screen.getByText('No chief complaint provided')).toBeInTheDocument();
    });

    it('should style empty complaint with muted text', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="" painScale={5} />);
      const complaintText = screen.getByText('No chief complaint provided');
      
      expect(complaintText.className).toContain('text-gray-400');
      expect(complaintText.className).toContain('italic');
    });
  });

  describe('Pain Scale Display', () => {
    it('should display pain scale value with /10 suffix', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={7} />);
      
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('/10')).toBeInTheDocument();
    });

    it('should display pain scale 0', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={0} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display pain scale 10', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={10} />);
      
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should have ARIA label for pain scale', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={5} />);
      
      const painElement = screen.getByLabelText('Patient pain scale: 5 out of 10');
      expect(painElement).toBeInTheDocument();
    });
  });

  describe('Pain Scale Color Coding', () => {
    it('should apply green color for low pain (0-3)', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="Test" painScale={2} />);
      const painValue = screen.getByText('2');
      
      expect(painValue.className).toContain('pain-low');
      expect(screen.getByText('Mild pain')).toBeInTheDocument();
    });

    it('should apply green color for pain scale 3 (boundary)', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="Test" painScale={3} />);
      const painValue = screen.getByText('3');
      
      expect(painValue.className).toContain('pain-low');
    });

    it('should apply amber color for medium pain (4-6)', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="Test" painScale={5} />);
      const painValue = screen.getByText('5');
      
      expect(painValue.className).toContain('pain-medium');
      expect(screen.getByText('Moderate pain')).toBeInTheDocument();
    });

    it('should apply amber color for pain scale 4 (boundary)', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="Test" painScale={4} />);
      const painValue = screen.getByText('4');
      
      expect(painValue.className).toContain('pain-medium');
    });

    it('should apply amber color for pain scale 6 (boundary)', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="Test" painScale={6} />);
      const painValue = screen.getByText('6');
      
      expect(painValue.className).toContain('pain-medium');
    });

    it('should apply red color for high pain (7-10)', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="Test" painScale={8} />);
      const painValue = screen.getByText('8');
      
      expect(painValue.className).toContain('pain-high');
      expect(screen.getByText('Severe pain')).toBeInTheDocument();
    });

    it('should apply red color for pain scale 7 (boundary)', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="Test" painScale={7} />);
      const painValue = screen.getByText('7');
      
      expect(painValue.className).toContain('pain-high');
    });
  });

  describe('Invalid Pain Scale Handling', () => {
    it('should display N/A for negative pain scale', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={-5} />);
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
      expect(screen.getByLabelText('Patient pain scale: not available')).toBeInTheDocument();
    });

    it('should display N/A for pain scale > 10', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={15} />);
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should display N/A for NaN pain scale', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={NaN} />);
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should display N/A for Infinity pain scale', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={Infinity} />);
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should not crash with invalid pain scale', () => {
      expect(() => {
        render(<ClinicalBriefCard chiefComplaint="Test" painScale={-100} />);
      }).not.toThrow();
    });
  });

  describe('Styling', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(
        <ClinicalBriefCard 
          chiefComplaint="Test" 
          painScale={5} 
          className="custom-class" 
        />
      );
      const card = container.firstChild;
      
      expect(card).toHaveClass('custom-class');
    });

    it('should have white background', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="Test" painScale={5} />);
      const card = container.firstChild;
      
      expect(card).toHaveClass('bg-white');
    });

    it('should have border and rounded corners', () => {
      const { container } = render(<ClinicalBriefCard chiefComplaint="Test" painScale={5} />);
      const card = container.firstChild;
      
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('rounded-lg');
    });

    it('should have responsive text sizing for chief complaint', () => {
      render(<ClinicalBriefCard chiefComplaint="Test complaint" painScale={5} />);
      const complaint = screen.getByText('Test complaint');
      
      expect(complaint.className).toContain('text-base');
      expect(complaint.className).toContain('md:text-lg');
    });

    it('should have large font size for pain scale value', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={5} />);
      const painValue = screen.getByText('5');
      
      expect(painValue.className).toContain('text-2xl');
      expect(painValue.className).toContain('md:text-3xl');
      expect(painValue.className).toContain('font-bold');
    });
  });

  describe('Section Headers', () => {
    it('should display "Chief Complaint" header', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={5} />);
      
      expect(screen.getByText('Chief Complaint')).toBeInTheDocument();
    });

    it('should display "Pain Level" header', () => {
      render(<ClinicalBriefCard chiefComplaint="Test" painScale={5} />);
      
      expect(screen.getByText('Pain Level')).toBeInTheDocument();
    });
  });
});
