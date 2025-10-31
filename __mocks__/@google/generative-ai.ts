/**
 * Mock for @google/generative-ai
 * Used in unit tests to avoid real API calls
 * 
 * This mock is automatically used by Jest when tests call:
 * jest.mock('@google/generative-ai')
 */

export class GoogleGenerativeAI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Accept any key for tests (even fake keys)
  }

  getGenerativeModel(options?: { model?: string }) {
    // Create a mock function that returns structured responses
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => {
          // Return mock JSON response based on context
          // Default response for most cases
          return JSON.stringify({
            experiences: [],
            education: [],
            skills: {
              technical: [],
              languages: [],
            },
            projects: [],
          });
        },
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    experiences: [],
                    education: [],
                    skills: {
                      technical: [],
                      languages: [],
                    },
                    projects: [],
                  }),
                },
              ],
            },
          },
        ],
      },
    });

    return {
      generateContent: mockGenerateContent,
      // Support for streaming if needed
      generateContentStream: jest.fn().mockImplementation(function* () {
        yield {
          response: {
            text: () => 'Mocked streaming response',
          },
        };
      }),
    };
  }
}

