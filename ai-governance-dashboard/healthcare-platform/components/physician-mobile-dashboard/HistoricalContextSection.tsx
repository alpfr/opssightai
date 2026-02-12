'use client';

import React from 'react';
import { HistoricalContextSectionProps, normalizeHistoricalContext } from './types';

/**
 * HistoricalContextSection Component
 * 
 * Displays past medical recurrences in a highlighted call-out box.
 * 
 * Styling:
 * - Background: Soft blue (#DBEAFE or Tailwind blue-100)
 * - Border-left: 4px solid darker blue (#3B82F6 or Tailwind blue-500)
 * - Padding: 1rem
 * - Border radius: 0.375rem
 * 
 * Content Handling:
 * - If string: Display as single paragraph
 * - If array: Display as bulleted list
 * - If empty/undefined: Render "No historical context available"
 * 
 * Accessibility:
 * - Semantic HTML: Uses <aside> element
 * - ARIA label: "Historical medical context"
 * - Sufficient contrast for text on blue background
 * 
 * @param props - Component props
 * @returns Historical context section component
 */
export function HistoricalContextSection({ 
  context, 
  className = '' 
}: HistoricalContextSectionProps) {
  // Normalize context to array format
  const contextItems = normalizeHistoricalContext(context);
  const hasContext = contextItems.length > 0;

  return (
    <aside
      aria-label="Historical medical context"
      className={`
        bg-blue-100
        border-l-4 border-blue-500
        rounded-md
        p-4
        ${className}
      `.trim()}
    >
      <h3 className="text-xs font-medium text-blue-900 uppercase tracking-wide mb-2">
        Historical Context
      </h3>
      
      {hasContext ? (
        contextItems.length === 1 ? (
          // Single item: display as paragraph
          <p className="text-sm text-blue-800">
            {contextItems[0]}
          </p>
        ) : (
          // Multiple items: display as bulleted list
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            {contextItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )
      ) : (
        // Empty state
        <p className="text-sm text-blue-600 italic">
          No historical context available
        </p>
      )}
    </aside>
  );
}
