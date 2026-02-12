# Implementation Plan: Physician's Mobile Dashboard

## Overview

This implementation plan breaks down the Physician's Mobile Dashboard feature into discrete coding tasks. The dashboard is a React component built with Next.js 15, TypeScript, and Tailwind CSS v4, providing mobile-optimized access to patient triage information and clinical actions.

The implementation follows a bottom-up approach: building individual sub-components first, then composing them into the main dashboard, and finally adding comprehensive testing.

## Tasks

- [x] 1. Set up project structure and TypeScript interfaces
  - Create directory: `components/physician-mobile-dashboard/`
  - Define TypeScript interfaces in `types.ts` (UrgencyLevel, PhysicianMobileDashboardProps, etc.)
  - Set up Tailwind CSS v4 custom theme extensions for healthcare colors
  - Configure fast-check for property-based testing
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 2. Implement TriagePriorityBadge component
  - [x] 2.1 Create TriagePriorityBadge component with urgency color mapping
    - Implement component with props interface (TriagePriorityBadgeProps)
    - Add color mapping logic (High→red, Medium→amber, Low→teal)
    - Include urgency text label display
    - Add ARIA attributes (role="status", aria-label)
    - Apply Tailwind classes for styling and responsive sizing
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 6.7_
  
  - [x] 2.2 Write property test for urgency color mapping
    - **Property 1: Urgency Level Color Mapping**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [x] 2.3 Write property test for urgency text display
    - **Property 2: Urgency Text Display**
    - **Validates: Requirements 1.5, 6.7**
  
  - [x] 2.4 Write unit tests for TriagePriorityBadge
    - Test each urgency level renders with correct color
    - Test ARIA attributes are present
    - Test responsive sizing at different viewports
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 3. Implement ClinicalBriefCard component
  - [x] 3.1 Create ClinicalBriefCard with chief complaint and pain scale display
    - Implement component with props interface (ClinicalBriefCardProps)
    - Add chief complaint text display
    - Add pain scale display with formatting ("Pain Level: X/10")
    - Add pain scale color coding (0-3 green, 4-6 amber, 7-10 red)
    - Implement pain scale validation and clamping logic
    - Apply Tailwind classes for card styling
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [x] 3.2 Write property test for chief complaint display
    - **Property 4: Chief Complaint Display**
    - **Validates: Requirements 2.1**
  
  - [x] 3.3 Write property test for pain scale display
    - **Property 5: Pain Scale Display and Validation**
    - **Validates: Requirements 2.2, 2.5**
  
  - [x] 3.4 Write property test for invalid pain scale handling
    - **Property 6: Invalid Pain Scale Handling**
    - **Validates: Requirements 2.3**
  
  - [x] 3.5 Write unit tests for ClinicalBriefCard
    - Test specific pain scale values display correctly
    - Test pain scale color coding at boundaries (3, 4, 6, 7)
    - Test invalid pain scale values (negative, > 10, NaN)
    - Test empty chief complaint handling
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 4. Implement HistoricalContextSection component
  - [x] 4.1 Create HistoricalContextSection with context display
    - Implement component with props interface (HistoricalContextSectionProps)
    - Add logic to handle string or array input
    - Implement empty state handling
    - Apply soft blue background styling with border-left accent
    - Use semantic HTML (aside element)
    - Add ARIA label
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [x] 4.2 Write property test for historical context display
    - **Property 7: Historical Context Display**
    - **Validates: Requirements 3.1**
  
  - [x] 4.3 Write unit tests for HistoricalContextSection
    - Test string input displays correctly
    - Test array input displays as list
    - Test empty/undefined input shows fallback message
    - Test styling (blue background, border-left)
    - _Requirements: 3.1, 3.4_

- [x] 5. Implement ActionButtonGroup component
  - [x] 5.1 Create ActionButtonGroup with touch-optimized buttons
    - Implement component with props interface (ActionButtonGroupProps)
    - Create "Order MRI" button with primary styling (Healing Teal)
    - Create "Generate Specialist Referral" button with secondary styling
    - Implement minimum 48px touch target dimensions
    - Add horizontal layout with gap spacing (minimum 12px)
    - Add ARIA labels for buttons
    - Implement keyboard accessibility (tab order, Enter/Space handlers)
    - Add hover, active, and focus states
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 5.1, 5.2, 5.3, 6.5, 6.6_
  
  - [x] 5.2 Write property test for button callback invocation
    - **Property 8: Action Button Callback Invocation**
    - **Validates: Requirements 4.4**
  
  - [x] 5.3 Write property test for touch target dimensions
    - **Property 9: Touch Target Minimum Dimensions**
    - **Validates: Requirements 5.1, 5.2**
  
  - [x] 5.4 Write property test for touch target spacing
    - **Property 10: Touch Target Spacing**
    - **Validates: Requirements 5.3**
  
  - [x] 5.5 Write unit tests for ActionButtonGroup
    - Test button click handlers are called
    - Test button dimensions meet 48px minimum
    - Test spacing between buttons
    - Test keyboard navigation (Tab, Enter, Space)
    - Test ARIA labels are present
    - _Requirements: 4.4, 5.1, 5.2, 5.3, 6.5, 6.6_

- [x] 6. Checkpoint - Ensure all sub-component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement main PhysicianMobileDashboard component
  - [x] 7.1 Create PhysicianMobileDashboard container component
    - Implement component with props interface (PhysicianMobileDashboardProps)
    - Add 'use client' directive for Next.js 15
    - Compose all sub-components in correct order
    - Implement props validation and normalization
    - Add error boundary wrapper
    - Apply responsive layout classes (flexbox column, gap spacing)
    - Add mobile-first responsive styling
    - Implement card container with shadow
    - _Requirements: 1.4, 2.4, 3.3, 4.3, 7.1, 7.2, 7.3, 7.4, 9.7_
  
  - [x] 7.2 Write property test for component hierarchical ordering
    - **Property 3: Component Hierarchical Ordering**
    - **Validates: Requirements 1.4, 2.4, 3.3, 4.3**
  
  - [x] 7.3 Write property test for mobile viewport layout
    - **Property 14: Mobile Viewport Single-Column Layout**
    - **Validates: Requirements 7.1**
  
  - [x] 7.4 Write property test for responsive spacing
    - **Property 15: Responsive Spacing Adaptation**
    - **Validates: Requirements 7.2, 7.4**
  
  - [x] 7.5 Write property test for props interface acceptance
    - **Property 16: Props Interface Acceptance**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**
  
  - [x] 7.6 Write property test for missing props handling
    - **Property 17: Missing Required Props Handling**
    - **Validates: Requirements 9.7**
  
  - [x] 7.7 Write unit tests for PhysicianMobileDashboard
    - Test component renders all sub-components
    - Test component order in DOM
    - Test responsive behavior at breakpoints (320px, 768px, 1024px)
    - Test error boundary catches rendering errors
    - Test missing props show appropriate fallbacks
    - _Requirements: 1.4, 2.4, 3.3, 4.3, 7.1, 7.2, 9.7_

- [x] 8. Implement accessibility compliance
  - [x] 8.1 Add WCAG 2.1 AA contrast ratio verification
    - Create utility function to calculate contrast ratios
    - Verify all text/background combinations meet 4.5:1 minimum
    - Document color combinations and their contrast ratios
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 8.2 Write property test for contrast ratio compliance
    - **Property 11: WCAG Contrast Ratio Compliance**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  
  - [x] 8.3 Write property test for ARIA labels
    - **Property 12: ARIA Labels for Interactive Elements**
    - **Validates: Requirements 6.5**
  
  - [x] 8.4 Write property test for keyboard navigation
    - **Property 13: Keyboard Navigation Support**
    - **Validates: Requirements 6.6**
  
  - [x] 8.5 Write accessibility unit tests
    - Run jest-axe on rendered component
    - Test screen reader announcements
    - Test focus management
    - Test keyboard-only navigation flow
    - _Requirements: 6.5, 6.6_

- [x] 9. Create example usage and documentation
  - [x] 9.1 Create example page demonstrating dashboard usage
    - Create Next.js page: `app/examples/physician-dashboard/page.tsx`
    - Add example with different urgency levels
    - Add example with various pain scale values
    - Add example with historical context
    - Implement mock callback handlers
    - Add responsive preview at different viewport sizes
    - _Requirements: All requirements (demonstration)_
  
  - [x] 9.2 Create component documentation
    - Document props interface with JSDoc comments
    - Add usage examples in component file
    - Document accessibility features
    - Document responsive behavior
    - Add troubleshooting guide for common issues
    - _Requirements: All requirements (documentation)_

- [x] 10. Final checkpoint - Ensure all tests pass and accessibility audit passes
  - Run full test suite (unit + property tests)
  - Run accessibility audit with jest-axe
  - Test on real mobile devices (iOS and Android)
  - Verify responsive behavior at all breakpoints
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- All interactive elements must meet WCAG 2.1 AA accessibility standards
- Touch targets must be minimum 48px for mobile accessibility
- Component uses 'use client' directive for Next.js 15 Client Component
