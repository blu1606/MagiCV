// API Service - Placeholder for LinkedIn auth integration
export const apiService = {
  async loginWithLinkedIn(code: string, state: string): Promise<{ user: any, token: string }> {
    // TODO: Implement actual LinkedIn OAuth login
    throw new Error('LinkedIn OAuth not yet implemented')
  }
}

