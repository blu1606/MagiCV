/**
 * Jest Mock for SupabaseService
 * 
 * Provides comprehensive mocking for all SupabaseService methods
 * with realistic test data and helper utilities
 */

import { jest } from '@jest/globals';
import type { Profile, Component, CV, ComponentType } from '@/lib/supabase';

// ============================================
// MOCK DATA - Realistic Test Data
// ============================================

/**
 * Mock Profile Data
 */
export const mockProfile: Profile = {
  id: 'user_123',
  full_name: 'John Doe',
  profession: 'Senior Software Engineer',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-12-01T00:00:00Z',
};

/**
 * Mock Profile with Minimal Data
 */
export const mockProfileMinimal: Profile = {
  id: 'user_456',
  full_name: undefined,
  profession: undefined,
  avatar_url: undefined,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-12-01T00:00:00Z',
};

/**
 * Mock Components - Diverse Types
 */
export const mockComponents: Component[] = [
  // Experience Component
  {
    id: 'comp_exp_1',
    user_id: 'user_123',
    account_id: 'account_1',
    type: 'experience',
    title: 'Senior Software Engineer',
    organization: 'Tech Corp',
    start_date: '2020-01',
    end_date: '2023-12',
    description: 'Led development of scalable microservices architecture',
    highlights: [
      'Reduced API response time by 60%',
      'Mentored team of 5 junior developers',
      'Implemented CI/CD pipeline with GitHub Actions',
    ],
    embedding: Array(768).fill(0).map(() => Math.random()),
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
    src: 'linkedin',
  },
  // Education Component
  {
    id: 'comp_edu_1',
    user_id: 'user_123',
    account_id: undefined,
    type: 'education',
    title: 'BSc Computer Science',
    organization: 'Stanford University',
    start_date: '2015-09',
    end_date: '2019-06',
    description: 'Focus on AI and Machine Learning',
    highlights: [
      'GPA: 3.8/4.0',
      'Dean\'s List (4 semesters)',
      'Coursework: Algorithms, ML, Distributed Systems',
    ],
    embedding: Array(768).fill(0).map(() => Math.random()),
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
    src: 'manual',
  },
  // Skill Component
  {
    id: 'comp_skill_1',
    user_id: 'user_123',
    account_id: undefined,
    type: 'skill',
    title: 'TypeScript',
    organization: undefined,
    start_date: undefined,
    end_date: undefined,
    description: 'Expert level - 5 years production experience',
    highlights: ['Next.js', 'React', 'Node.js', 'Type Safety'],
    embedding: Array(768).fill(0).map(() => Math.random()),
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
    src: 'manual',
  },
  // Project Component
  {
    id: 'comp_proj_1',
    user_id: 'user_123',
    account_id: 'account_github',
    type: 'project',
    title: 'AI CV Generator',
    organization: 'Personal Project',
    start_date: '2023-01',
    end_date: '2023-12',
    description: 'AI-powered CV builder with vector search',
    highlights: [
      'Built with Next.js 15 and TypeScript',
      'Integrated Google Generative AI',
      'Supabase backend with pgvector',
    ],
    embedding: Array(768).fill(0).map(() => Math.random()),
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
    src: 'github',
  },
];

/**
 * Mock CV Data
 */
export const mockCV: CV = {
  id: 'cv_123',
  user_id: 'user_123',
  title: 'Senior Software Engineer CV',
  job_description: 'Looking for experienced full-stack developer',
  match_score: 85.5,
  content: {
    profile: mockProfile,
    experiences: [mockComponents[0]],
    education: [mockComponents[1]],
    skills: [mockComponents[2]],
    projects: [mockComponents[3]],
  },
  created_at: '2023-12-01T00:00:00Z',
  updated_at: '2023-12-01T00:00:00Z',
};

// ============================================
// FACTORY FUNCTIONS - Generate Test Data
// ============================================

/**
 * Factory: Create Mock Component
 * @param overrides - Partial component data to override defaults
 */
export const createMockComponent = (overrides?: Partial<Component>): Component => {
  return {
    id: `comp_${Math.random().toString(36).substr(2, 9)}`,
    user_id: 'user_123',
    account_id: undefined,
    type: 'experience',
    title: 'Default Component Title',
    organization: 'Default Organization',
    start_date: '2020-01',
    end_date: '2023-12',
    description: 'Default description',
    highlights: ['Highlight 1', 'Highlight 2'],
    embedding: Array(768).fill(0).map(() => Math.random()),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    src: 'manual',
    ...overrides,
  };
};

/**
 * Factory: Create Multiple Mock Components
 * @param count - Number of components to create
 * @param type - Component type (optional)
 */
export const createMockComponents = (
  count: number,
  type?: ComponentType
): Component[] => {
  return Array(count)
    .fill(null)
    .map((_, idx) =>
      createMockComponent({
        id: `comp_${type || 'default'}_${idx + 1}`,
        type: type || 'experience',
        title: `${type || 'Default'} ${idx + 1}`,
      })
    );
};

/**
 * Factory: Create Mock Profile
 * @param overrides - Partial profile data to override defaults
 */
export const createMockProfile = (overrides?: Partial<Profile>): Profile => {
  return {
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    full_name: 'Test User',
    profession: 'Software Developer',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Factory: Create Mock CV
 * @param overrides - Partial CV data to override defaults
 */
export const createMockCV = (overrides?: Partial<CV>): CV => {
  return {
    id: `cv_${Math.random().toString(36).substr(2, 9)}`,
    user_id: 'user_123',
    title: 'Test CV',
    job_description: 'Test job description',
    match_score: 80,
    content: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

// ============================================
// MOCK SERVICE - Jest Mock Functions
// ============================================

/**
 * SupabaseService Mock
 * All methods are jest.fn() with proper TypeScript typing
 */
export const SupabaseServiceMock = {
  // Profile Methods
  getProfileById: jest.fn<(id: string) => Promise<Profile | null>>(),
  createProfile: jest.fn<(profile: Partial<Profile>) => Promise<Profile>>(),
  updateProfile: jest.fn<(id: string, updates: Partial<Profile>) => Promise<Profile>>(),

  // Component Methods
  getUserComponents: jest.fn<
    (userId: string) => Promise<{ components: Component[]; total: number }>
  >(),
  getComponentById: jest.fn<(id: string) => Promise<Component | null>>(),
  createComponent: jest.fn<(component: Partial<Component>) => Promise<Component>>(),
  updateComponent: jest.fn<(id: string, updates: Partial<Component>) => Promise<Component>>(),
  deleteComponent: jest.fn<(id: string) => Promise<void>>(),

  // Vector Search Methods
  similaritySearchComponents: jest.fn<
    (userId: string, embedding: number[], limit: number) => Promise<Component[]>
  >(),

  // CV Methods
  getUserCVs: jest.fn<(userId: string) => Promise<CV[]>>(),
  getCVById: jest.fn<(id: string) => Promise<CV | null>>(),
  createCV: jest.fn<(cv: Partial<CV>) => Promise<CV>>(),
  updateCV: jest.fn<(id: string, updates: Partial<CV>) => Promise<CV>>(),
  deleteCV: jest.fn<(id: string) => Promise<void>>(),
};

// ============================================
// SETUP HELPERS - Mock Configuration
// ============================================

/**
 * Setup SupabaseService Mocks with Default Success Behavior
 */
export const setupSupabaseMocks = () => {
  // Profile Methods - Success
  SupabaseServiceMock.getProfileById.mockResolvedValue(mockProfile);
  SupabaseServiceMock.createProfile.mockResolvedValue(mockProfile);
  SupabaseServiceMock.updateProfile.mockResolvedValue(mockProfile);

  // Component Methods - Success
  SupabaseServiceMock.getUserComponents.mockResolvedValue({
    components: mockComponents,
    total: mockComponents.length,
  });
  SupabaseServiceMock.getComponentById.mockResolvedValue(mockComponents[0]);
  SupabaseServiceMock.createComponent.mockResolvedValue(mockComponents[0]);
  SupabaseServiceMock.updateComponent.mockResolvedValue(mockComponents[0]);
  SupabaseServiceMock.deleteComponent.mockResolvedValue();

  // Vector Search - Success
  SupabaseServiceMock.similaritySearchComponents.mockResolvedValue(mockComponents);

  // CV Methods - Success
  SupabaseServiceMock.getUserCVs.mockResolvedValue([mockCV]);
  SupabaseServiceMock.getCVById.mockResolvedValue(mockCV);
  SupabaseServiceMock.createCV.mockResolvedValue(mockCV);
  SupabaseServiceMock.updateCV.mockResolvedValue(mockCV);
  SupabaseServiceMock.deleteCV.mockResolvedValue();
};

/**
 * Reset All SupabaseService Mocks
 */
export const resetSupabaseMocks = () => {
  Object.values(SupabaseServiceMock).forEach((mockFn) => {
    if (typeof mockFn === 'function' && 'mockReset' in mockFn) {
      mockFn.mockReset();
    }
  });
};

/**
 * Set Specific Mock to Return Success
 * @param method - Method name to mock
 * @param data - Data to return
 */
export const setMockSuccess = <T>(
  method: keyof typeof SupabaseServiceMock,
  data: T
) => {
  (SupabaseServiceMock[method] as any).mockResolvedValue(data);
};

/**
 * Set Specific Mock to Throw Error
 * @param method - Method name to mock
 * @param error - Error to throw
 */
export const setMockError = (
  method: keyof typeof SupabaseServiceMock,
  error: Error | string
) => {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  (SupabaseServiceMock[method] as any).mockRejectedValue(errorObj);
};

/**
 * Set Mock to Return Empty Results
 */
export const setMockEmpty = () => {
  SupabaseServiceMock.getProfileById.mockResolvedValue(null);
  SupabaseServiceMock.getUserComponents.mockResolvedValue({
    components: [],
    total: 0,
  });
  SupabaseServiceMock.similaritySearchComponents.mockResolvedValue([]);
  SupabaseServiceMock.getUserCVs.mockResolvedValue([]);
  SupabaseServiceMock.getCVById.mockResolvedValue(null);
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default SupabaseServiceMock;

