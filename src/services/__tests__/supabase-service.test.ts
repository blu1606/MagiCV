/**
 * Unit Tests for SupabaseService
 * 
 * Tests database operations for profiles, components, CVs, and vector search
 * Target: 85%+ coverage
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { SupabaseService } from '@/services/supabase-service';
import type { Profile, Component, CV, Account } from '@/lib/supabase';

// Create mock supabase client
const mockSupabase = createMockSupabaseClient();

// Mock getSupabaseAdmin
jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn(() => mockSupabase),
}));

// Create a mock Supabase client with proper chainable API
function createMockSupabaseClient() {
  // Create a chainable mock builder
  const createChainableMock = () => {
    const chain = {
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      eq: jest.fn(),
      not: jest.fn(),
      order: jest.fn(),
      single: jest.fn(),
    };

    // Make methods return chain for chaining
    chain.insert.mockReturnValue(chain);
    chain.select.mockReturnValue(chain);
    chain.update.mockReturnValue(chain);
    chain.delete.mockReturnValue(chain);
    chain.upsert.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    chain.not.mockReturnValue(chain);
    chain.order.mockReturnValue(chain);
    chain.single.mockReturnValue(chain);

    return chain;
  };

  return {
    from: jest.fn(() => createChainableMock()),
    auth: {
      admin: {
        createUser: jest.fn(),
        getUserById: jest.fn(),
        listUsers: jest.fn(),
      },
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn(),
      })),
    },
    rpc: jest.fn(),
  };
}

describe('SupabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset static supabase property to force re-initialization
    (SupabaseService as any).supabase = null;
  });

  // ============================================
  // PROFILE OPERATIONS
  // ============================================

  describe('Profile Operations', () => {
    test('Given valid profile data, When createProfile called, Then creates profile', async () => {
      // Arrange
      const mockProfile: Profile = {
        id: 'user_123',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        profession: 'Software Engineer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('profiles');
      chain.insert().select().single().single.mockResolvedValue({ data: mockProfile, error: null });

      // Act
      const result = await SupabaseService.createProfile(
        'user_123',
        'John Doe',
        'https://example.com/avatar.jpg',
        'Software Engineer'
      );

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    test('Given profile id, When getProfileById called, Then returns profile', async () => {
      // Arrange
      const mockProfile: Profile = {
        id: 'user_123',
        full_name: 'John Doe',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('profiles').select().eq().single();
      chain.single.mockResolvedValue({ data: mockProfile, error: null });

      // Act
      const result = await SupabaseService.getProfileById('user_123');

      // Assert
      expect(result).toEqual(mockProfile);
    });

    test('Given non-existent profile id, When getProfileById called, Then returns null', async () => {
      // Arrange
      const chain = mockSupabase.from('profiles').select().eq().single();
      chain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      // Act
      const result = await SupabaseService.getProfileById('non_existent');

      // Assert
      expect(result).toBeNull();
    });

    test('When getAllProfiles called, Then returns all profiles', async () => {
      // Arrange
      const mockProfiles: Profile[] = [
        {
          id: 'user_1',
          full_name: 'User 1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'user_2',
          full_name: 'User 2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const chain = mockSupabase.from('profiles').select().order();
      chain.order.mockResolvedValue({ data: mockProfiles, error: null });

      // Act
      const result = await SupabaseService.getAllProfiles();

      // Assert
      expect(result).toEqual(mockProfiles);
    });

    test('Given updates, When updateProfile called, Then updates profile', async () => {
      // Arrange
      const updatedProfile: Profile = {
        id: 'user_123',
        full_name: 'Jane Doe',
        profession: 'Senior Engineer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('profiles').update().eq().select().single();
      chain.single.mockResolvedValue({ data: updatedProfile, error: null });

      // Act
      const result = await SupabaseService.updateProfile('user_123', {
        full_name: 'Jane Doe',
        profession: 'Senior Engineer',
      });

      // Assert
      expect(result).toEqual(updatedProfile);
    });

    test('Given profile id, When deleteProfile called, Then deletes profile', async () => {
      // Arrange
      const chain = mockSupabase.from('profiles').delete().eq();
      chain.eq.mockResolvedValue({ error: null });

      // Act
      await SupabaseService.deleteProfile('user_123');

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    test('Given database error, When createProfile called, Then throws error', async () => {
      // Arrange
      const chain = mockSupabase.from('profiles').insert().select().single();
      chain.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: '23505' },
      });

      // Act & Assert
      await expect(
        SupabaseService.createProfile('user_123', 'John Doe')
      ).rejects.toMatchObject({ message: 'Database error' });
    });
  });

  // ============================================
  // COMPONENT OPERATIONS
  // ============================================

  describe('Component Operations', () => {
    test('Given valid component data, When createComponent called, Then creates component', async () => {
      // Arrange
      const componentData = {
        user_id: 'user_123',
        type: 'experience' as const,
        title: 'Senior Developer',
        organization: 'TechCorp',
        description: 'Built amazing apps',
        highlights: ['React', 'TypeScript'],
      };

      const mockComponent: Component = {
        id: 'comp_123',
        ...componentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('components').insert().select().single();
      chain.single.mockResolvedValue({ data: mockComponent, error: null });

      // Act
      const result = await SupabaseService.createComponent(componentData);

      // Assert
      expect(result).toEqual(mockComponent);
    });

    test('Given user id, When getUserComponents called, Then returns components grouped by type', async () => {
      // Arrange
      const mockComponents: Component[] = [
        {
          id: 'comp_1',
          user_id: 'user_123',
          type: 'experience',
          title: 'Developer',
          highlights: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'comp_2',
          user_id: 'user_123',
          type: 'skill',
          title: 'React',
          highlights: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const chain = mockSupabase.from('components').select().eq().order();
      chain.order.mockResolvedValue({ data: mockComponents, error: null });

      // Act
      const result = await SupabaseService.getUserComponents('user_123');

      // Assert
      expect(result.total).toBe(2);
      expect(result.byType.experience).toBe(1);
      expect(result.byType.skill).toBe(1);
      expect(result.components).toEqual(mockComponents);
    });

    test('Given component type, When getComponentsByType called, Then returns filtered components', async () => {
      // Arrange
      const mockComponents: Component[] = [
        {
          id: 'comp_1',
          user_id: 'user_123',
          type: 'experience',
          title: 'Developer',
          highlights: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const chain = mockSupabase.from('components').select().eq().eq().order();
      chain.order.mockResolvedValue({ data: mockComponents, error: null });

      // Act
      const result = await SupabaseService.getComponentsByType('user_123', 'experience');

      // Assert
      expect(result).toEqual(mockComponents);
    });

    test('Given component id, When getComponentById called, Then returns component', async () => {
      // Arrange
      const mockComponent: Component = {
        id: 'comp_123',
        user_id: 'user_123',
        type: 'experience',
        title: 'Developer',
        highlights: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('components').select().eq().single();
      chain.single.mockResolvedValue({ data: mockComponent, error: null });

      // Act
      const result = await SupabaseService.getComponentById('comp_123');

      // Assert
      expect(result).toEqual(mockComponent);
    });

    test('Given updates, When updateComponent called, Then updates component', async () => {
      // Arrange
      const updatedComponent: Component = {
        id: 'comp_123',
        user_id: 'user_123',
        type: 'experience',
        title: 'Senior Developer',
        highlights: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('components').update().eq().select().single();
      chain.single.mockResolvedValue({ data: updatedComponent, error: null });

      // Act
      const result = await SupabaseService.updateComponent('comp_123', {
        title: 'Senior Developer',
      });

      // Assert
      expect(result).toEqual(updatedComponent);
    });

    test('Given component id, When deleteComponent called, Then deletes component', async () => {
      // Arrange
      const chain = mockSupabase.from('components').delete().eq();
      chain.eq.mockResolvedValue({ error: null });

      // Act
      await SupabaseService.deleteComponent('comp_123');

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('components');
    });

    test('Given user id, When deleteUserComponents called, Then returns deleted count', async () => {
      // Arrange
      const deletedComponents: Component[] = [
        {
          id: 'comp_1',
          user_id: 'user_123',
          type: 'experience',
          title: 'Developer',
          highlights: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const chain = mockSupabase.from('components').delete().eq().select();
      chain.select.mockResolvedValue({ data: deletedComponents, error: null });

      // Act
      const result = await SupabaseService.deleteUserComponents('user_123');

      // Assert
      expect(result).toBe(1);
    });
  });

  // ============================================
  // VECTOR SEARCH OPERATIONS
  // ============================================

  describe('Vector Search Operations', () => {
    test('Given embedding vector, When similaritySearchComponents called with RPC, Then returns similar components', async () => {
      // Arrange
      const mockEmbedding = Array(768).fill(0.1);
      const mockComponents: Component[] = [
        {
          id: 'comp_1',
          user_id: 'user_123',
          type: 'skill',
          title: 'React',
          highlights: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockComponents, error: null });

      // Act
      const result = await SupabaseService.similaritySearchComponents(
        'user_123',
        mockEmbedding,
        10
      );

      // Assert
      expect(result).toEqual(mockComponents);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('match_components', {
        query_embedding: mockEmbedding,
        match_threshold: 0.7,
        match_count: 10,
        user_id_param: 'user_123',
      });
    });

    test('Given RPC function missing, When similaritySearchComponents called, Then uses fallback search', async () => {
      // Arrange
      const mockEmbedding = Array(768).fill(0.1);
      const mockComponents: Component[] = [
        {
          id: 'comp_1',
          user_id: 'user_123',
          type: 'skill',
          title: 'React',
          embedding: mockEmbedding,
          highlights: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Mock RPC error (function not found)
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'function match_components does not exist' },
      });

      // Mock fallback query
      const chain = mockSupabase.from('components').select().eq().not();
      chain.not.mockResolvedValue({ data: mockComponents, error: null });

      // Mock console.warn to avoid noise
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      const result = await SupabaseService.similaritySearchComponents(
        'user_123',
        mockEmbedding,
        10
      );

      // Assert
      expect(result.length).toBeGreaterThanOrEqual(0);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('match_components function not found')
      );

      jest.restoreAllMocks();
    });

    test('Given job description embedding, When similaritySearchJobDescriptions called, Then returns similar CVs', async () => {
      // Arrange
      const mockEmbedding = Array(768).fill(0.1);
      const mockCVs = [
        {
          id: 'cv_1',
          user_id: 'user_123',
          title: 'Senior Engineer',
          job_description: 'Job description',
          content: {},
          similarity: 0.85,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockCVs, error: null });

      // Act
      const result = await SupabaseService.similaritySearchJobDescriptions(
        'user_123',
        mockEmbedding,
        5
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('similarity', 0.85);
    });
  });

  // ============================================
  // CV OPERATIONS
  // ============================================

  describe('CV Operations', () => {
    test('Given valid CV data, When createCV called, Then creates CV', async () => {
      // Arrange
      const cvData = {
        user_id: 'user_123',
        title: 'Senior Software Engineer',
        job_description: 'Job description text',
        content: {},
      };

      const mockCV: CV = {
        id: 'cv_123',
        ...cvData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('cvs').insert().select().single();
      chain.single.mockResolvedValue({ data: mockCV, error: null });

      // Act
      const result = await SupabaseService.createCV(cvData);

      // Assert
      expect(result).toEqual(mockCV);
    });

    test('Given user id, When getCVsByUserId called, Then returns user CVs', async () => {
      // Arrange
      const mockCVs: CV[] = [
        {
          id: 'cv_1',
          user_id: 'user_123',
          title: 'Engineer',
          content: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const chain = mockSupabase.from('cvs').select().eq().order();
      chain.order.mockResolvedValue({ data: mockCVs, error: null });

      // Act
      const result = await SupabaseService.getCVsByUserId('user_123');

      // Assert
      expect(result).toEqual(mockCVs);
    });

    test('Given CV id, When getCVById called, Then returns CV', async () => {
      // Arrange
      const mockCV: CV = {
        id: 'cv_123',
        user_id: 'user_123',
        title: 'Engineer',
        content: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('cvs').select().eq().single();
      chain.single.mockResolvedValue({ data: mockCV, error: null });

      // Act
      const result = await SupabaseService.getCVById('cv_123');

      // Assert
      expect(result).toEqual(mockCV);
    });
  });

  // ============================================
  // ACCOUNT OPERATIONS
  // ============================================

  describe('Account Operations', () => {
    test('Given valid account data, When createAccount called, Then creates account', async () => {
      // Arrange
      const accountData = {
        user_id: 'user_123',
        provider: 'github' as const,
        provider_account_id: 'github_user',
      };

      const mockAccount: Account = {
        id: 'acc_123',
        ...accountData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('accounts').insert().select().single();
      chain.single.mockResolvedValue({ data: mockAccount, error: null });

      // Act
      const result = await SupabaseService.createAccount(accountData);

      // Assert
      expect(result).toEqual(mockAccount);
    });

    test('Given account data, When upsertAccount called, Then creates or updates account', async () => {
      // Arrange
      const accountData = {
        user_id: 'user_123',
        provider: 'github' as const,
        provider_account_id: 'github_user',
      };

      const mockAccount: Account = {
        id: 'acc_123',
        ...accountData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('accounts').upsert().select().single();
      chain.single.mockResolvedValue({ data: mockAccount, error: null });

      // Act
      const result = await SupabaseService.upsertAccount(accountData);

      // Assert
      expect(result).toEqual(mockAccount);
    });

    test('Given user id and provider, When getAccountByProvider called, Then returns account', async () => {
      // Arrange
      const mockAccount: Account = {
        id: 'acc_123',
        user_id: 'user_123',
        provider: 'github',
        provider_account_id: 'github_user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const chain = mockSupabase.from('accounts').select().eq().eq().single();
      chain.single.mockResolvedValue({ data: mockAccount, error: null });

      // Act
      const result = await SupabaseService.getAccountByProvider('user_123', 'github');

      // Assert
      expect(result).toEqual(mockAccount);
    });
  });
});

