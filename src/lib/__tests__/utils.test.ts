/**
 * Unit Tests for utils.ts
 * 
 * Tests utility functions (class names, etc.)
 */

import { describe, test, expect } from '@jest/globals';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn (class name utility)', () => {
    test('Given single class string, When cn called, Then returns class string', () => {
      // Act
      const result = cn('bg-blue-500');

      // Assert
      expect(typeof result).toBe('string');
      expect(result).toContain('bg-blue-500');
    });

    test('Given multiple class strings, When cn called, Then merges classes', () => {
      // Act
      const result = cn('bg-blue-500', 'text-white', 'p-4');

      // Assert
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
      expect(result).toContain('p-4');
    });

    test('Given conflicting Tailwind classes, When cn called, Then resolves conflicts', () => {
      // Act
      const result = cn('p-4', 'p-8');

      // Assert
      // Should keep the last one (p-8)
      expect(result).toContain('p-8');
      expect(result).not.toContain('p-4');
    });

    test('Given conditional classes, When cn called, Then includes truthy values only', () => {
      // Act
      const result = cn('base-class', false && 'hidden', true && 'visible', null, undefined, 'final-class');

      // Assert
      expect(result).toContain('base-class');
      expect(result).toContain('visible');
      expect(result).toContain('final-class');
      expect(result).not.toContain('hidden');
    });

    test('Given array of classes, When cn called, Then merges array', () => {
      // Act
      const result = cn(['bg-blue-500', 'text-white']);

      // Assert
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
    });

    test('Given empty input, When cn called, Then returns empty string', () => {
      // Act
      const result = cn();

      // Assert
      expect(result).toBe('');
    });

    test('Given object with conditional classes, When cn called, Then includes truthy keys', () => {
      // Act
      const result = cn({
        'bg-blue-500': true,
        'text-white': true,
        'hidden': false,
      });

      // Assert
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
      expect(result).not.toContain('hidden');
    });

    test('Given mix of types, When cn called, Then handles all types', () => {
      // Act
      const result = cn(
        'base-class',
        ['array-class-1', 'array-class-2'],
        { 'object-class': true, 'object-class-false': false },
        null,
        undefined,
        'final-class'
      );

      // Assert
      expect(result).toContain('base-class');
      expect(result).toContain('array-class-1');
      expect(result).toContain('array-class-2');
      expect(result).toContain('object-class');
      expect(result).toContain('final-class');
      expect(result).not.toContain('object-class-false');
    });

    test('Given duplicate classes, When cn called, Then deduplicates', () => {
      // Act
      const result = cn('class-1', 'class-2', 'class-1');

      // Assert
      expect(result).toContain('class-1');
      expect(result).toContain('class-2');
    });
  });
});

