/**
 * Unit Tests for error-handler.ts
 * 
 * Tests error handling utilities
 */

import { describe, test, expect } from '@jest/globals';
import { errorHandler } from '../error-handler';

describe('errorHandler', () => {
  describe('handleAPIError', () => {
    test('Given Error instance, When handleAPIError called, Then returns error message', () => {
      // Arrange
      const error = new Error('Database connection failed');

      // Act
      const result = errorHandler.handleAPIError(error);

      // Assert
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Database connection failed');
      expect(result.code).toBeUndefined();
    });

    test('Given Error with code, When handleAPIError called, Then returns message without code', () => {
      // Arrange
      const error = new Error('Network error') as any;
      error.code = 'ENOTFOUND';

      // Act
      const result = errorHandler.handleAPIError(error);

      // Assert
      expect(result.message).toBe('Network error');
      // Note: current implementation doesn't extract code
    });

    test('Given non-Error object, When handleAPIError called, Then returns generic message', () => {
      // Arrange
      const error = { status: 500, data: 'Server error' };

      // Act
      const result = errorHandler.handleAPIError(error);

      // Assert
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.code).toBeUndefined();
    });

    test('Given null, When handleAPIError called, Then returns generic message', () => {
      // Arrange
      const error = null;

      // Act
      const result = errorHandler.handleAPIError(error);

      // Assert
      expect(result.message).toBe('An unexpected error occurred');
    });

    test('Given undefined, When handleAPIError called, Then returns generic message', () => {
      // Arrange
      const error = undefined;

      // Act
      const result = errorHandler.handleAPIError(error);

      // Assert
      expect(result.message).toBe('An unexpected error occurred');
    });

    test('Given string, When handleAPIError called, Then returns generic message', () => {
      // Arrange
      const error = 'String error';

      // Act
      const result = errorHandler.handleAPIError(error);

      // Assert
      expect(result.message).toBe('An unexpected error occurred');
    });

    test('Given Error with empty message, When handleAPIError called, Then returns empty message', () => {
      // Arrange
      const error = new Error('');

      // Act
      const result = errorHandler.handleAPIError(error);

      // Assert
      expect(result.message).toBe('');
    });
  });
});

