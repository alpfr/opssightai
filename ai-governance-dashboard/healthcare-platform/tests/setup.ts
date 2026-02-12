/**
 * Vitest setup file for Physician's Mobile Dashboard tests
 * 
 * This file configures the testing environment with:
 * - @testing-library/jest-dom matchers
 * - Global test utilities
 * - Mock configurations
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router if needed
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));
