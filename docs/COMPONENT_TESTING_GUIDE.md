# Component Testing Guide

## Overview
This guide provides standards and best practices for testing React components in the MagicCV project using React Testing Library and Jest.

## Setup

### Test Environment
- **Framework**: Jest with React Testing Library
- **Environment**: jsdom (for DOM simulation)
- **Test Utilities**: `src/test-utils/render.tsx`

### Running Tests
```bash
# Run all component tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test button.test.tsx
```

## Testing Philosophy

### Test Behavior, Not Implementation
✅ **Good**: Test what users see and interact with
```typescript
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
```

❌ **Bad**: Test internal state or implementation details
```typescript
expect(component.state.isSubmitting).toBe(true);
```

### Use Semantic Queries
Priority order for queries:
1. **Accessible by everyone**: `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`
2. **Semantic queries**: `getByAltText`, `getByTitle`
3. **Test IDs** (last resort): `getByTestId`

## Test Structure

### Basic Test Template
```typescript
import { describe, it, expect, vi } from '@jest/globals';
import { render, screen } from '@/test-utils/render';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './component-name';

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<ComponentName />);
      expect(screen.getByRole('...')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles user click', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<ComponentName onClick={handleClick} />);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<ComponentName aria-label="Test label" />);
      expect(screen.getByLabelText('Test label')).toBeInTheDocument();
    });
  });
});
```

## Test Categories

### 1. Rendering Tests
Test that components render correctly with various props:
```typescript
it('renders with text content', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### 2. Variant Tests
Test all component variants and styles:
```typescript
it('applies destructive variant', () => {
  render(<Button variant="destructive">Delete</Button>);
  expect(screen.getByRole('button')).toHaveClass('bg-destructive');
});
```

### 3. State Tests
Test component states (disabled, loading, error):
```typescript
it('shows loading state', () => {
  render(<Button loading>Submit</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
});
```

### 4. Interaction Tests
Test user interactions:
```typescript
it('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();

  render(<Button onClick={handleClick}>Click</Button>);
  await user.click(screen.getByRole('button'));

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 5. Form Tests
Test form inputs and validation:
```typescript
it('validates required field', async () => {
  const user = userEvent.setup();
  render(<Input required />);

  const input = screen.getByRole('textbox');
  await user.clear(input);
  await user.tab();

  expect(input).toBeInvalid();
});
```

### 6. Accessibility Tests
Test ARIA attributes, keyboard navigation, screen reader support:
```typescript
it('supports keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<Button>Press Enter</Button>);

  screen.getByRole('button').focus();
  await user.keyboard('{Enter}');

  expect(handleClick).toHaveBeenCalled();
});
```

## Common Patterns

### Testing Async Behavior
```typescript
it('loads data asynchronously', async () => {
  render(<DataComponent />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Mocking Context Providers
```typescript
it('uses theme context', () => {
  const mockTheme = { theme: 'dark', setTheme: vi.fn() };

  render(
    <ThemeContext.Provider value={mockTheme}>
      <ThemedComponent />
    </ThemeContext.Provider>
  );
});
```

### Testing Error States
```typescript
it('displays error message', () => {
  render(<Form error="Invalid input" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid input');
});
```

## Coverage Goals

### Component Coverage Targets
- **Critical Components** (Button, Input, Form): 95%+
- **UI Components** (Badge, Card, Dialog): 85%+
- **Page Components**: 70%+

### Test Checklist for Each Component
- [ ] Renders correctly
- [ ] All variants work
- [ ] All props are respected
- [ ] User interactions work
- [ ] Keyboard navigation works
- [ ] Screen reader support
- [ ] Loading states
- [ ] Error states
- [ ] Edge cases

## Testing Priorities

### High Priority (Must Test)
1. Form components (Input, Select, Checkbox, etc.)
2. Interactive components (Button, Dialog, Dropdown)
3. Navigation components
4. Critical page components

### Medium Priority
1. Display components (Card, Badge, Avatar)
2. Layout components
3. Utility components

### Low Priority
1. Pure styling components
2. Simple wrapper components
3. Icon components

## Best Practices

### DO ✅
- Test user-facing behavior
- Use semantic HTML and ARIA
- Test accessibility
- Use `userEvent` for interactions
- Write descriptive test names
- Group related tests with `describe`
- Test error boundaries
- Mock external dependencies

### DON'T ❌
- Test implementation details
- Test CSS styling (use visual regression instead)
- Over-mock (leads to false positives)
- Use `waitFor` unnecessarily
- Test third-party library internals
- Write brittle tests tied to structure

## Example: Comprehensive Component Test

```typescript
describe('LoginForm', () => {
  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows error for invalid email', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'invalid');
      await user.tab();

      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('shows error for empty password', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByLabelText(/password/i));
      await user.tab();

      expect(screen.getByText(/password required/i)).toBeInTheDocument();
    });
  });

  describe('Submission', () => {
    it('submits form with valid data', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      render(<LoginForm onSubmit={handleSubmit} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /log in/i }));

      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole('button', { name: /log in/i }));

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });

    it('announces errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole('button', { name: /log in/i }));

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
    });
  });
});
```

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
