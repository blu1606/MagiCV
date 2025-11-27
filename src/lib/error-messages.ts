/**
 * User-Friendly Error Messages
 *
 * Maps technical error messages to user-friendly explanations with actionable guidance
 */

export interface ErrorDetail {
  /** User-friendly error message */
  message: string;
  /** Suggested action to resolve the issue */
  action?: string;
  /** Link to help documentation */
  helpLink?: string;
}

/**
 * Simple error messages (for backward compatibility)
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

/**
 * Detailed error messages with actions and help links
 */
export const ERROR_DETAILS: Record<string, ErrorDetail> = {
  // CV Generation Errors
  'Failed to generate CV': {
    message: 'We encountered an issue while creating your CV.',
    action: 'Try again',
    helpLink: '/help/cv-generation',
  },
  'Generation failed': {
    message: 'Your CV could not be generated at this time.',
    action: 'Please try again in a few moments',
  },
  'Failed to generate PDF': {
    message: 'The PDF file could not be created.',
    action: 'Try generating your CV again',
  },

  // Profile Errors
  'Profile not found': {
    message: 'Please complete your profile to generate a CV.',
    action: 'Go to Profile Settings',
    helpLink: '/dashboard/profile',
  },
  'User profile not found': {
    message: 'Your profile information is missing.',
    action: 'Set up your profile',
    helpLink: '/dashboard/profile',
  },

  // Authentication Errors
  'Unauthorized': {
    message: 'You need to be signed in to access this feature.',
    action: 'Sign in to continue',
  },
  'Unauthorized - Please login first': {
    message: 'Your session has expired.',
    action: 'Please sign in again',
  },
  'Forbidden': {
    message: 'You don\'t have permission to perform this action.',
    action: 'Contact support if you believe this is an error',
  },

  // Network Errors
  'Network request failed': {
    message: 'Unable to connect to the server.',
    action: 'Check your internet connection and try again',
  },
  'fetch failed': {
    message: 'Connection to the server failed.',
    action: 'Verify your internet connection and retry',
  },
  'timeout': {
    message: 'The request took too long to complete.',
    action: 'Try again',
  },

  // AI Service Errors
  'Failed to generate embedding': {
    message: 'The AI service is temporarily unavailable.',
    action: 'Please try again in a moment',
  },
  'Embedding generation failed': {
    message: 'AI processing failed.',
    action: 'Retry',
  },

  // CV Errors
  'CV not found': {
    message: 'This CV no longer exists.',
    action: 'Return to dashboard',
    helpLink: '/dashboard',
  },
  'No PDF found for this CV': {
    message: 'No PDF is available for this CV.',
    action: 'Regenerate the CV',
  },
  'Failed to download PDF from storage': {
    message: 'The PDF file could not be retrieved.',
    action: 'Try regenerating your CV',
  },

  // Component Errors
  'No components found': {
    message: 'No work experience or skills have been imported yet.',
    action: 'Import your data from GitHub or LinkedIn',
    helpLink: '/dashboard/profile',
  },
  'No matching components found': {
    message: 'We couldn\'t find relevant experience for this job.',
    action: 'Try importing more data or adjust the job description',
  },

  // Validation Errors
  'jobDescription is required': {
    message: 'A job description is needed to continue.',
    action: 'Provide a job description',
  },
  'userId and jobDescription are required': {
    message: 'Required information is missing.',
    action: 'Make sure you\'re signed in and try again',
  },

  // Server Errors
  'Internal Server Error': {
    message: 'Something went wrong on our end.',
    action: 'We\'re working to fix this. Please try again later',
  },
  'Bad Request': {
    message: 'The request couldn\'t be processed.',
    action: 'Check your input and try again',
  },
};

/**
 * Get detailed error information
 */
export function getErrorDetail(error: Error | string | unknown): ErrorDetail {
  // Handle string errors
  if (typeof error === 'string') {
    if (ERROR_DETAILS[error]) {
      return ERROR_DETAILS[error];
    }
    return {
      message: USER_FRIENDLY_ERRORS[error] || error,
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Check for exact match in detailed errors
    if (ERROR_DETAILS[message]) {
      return ERROR_DETAILS[message];
    }

    // Check for partial matches (case-insensitive)
    const lowerMessage = message.toLowerCase();
    for (const [key, value] of Object.entries(ERROR_DETAILS)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return value;
      }
    }

    // Fallback to simple errors
    const simpleError = getUserFriendlyError(error);
    return {
      message: simpleError,
    };
  }

  // Handle unknown error types
  return {
    message: 'Something went wrong. Please try again or contact support.',
    action: 'Contact support if this issue persists',
  };
}

/**
 * Generate error reference ID for support tracking
 */
export function generateErrorReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ERR-${timestamp}-${random}`;
}

/**
 * Format error for display with optional reference ID
 */
export function formatErrorForDisplay(
  error: Error | string | unknown,
  includeReference = false
): {
  message: string;
  action?: string;
  helpLink?: string;
  reference?: string;
} {
  const detail = getErrorDetail(error);
  const result = {
    message: detail.message,
    action: detail.action,
    helpLink: detail.helpLink,
    reference: includeReference ? generateErrorReference() : undefined,
  };

  return result;
}

