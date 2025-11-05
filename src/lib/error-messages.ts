/**
 * User-Friendly Error Messages
 * 
 * Maps technical error messages to user-friendly explanations
 */

export const USER_FRIENDLY_ERRORS: Record<string, string> = {
  // API Key Errors
  'GOOGLE_GENERATIVE_AI_API_KEY not found':
    'AI service is temporarily unavailable. Please try again later.',
  'GOOGLE_GENERATIVE_AI_API_KEY is required':
    'AI service configuration is missing. Please contact support.',
  
  // Profile Errors
  'Profile not found':
    'Please complete your profile setup first.',
  'User profile not found':
    'Please complete your profile setup first.',
  'User not found':
    'Your account could not be found. Please try logging in again.',
  
  // Component Errors
  'No components found':
    'Import your data from GitHub or LinkedIn to get started.',
  'No matching components found':
    'No relevant experience or skills found for this job. Try importing more data or adjusting the job description.',
  
  // PDF Generation Errors
  'pdflatex is not installed':
    'PDF generation is processing. This may take a few moments.',
  'Failed to compile LaTeX':
    'PDF generation failed. Please try again or contact support if the issue persists.',
  'Failed to generate PDF':
    'PDF generation failed. Please try again.',
  
  // Embedding Errors
  'Failed to generate embedding':
    'Connection to AI service failed. Please check your internet connection and try again.',
  'Embedding generation failed':
    'Processing failed. Please try again.',
  
  // Authentication Errors
  'Unauthorized':
    'Please log in to continue.',
  'Unauthorized - Please login first':
    'Please log in to continue.',
  'Forbidden':
    'You do not have permission to perform this action.',
  
  // CV Errors
  'CV not found':
    'This CV could not be found. It may have been deleted.',
  'No PDF found for this CV':
    'No PDF is available for this CV. Please regenerate it first.',
  'Failed to download PDF from storage':
    'The PDF file could not be retrieved. Please try regenerating the CV.',
  
  // Job Description Errors
  'jobDescription is required':
    'Please provide a job description to continue.',
  'userId and jobDescription are required':
    'Missing required information. Please try again.',
  
  // Network Errors
  'Network request failed':
    'Connection failed. Please check your internet connection and try again.',
  'fetch failed':
    'Connection failed. Please check your internet connection and try again.',
  'timeout':
    'Request timed out. Please try again.',
  
  // Generic Errors
  'Internal Server Error':
    'Something went wrong on our end. Please try again in a few moments.',
  'Bad Request':
    'Invalid request. Please check your input and try again.',
};

/**
 * Get user-friendly error message from an error
 */
export function getUserFriendlyError(error: Error | string | unknown): string {
  // Handle string errors
  if (typeof error === 'string') {
    return USER_FRIENDLY_ERRORS[error] || error;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    
    // Check for exact match
    if (USER_FRIENDLY_ERRORS[message]) {
      return USER_FRIENDLY_ERRORS[message];
    }
    
    // Check for partial matches (case-insensitive)
    const lowerMessage = message.toLowerCase();
    for (const [key, value] of Object.entries(USER_FRIENDLY_ERRORS)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // Return original message if no match found
    return message;
  }
  
  // Handle unknown error types
  return 'Something went wrong. Please try again or contact support.';
}

/**
 * Check if an error is a known error type
 */
export function isKnownError(error: Error | string | unknown): boolean {
  if (typeof error === 'string') {
    return error in USER_FRIENDLY_ERRORS;
  }
  
  if (error instanceof Error) {
    const message = error.message;
    if (message in USER_FRIENDLY_ERRORS) {
      return true;
    }
    
    // Check for partial matches
    const lowerMessage = message.toLowerCase();
    return Object.keys(USER_FRIENDLY_ERRORS).some(key => 
      lowerMessage.includes(key.toLowerCase())
    );
  }
  
  return false;
}

