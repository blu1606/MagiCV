/**
 * E2E Test Data Fixtures
 * 
 * Provides consistent test data for E2E tests
 */

export const testUser = {
  email: `test-e2e-${Date.now()}@example.com`,
  fullName: 'E2E Test User',
  profession: 'Software Engineer',
  bio: 'Test bio for E2E testing',
};

export const testComponents = {
  experience: {
    type: 'experience',
    title: 'Senior Software Engineer',
    organization: 'Tech Corp',
    description: 'Built scalable microservices architecture',
    highlights: [
      'Led team of 5 engineers',
      'Improved system performance by 50%',
      'Implemented CI/CD pipeline',
    ],
    start_date: '2020-01',
    end_date: '2023-12',
  },
  
  skill: {
    type: 'skill',
    title: 'TypeScript',
    description: 'Expert level TypeScript developer',
    highlights: [
      '5+ years experience',
      'Built type-safe systems',
    ],
  },
  
  education: {
    type: 'education',
    title: 'Bachelor of Computer Science',
    organization: 'Tech University',
    description: 'Computer Science and Engineering',
    start_date: '2015-09',
    end_date: '2019-06',
  },
  
  project: {
    type: 'project',
    title: 'AI-Powered CV Builder',
    description: 'Built intelligent CV generation system',
    highlights: [
      'Next.js 15 + TypeScript',
      'Supabase + Vector Search',
      'Google Generative AI integration',
    ],
  },
};

export const testJobDescription = `
Senior Software Engineer - Tech Company

We are looking for an experienced software engineer with:
- 5+ years of TypeScript/JavaScript experience
- Strong background in microservices architecture
- Experience with React and Next.js
- Familiarity with AI/ML technologies
- Excellent communication skills

Responsibilities:
- Lead technical design and implementation
- Mentor junior engineers
- Build scalable systems
- Collaborate with product team
`;

export const testCVContent = {
  userId: 'test-user-id',
  jobDescription: testJobDescription,
  selectedComponents: [
    testComponents.experience,
    testComponents.skill,
    testComponents.education,
    testComponents.project,
  ],
};

/**
 * Generate random test email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Wait for API response
 */
export async function waitForAPI(
  page: any,
  urlPattern: string | RegExp,
  timeout: number = 30000
): Promise<any> {
  const response = await page.waitForResponse(
    (resp: any) => {
      const url = resp.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
  
  return response.json();
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(
  page: any,
  userId: string
): Promise<void> {
  try {
    await page.request.delete(`/api/users/${userId}`);
    console.log(`✅ Cleaned up test user: ${userId}`);
  } catch (error) {
    console.warn(`⚠️ Failed to cleanup test user: ${error}`);
  }
}

