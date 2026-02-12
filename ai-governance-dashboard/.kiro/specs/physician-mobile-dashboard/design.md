# Design Document: Physician's Mobile Dashboard

## Overview

The Physician's Mobile Dashboard is a React component built with Next.js 15, TypeScript, and Tailwind CSS v4. It provides a mobile-optimized interface for physicians to quickly assess patient urgency, review clinical information, and take common actions. The component follows a mobile-first design approach with WCAG 2.1 AA accessibility compliance and integrates with the existing healthcare platform theme.

The dashboard consists of four main visual sections stacked vertically:
1. Triage Priority Badge (top)
2. Clinical Brief Card
3. Historical Context Section
4. Action Buttons (bottom)

## Architecture

### Component Structure

```
PhysicianMobileDashboard (Container)
├── TriagePriorityBadge
├── ClinicalBriefCard
│   ├── ChiefComplaintDisplay
│   └── PainScaleDisplay
├── HistoricalContextSection
└── ActionButtonGroup
    ├── OrderMRIButton
    └── GenerateReferralButton
```

### Technology Stack

- **Framework**: Next.js 15 (React 18+)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **Accessibility**: ARIA attributes, semantic HTML
- **Testing**: Vitest for unit tests, fast-check for property-based tests

### Design Principles

1. **Mobile-First**: Design for smallest screens first, enhance for larger viewports
2. **Accessibility-First**: WCAG 2.1 AA compliance built in from the start
3. **Component Composition**: Small, focused components that compose into the dashboard
4. **Type Safety**: Strict TypeScript interfaces for all props and data structures
5. **Theme Integration**: Use healthcare platform design tokens

## Components and Interfaces

### TypeScript Interfaces

```typescript
// Core data types
type UrgencyLevel = 'High' | 'Medium' | 'Low';

interface PainScale {
  value: number; // 0-10
  label?: string;
}

interface HistoricalContext {
  recurrences: string[];
  lastOccurrence?: Date;
}

// Component props
interface PhysicianMobileDashboardProps {
  urgency: UrgencyLevel;
  chiefComplaint: string;
  painScale: number;
  historicalContext?: string | string[];
  onOrderMRI: () => void;
  onGenerateReferral: () => void;
  className?: string;
}

interface TriagePriorityBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

interface ClinicalBriefCardProps {
  chiefComplaint: string;
  painScale: number;
  className?: string;
}

interface HistoricalContextSectionProps {
  context: string | string[];
  className?: string;
}

interface ActionButtonGroupProps {
  onOrderMRI: () => void;
  onGenerateReferral: () => void;
  className?: string;
}
```

### Component Specifications

#### PhysicianMobileDashboard

The main container component that orchestrates all sub-components.

**Responsibilities:**
- Validate and normalize props
- Compose sub-components in correct order
- Apply responsive layout classes
- Handle prop defaults and error boundaries

**Props Validation:**
- `urgency`: Must be one of 'High', 'Medium', 'Low'
- `painScale`: Must be number between 0-10 (inclusive)
- `chiefComplaint`: Required non-empty string
- `onOrderMRI`, `onGenerateReferral`: Required callback functions

**Layout:**
- Flexbox column layout with gap spacing
- Full width on mobile, max-width constraint on larger screens
- Padding for touch-friendly spacing
- Card-style container with subtle shadow

#### TriagePriorityBadge

Displays urgency level with color-coded background and text label.

**Color Mapping:**
- High: Red background (#EF4444 or Tailwind red-500), white text
- Medium: Amber background (#F59E0B or Tailwind amber-500), white text
- Low: Teal background (#1ABC9C or Healing Teal), white text

**Accessibility:**
- ARIA role="status" for screen readers
- aria-label includes urgency level text
- Minimum 4.5:1 contrast ratio verified for all color combinations
- Text label always visible (not color-only indication)

**Styling:**
- Rounded corners (border-radius: 0.5rem)
- Padding: 0.75rem horizontal, 0.5rem vertical
- Font weight: 600 (semibold)
- Font size: 0.875rem (14px) on mobile, 1rem (16px) on tablet+

#### ClinicalBriefCard

Displays chief complaint and pain scale in a card format.

**Layout:**
- Two-section vertical layout
- Chief complaint: Larger text, primary color
- Pain scale: Numeric display with "/10" suffix and visual indicator

**Pain Scale Display:**
- Format: "Pain Level: X/10"
- Color coding based on severity:
  - 0-3: Green (#10B981)
  - 4-6: Amber (#F59E0B)
  - 7-10: Red (#EF4444)
- Accessible label: "Patient pain scale: X out of 10"

**Styling:**
- Background: White or light gray
- Border: 1px solid light gray
- Padding: 1rem
- Border radius: 0.5rem
- Gap between sections: 0.75rem

#### HistoricalContextSection

Displays past medical recurrences in a highlighted call-out box.

**Styling:**
- Background: Soft blue (#DBEAFE or Tailwind blue-100)
- Border-left: 4px solid darker blue (#3B82F6 or Tailwind blue-500)
- Padding: 1rem
- Border radius: 0.375rem
- Font size: 0.875rem

**Content Handling:**
- If string: Display as single paragraph
- If array: Display as bulleted list
- If empty/undefined: Render "No historical context available" with muted styling

**Accessibility:**
- Semantic HTML: Use `<aside>` element
- ARIA label: "Historical medical context"
- Sufficient contrast for text on blue background

#### ActionButtonGroup

Container for action buttons with mobile-optimized touch targets.

**Layout:**
- Horizontal flexbox on mobile (stacked if needed)
- Equal width buttons with gap spacing
- Sticky positioning at bottom of card (optional)

**Button Specifications:**
- Minimum dimensions: 48px height × 48px width
- Padding: 0.75rem horizontal, 0.625rem vertical
- Gap between buttons: 0.75rem (12px)
- Border radius: 0.5rem
- Font weight: 500 (medium)
- Font size: 0.875rem (14px)

**Button Styling:**
- Order MRI: Primary button (Healing Teal background, white text)
- Generate Referral: Secondary button (white background, Deep Slate border and text)
- Hover states: Slight darkening of background
- Active states: Slight scale down (transform: scale(0.98))
- Focus states: 2px outline with theme color

**Accessibility:**
- Semantic `<button>` elements
- Descriptive aria-labels
- Keyboard accessible (tab order, enter/space activation)
- Focus visible indicators

## Data Models

### UrgencyLevel Enum

```typescript
type UrgencyLevel = 'High' | 'Medium' | 'Low';

// Validation function
function isValidUrgency(value: unknown): value is UrgencyLevel {
  return typeof value === 'string' && 
         ['High', 'Medium', 'Low'].includes(value);
}
```

### PainScale Validation

```typescript
interface PainScaleValue {
  value: number;
  isValid: boolean;
  normalizedValue: number; // Clamped to 0-10
}

function validatePainScale(value: number): PainScaleValue {
  const isValid = typeof value === 'number' && 
                  value >= 0 && 
                  value <= 10 && 
                  !isNaN(value);
  
  const normalizedValue = Math.max(0, Math.min(10, Math.round(value)));
  
  return { value, isValid, normalizedValue };
}
```

### HistoricalContext Normalization

```typescript
function normalizeHistoricalContext(
  context: string | string[] | undefined
): string[] {
  if (!context) return [];
  if (typeof context === 'string') return [context];
  return context.filter(item => typeof item === 'string' && item.length > 0);
}
```

## Tailwind CSS v4 Configuration

### Custom Theme Extensions

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'healthcare': {
          'deep-slate': '#2C3E50',
          'healing-teal': '#1ABC9C',
          'soft-sage': '#95A5A6',
        },
        'urgency': {
          'high': '#EF4444',
          'medium': '#F59E0B',
          'low': '#1ABC9C',
        }
      },
      spacing: {
        'touch': '48px', // Minimum touch target size
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      }
    }
  }
}
```

### Responsive Breakpoints

- Mobile: 320px - 767px (default, no prefix)
- Tablet: 768px - 1024px (md: prefix)
- Desktop: 1025px+ (lg: prefix)

### Key Utility Classes

```css
/* Touch target sizing */
.touch-target {
  @apply min-h-touch min-w-touch;
}

/* Mobile-first card */
.dashboard-card {
  @apply flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md;
  @apply md:gap-6 md:p-6 md:max-w-2xl;
}

/* Urgency badge variants */
.badge-high {
  @apply bg-urgency-high text-white;
}

.badge-medium {
  @apply bg-urgency-medium text-white;
}

.badge-low {
  @apply bg-urgency-low text-white;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Urgency Level Color Mapping

*For any* urgency level (High, Medium, or Low), the Triage Priority Badge should display with the correct corresponding background color: red for High, amber for Medium, and teal for Low.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Urgency Text Display

*For any* urgency level, the Triage Priority Badge should display the urgency level text within the rendered output, ensuring information is not conveyed by color alone.

**Validates: Requirements 1.5, 6.7**

### Property 3: Component Hierarchical Ordering

*For any* valid dashboard props, the rendered component tree should maintain the correct order: Triage Priority Badge first, Clinical Brief Card second, Historical Context Section third, and Action Buttons last.

**Validates: Requirements 1.4, 2.4, 3.3, 4.3**

### Property 4: Chief Complaint Display

*For any* non-empty chief complaint string, the Clinical Brief Card should display that exact text in the rendered output.

**Validates: Requirements 2.1**

### Property 5: Pain Scale Display and Validation

*For any* pain scale value between 0 and 10 (inclusive), the Clinical Brief Card should display that value with appropriate labeling (e.g., "Pain Level: X/10").

**Validates: Requirements 2.2, 2.5**

### Property 6: Invalid Pain Scale Handling

*For any* pain scale value outside the range 0-10 or non-numeric values, the component should handle the invalid input gracefully without crashing, either by clamping to valid range or displaying an error state.

**Validates: Requirements 2.3**

### Property 7: Historical Context Display

*For any* historical context data (string or array of strings), the Historical Context Section should display that content in the rendered output.

**Validates: Requirements 3.1**

### Property 8: Action Button Callback Invocation

*For any* action button (Order MRI or Generate Referral), clicking or tapping that button should invoke the corresponding callback function exactly once.

**Validates: Requirements 4.4**

### Property 9: Touch Target Minimum Dimensions

*For any* action button, the computed dimensions should meet or exceed 48 pixels in both height and width to ensure mobile accessibility.

**Validates: Requirements 5.1, 5.2**

### Property 10: Touch Target Spacing

*For any* pair of adjacent action buttons, there should be adequate spacing (minimum 12px gap) between their touch target areas to prevent accidental taps.

**Validates: Requirements 5.3**

### Property 11: WCAG Contrast Ratio Compliance

*For any* text element in the dashboard (badge, clinical brief, historical context, or buttons), the contrast ratio between text color and background color should be at least 4.5:1 to meet WCAG 2.1 AA standards.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 12: ARIA Labels for Interactive Elements

*For any* interactive element (buttons), the rendered HTML should include appropriate ARIA attributes (aria-label or aria-labelledby) to support screen readers.

**Validates: Requirements 6.5**

### Property 13: Keyboard Navigation Support

*For any* interactive element, the element should be keyboard accessible with proper tab order and should respond to keyboard events (Enter/Space for buttons).

**Validates: Requirements 6.6**

### Property 14: Mobile Viewport Single-Column Layout

*For any* viewport width between 320px and 767px, the dashboard should render all components in a single-column flexbox layout with no horizontal scrolling.

**Validates: Requirements 7.1**

### Property 15: Responsive Spacing Adaptation

*For any* viewport width, the dashboard should apply appropriate spacing values that scale with the viewport size (larger spacing on tablet/desktop than mobile).

**Validates: Requirements 7.2, 7.4**

### Property 16: Props Interface Acceptance

*For any* valid combination of props matching the PhysicianMobileDashboardProps interface, the component should render without TypeScript errors or runtime exceptions.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

### Property 17: Missing Required Props Handling

*For any* required prop that is missing or undefined, the component should either provide a sensible default value or display a clear error message without crashing.

**Validates: Requirements 9.7**

## Error Handling

### Input Validation Errors

**Invalid Urgency Level:**
- If urgency prop is not one of 'High', 'Medium', 'Low'
- Fallback: Default to 'Medium' and log warning to console
- Display: Show amber badge with "Unknown" text

**Invalid Pain Scale:**
- If painScale is not a number or is NaN
- Fallback: Display "N/A" instead of numeric value
- If painScale < 0: Clamp to 0
- If painScale > 10: Clamp to 10

**Missing Chief Complaint:**
- If chiefComplaint is empty string or undefined
- Fallback: Display "No chief complaint provided" in muted text

**Invalid Historical Context:**
- If historicalContext is not string or array
- Fallback: Display "No historical context available"
- If array contains non-string values: Filter them out

### Callback Errors

**Missing Callbacks:**
- If onOrderMRI or onGenerateReferral is undefined
- Fallback: Disable corresponding button and show tooltip
- Log warning to console

**Callback Execution Errors:**
- Wrap callback invocations in try-catch
- If callback throws: Log error, show toast notification to user
- Prevent error from crashing entire component

### Rendering Errors

**React Error Boundaries:**
- Wrap dashboard in error boundary component
- If any child component throws during render
- Fallback: Display error message with retry button
- Log error details for debugging

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests:**
- Specific examples demonstrating correct behavior
- Edge cases (empty strings, boundary values, null/undefined)
- Error conditions and error handling paths
- Integration between components
- Accessibility features (ARIA attributes, keyboard navigation)

**Property-Based Tests:**
- Universal properties that hold for all valid inputs
- Comprehensive input coverage through randomization
- Verify correctness properties from design document
- Each property test runs minimum 100 iterations

### Property-Based Testing Configuration

**Library:** fast-check (TypeScript/JavaScript property-based testing library)

**Test Configuration:**
```typescript
import fc from 'fast-check';

// Minimum 100 iterations per property test
const testConfig = { numRuns: 100 };

// Example property test structure
describe('PhysicianMobileDashboard Properties', () => {
  it('Property 1: Urgency Level Color Mapping', () => {
    // Feature: physician-mobile-dashboard, Property 1: Urgency Level Color Mapping
    fc.assert(
      fc.property(
        fc.constantFrom('High', 'Medium', 'Low'),
        (urgency) => {
          // Test implementation
        }
      ),
      testConfig
    );
  });
});
```

**Tagging Convention:**
Each property test must include a comment tag referencing the design document:
```typescript
// Feature: physician-mobile-dashboard, Property {number}: {property_text}
```

### Test Coverage Areas

**Component Rendering:**
- Unit: Test specific urgency levels render correct colors
- Property: All urgency levels map to correct colors (Property 1)
- Unit: Test specific pain scale values display correctly
- Property: All valid pain scale values (0-10) display correctly (Property 5)

**Accessibility:**
- Unit: Test specific ARIA labels are present
- Property: All interactive elements have ARIA labels (Property 12)
- Unit: Test contrast ratio for specific color combinations
- Property: All text elements meet 4.5:1 contrast ratio (Property 11)

**Touch Targets:**
- Unit: Test button dimensions at specific viewport sizes
- Property: All buttons meet 48px minimum dimensions (Property 9)
- Property: All adjacent buttons have adequate spacing (Property 10)

**Error Handling:**
- Unit: Test specific invalid inputs (painScale = -1, painScale = 11)
- Property: All invalid pain scale values are handled gracefully (Property 6)
- Unit: Test missing required props
- Property: All missing props are handled without crashes (Property 17)

**Responsive Behavior:**
- Unit: Test layout at specific breakpoints (320px, 768px, 1024px)
- Property: All mobile viewports (320-767px) use single-column layout (Property 14)
- Property: All viewports apply appropriate spacing (Property 15)

**Event Handling:**
- Unit: Test specific button clicks invoke callbacks
- Property: All button clicks invoke corresponding callbacks (Property 8)

### Testing Tools

- **Test Runner:** Vitest
- **Property-Based Testing:** fast-check
- **Component Testing:** React Testing Library
- **Accessibility Testing:** jest-axe, @testing-library/jest-dom
- **Visual Regression:** Chromatic (optional)

### Continuous Integration

- Run all tests on every commit
- Enforce minimum 80% code coverage
- Run accessibility audits with axe-core
- Property tests must pass 100 iterations
- No failing tests allowed in main branch

## Implementation Notes

### Next.js 15 Considerations

- Use React Server Components where possible (this component will be Client Component due to interactivity)
- Mark component with 'use client' directive
- Optimize bundle size by importing only needed Tailwind utilities
- Use Next.js Image component if any images are added later

### Performance Optimizations

- Memoize sub-components with React.memo to prevent unnecessary re-renders
- Use useMemo for expensive computations (contrast ratio calculations)
- Use useCallback for callback props to maintain referential equality
- Lazy load any heavy dependencies

### Accessibility Best Practices

- Use semantic HTML elements (button, aside, section)
- Provide visible focus indicators for keyboard navigation
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Ensure color is not the only means of conveying information
- Provide text alternatives for all visual information

### Mobile Optimization

- Use touch-friendly spacing (minimum 48px touch targets)
- Optimize for one-handed use (important actions within thumb reach)
- Minimize layout shifts during loading
- Use appropriate font sizes for mobile readability (minimum 16px for body text)
- Test on real devices, not just browser emulators
