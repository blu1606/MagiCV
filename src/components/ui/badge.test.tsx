/**
 * Badge Component Tests
 */

import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@/test-utils/render';
import { Badge } from './badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders badge with text', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies default variant class', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-primary');
    });

    it('applies secondary variant class', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('bg-secondary');
    });

    it('applies destructive variant class', () => {
      render(<Badge variant="destructive">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-destructive');
    });

    it('applies outline variant class', () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('border');
    });
  });

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-badge');
    });

    it('spreads additional props', () => {
      render(<Badge data-testid="test-badge">Test</Badge>);
      expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    });
  });
});
