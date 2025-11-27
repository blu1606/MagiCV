/**
 * Input Component Tests
 */

import { describe, it, expect, vi } from '@jest/globals';
import { render, screen } from '@/test-utils/render';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with value', () => {
      render(<Input value="Test value" readOnly />);
      expect(screen.getByDisplayValue('Test value')).toBeInTheDocument();
    });
  });

  describe('Types', () => {
    it('renders email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('States', () => {
    it('can be disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('can be readonly', () => {
      render(<Input readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('can be required', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('Interactions', () => {
    it('calls onChange handler when typing', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Hello');
      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value on user input', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await user.type(input, 'Test input');
      expect(input.value).toBe('Test input');
    });

    it('calls onFocus handler when focused', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();

      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      expect(handleFocus).toHaveBeenCalled();
    });

    it('calls onBlur handler when blurred', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has textbox role by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Username input" />);
      expect(screen.getByLabelText('Username input')).toBeInTheDocument();
    });

    it('supports aria-describedby for error messages', () => {
      render(
        <>
          <Input aria-describedby="error-message" />
          <span id="error-message">This field is required</span>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
    });
  });

  describe('Custom Props', () => {
    it('accepts custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<Input ref={ref as any} />);
      expect(ref.current).toBeTruthy();
    });
  });
});
