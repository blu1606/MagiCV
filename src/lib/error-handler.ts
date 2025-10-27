// Error Handler - Placeholder for error handling
export const errorHandler = {
  handleAPIError(error: any): { message: string, code?: string } {
    if (error instanceof Error) {
      return { message: error.message }
    }
    return { message: 'An unexpected error occurred' }
  }
}

