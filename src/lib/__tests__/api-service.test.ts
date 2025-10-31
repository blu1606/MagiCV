/**
 * Unit Tests for api-service.ts
 * 
 * Tests API service utilities
 */

import { describe, test, expect } from '@jest/globals';
import { apiService } from '../api-service';

describe('apiService', () => {
  describe('loginWithLinkedIn', () => {
    test('Given valid code and state, When loginWithLinkedIn called, Then throws not implemented error', async () => {
      // Arrange
      const code = 'auth_code_123';
      const state = 'state_456';

      // Act & Assert
      await expect(apiService.loginWithLinkedIn(code, state))
        .rejects.toThrow('LinkedIn OAuth not yet implemented');
    });

    test('Given empty code, When loginWithLinkedIn called, Then throws not implemented error', async () => {
      // Arrange
      const code = '';
      const state = 'state_456';

      // Act & Assert
      await expect(apiService.loginWithLinkedIn(code, state))
        .rejects.toThrow('LinkedIn OAuth not yet implemented');
    });

    test('Given empty state, When loginWithLinkedIn called, Then throws not implemented error', async () => {
      // Arrange
      const code = 'auth_code_123';
      const state = '';

      // Act & Assert
      await expect(apiService.loginWithLinkedIn(code, state))
        .rejects.toThrow('LinkedIn OAuth not yet implemented');
    });
  });
});

