/**
 * Test Utilities for React Component Testing
 * Provides custom render function with providers and common test helpers
 */

import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 * For now, we skip ThemeProvider to avoid matchMedia issues in tests
 * Components should work without theme context for testing
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Simple wrapper without ThemeProvider for now
  // Add providers here as needed
  return rtlRender(ui, options);
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };
