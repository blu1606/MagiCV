/**
 * Jest Mock for LaTeXService
 * 
 * Provides comprehensive mocking for LaTeXService methods
 * with realistic LaTeX content and PDF buffers
 */

import { jest } from '@jest/globals';

// ============================================
// MOCK DATA - Realistic Test Data
// ============================================

/**
 * Mock LaTeX Template Content
 */
export const mockLatexTemplate = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{top=0.5in, bottom=0.5in, left=0.5in, right=0.5in}

\\begin{document}

\\section*{{{ profile.name }}}
\\textbf{Email:} {{ profile.email }} \\\\
\\textbf{Phone:} {{ profile.phone }} \\\\

\\section*{Experience}
{% for exp in experience %}
\\textbf{{{ exp.title }}} at {{ exp.organization }} \\\\
{{ exp.start }} - {{ exp.end }} \\\\
\\begin{itemize}
{% for bullet in exp.bullets %}
  \\item {{ bullet }}
{% endfor %}
\\end{itemize}
{% endfor %}

\\end{document}`;

/**
 * Mock Rendered LaTeX Content (after template processing)
 */
export const mockLatexRendered = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{top=0.5in, bottom=0.5in, left=0.5in, right=0.5in}

\\begin{document}

\\section*{John Doe}
\\textbf{Email:} john@example.com \\\\
\\textbf{Phone:} (555) 123-4567 \\\\

\\section*{Experience}
\\textbf{Senior Software Engineer} at Tech Corp \\\\
Jan 2020 - Present \\\\
\\begin{itemize}
  \\item Led development of microservices architecture
  \\item Reduced API response time by 60\\%
  \\item Mentored team of 5 developers
\\end{itemize}

\\end{document}`;

/**
 * Mock PDF Buffer (realistic PDF binary header)
 */
export const mockPDFBuffer = Buffer.from(
  '%PDF-1.4\n' +
  '1 0 obj\n' +
  '<< /Type /Catalog /Pages 2 0 R >>\n' +
  'endobj\n' +
  '2 0 obj\n' +
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n' +
  'endobj\n' +
  '3 0 obj\n' +
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\n' +
  'endobj\n' +
  'xref\n' +
  '0 4\n' +
  'trailer\n' +
  '<< /Size 4 /Root 1 0 R >>\n' +
  'startxref\n' +
  '%%EOF\n'
);

/**
 * Mock Large PDF Buffer (simulating real PDF)
 */
export const mockPDFBufferLarge = Buffer.alloc(50000, '%PDF-1.4 content...');

/**
 * Mock Default Margins
 */
export const mockMargins = {
  top: '0.5in',
  bottom: '0.5in',
  left: '0.5in',
  right: '0.5in',
};

/**
 * Mock Custom Margins
 */
export const mockMarginsCustom = {
  top: '1in',
  bottom: '1in',
  left: '0.75in',
  right: '0.75in',
};

/**
 * Mock CV Data for Template
 */
export const mockCVData = {
  profile: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St',
    city_state_zip: 'San Francisco, CA 94105',
  },
  margins: mockMargins,
  education: [
    {
      id: 'edu_1',
      school: 'Stanford University',
      degree: 'BSc Computer Science',
      concentration: 'AI/ML',
      location: 'Stanford, CA',
      graduation_date: 'May 2019',
      gpa: '3.8/4.0',
      coursework: ['Algorithms', 'Machine Learning'],
      awards: ['Dean\'s List'],
    },
  ],
  experience: [
    {
      id: 'exp_1',
      title: 'Senior Software Engineer',
      organization: 'Tech Corp',
      location: 'San Francisco, CA',
      remote: false,
      start: 'Jan 2020',
      end: 'Present',
      bullets: [
        'Led development of microservices architecture',
        'Reduced API response time by 60%',
        'Mentored team of 5 developers',
      ],
    },
  ],
  skills: {
    technical: ['TypeScript', 'React', 'Node.js', 'Python'],
    languages: [{ name: 'English', level: 'Native' }],
    interests: ['AI/ML', 'Open Source'],
  },
  leadership: [],
};

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Factory: Create Mock LaTeX Content
 * @param includeErrors - Include LaTeX syntax errors
 */
export const createMockLatexContent = (includeErrors: boolean = false): string => {
  if (includeErrors) {
    return '\\documentclass{article}\n\\begin{document}\n\\section{Test}\n'; // Missing \end{document}
  }
  return mockLatexRendered;
};

/**
 * Factory: Create Mock PDF Buffer
 * @param size - Buffer size in bytes (default: realistic PDF size)
 */
export const createMockPDFBuffer = (size: number = 1024): Buffer => {
  if (size < 100) {
    return Buffer.from('%PDF-1.4\n%%EOF\n');
  }
  
  const header = '%PDF-1.4\n';
  const footer = '\n%%EOF\n';
  const contentSize = size - header.length - footer.length;
  const content = 'x'.repeat(Math.max(0, contentSize));
  
  return Buffer.from(header + content + footer);
};

/**
 * Factory: Create Mock Margins
 * @param overrides - Custom margin values
 */
export const createMockMargins = (overrides?: Partial<typeof mockMargins>) => {
  return {
    ...mockMargins,
    ...overrides,
  };
};

/**
 * Factory: Create Mock CV Data
 * @param overrides - Custom CV data
 */
export const createMockCVData = (overrides?: Partial<typeof mockCVData>) => {
  return {
    ...mockCVData,
    ...overrides,
  };
};

// ============================================
// MOCK SERVICE - Jest Mock Functions
// ============================================

/**
 * LaTeXService Mock
 * All methods are jest.fn() with proper TypeScript typing
 */
export const LaTeXServiceMock = {
  /**
   * Get default margin settings
   */
  getDefaultMargins: jest.fn<
    () => { top: string; bottom: string; left: string; right: string }
  >(),

  /**
   * Render Nunjucks template with data
   */
  renderTemplate: jest.fn<(templateName: string, data: any) => Promise<string>>(),

  /**
   * Generate PDF using local pdflatex
   */
  generatePDF: jest.fn<(templateName: string, data: any) => Promise<Buffer>>(),

  /**
   * Generate PDF using online compiler
   */
  generatePDFOnline: jest.fn<(latexContent: string) => Promise<Buffer>>(),

  /**
   * Compile LaTeX to PDF (generic)
   */
  compileLaTeX: jest.fn<(latexContent: string) => Promise<Buffer>>(),

  /**
   * Validate LaTeX syntax
   */
  validateLatexSyntax: jest.fn<(latexContent: string) => Promise<boolean>>(),

  /**
   * Clean temporary LaTeX files
   */
  cleanTempFiles: jest.fn<(directory: string) => Promise<void>>(),
};

// ============================================
// SETUP HELPERS - Mock Configuration
// ============================================

/**
 * Setup LaTeXService Mocks with Default Success Behavior
 */
export const setupLaTeXMocks = () => {
  // getDefaultMargins() - Return standard margins
  LaTeXServiceMock.getDefaultMargins.mockReturnValue(mockMargins);

  // renderTemplate() - Return rendered LaTeX
  LaTeXServiceMock.renderTemplate.mockResolvedValue(mockLatexRendered);

  // generatePDF() - Return PDF buffer
  LaTeXServiceMock.generatePDF.mockResolvedValue(mockPDFBuffer);

  // generatePDFOnline() - Return PDF buffer
  LaTeXServiceMock.generatePDFOnline.mockResolvedValue(mockPDFBuffer);

  // compileLaTeX() - Return PDF buffer
  LaTeXServiceMock.compileLaTeX.mockResolvedValue(mockPDFBuffer);

  // validateLatexSyntax() - Return true (valid)
  LaTeXServiceMock.validateLatexSyntax.mockResolvedValue(true);

  // cleanTempFiles() - Resolve successfully
  LaTeXServiceMock.cleanTempFiles.mockResolvedValue();
};

/**
 * Reset All LaTeXService Mocks
 */
export const resetLaTeXMocks = () => {
  Object.values(LaTeXServiceMock).forEach((mockFn) => {
    if (typeof mockFn === 'function' && 'mockReset' in mockFn) {
      mockFn.mockReset();
    }
  });
};

/**
 * Set Mock to Return Success with Custom PDF
 * @param pdfBuffer - Custom PDF buffer
 */
export const setMockSuccess = (pdfBuffer: Buffer = mockPDFBuffer) => {
  LaTeXServiceMock.generatePDF.mockResolvedValue(pdfBuffer);
  LaTeXServiceMock.generatePDFOnline.mockResolvedValue(pdfBuffer);
  LaTeXServiceMock.compileLaTeX.mockResolvedValue(pdfBuffer);
};

/**
 * Set Mock to Throw Error
 * @param method - Method to mock
 * @param error - Error to throw
 */
export const setMockError = (
  method: keyof typeof LaTeXServiceMock,
  error: Error | string
) => {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  (LaTeXServiceMock[method] as any).mockRejectedValue(errorObj);
};

/**
 * Set Mock to Simulate pdflatex Not Found Error
 */
export const setMockPdflatexNotFound = () => {
  const error = new Error('pdflatex not found in PATH');
  (error as any).code = 'ENOENT';
  LaTeXServiceMock.generatePDF.mockRejectedValue(error);
};

/**
 * Set Mock to Simulate LaTeX Compilation Error
 */
export const setMockCompilationError = () => {
  const error = new Error('LaTeX compilation failed: Undefined control sequence');
  (error as any).code = 'LATEX_ERROR';
  LaTeXServiceMock.generatePDF.mockRejectedValue(error);
  LaTeXServiceMock.compileLaTeX.mockRejectedValue(error);
};

/**
 * Set Mock to Simulate Template Not Found Error
 */
export const setMockTemplateNotFound = () => {
  const error = new Error('Template file not found: resume.tex.njk');
  (error as any).code = 'ENOENT';
  LaTeXServiceMock.renderTemplate.mockRejectedValue(error);
  LaTeXServiceMock.generatePDF.mockRejectedValue(error);
};

/**
 * Set Mock to Simulate Online Compiler Unavailable
 */
export const setMockOnlineCompilerUnavailable = () => {
  const error = new Error('Online compiler service unavailable');
  (error as any).code = 'SERVICE_UNAVAILABLE';
  (error as any).statusCode = 503;
  LaTeXServiceMock.generatePDFOnline.mockRejectedValue(error);
};

/**
 * Set Mock to Return Invalid LaTeX Syntax
 */
export const setMockInvalidSyntax = () => {
  LaTeXServiceMock.validateLatexSyntax.mockResolvedValue(false);
  LaTeXServiceMock.renderTemplate.mockResolvedValue(
    createMockLatexContent(true) // With errors
  );
};

/**
 * Set Mock to Use Large PDF (for performance testing)
 */
export const setMockLargePDF = () => {
  LaTeXServiceMock.generatePDF.mockResolvedValue(mockPDFBufferLarge);
  LaTeXServiceMock.generatePDFOnline.mockResolvedValue(mockPDFBufferLarge);
};

// ============================================
// TEST UTILITIES
// ============================================

/**
 * Validate PDF Buffer
 * @param buffer - Buffer to validate
 */
export const validatePDFBuffer = (buffer: Buffer): boolean => {
  if (!Buffer.isBuffer(buffer)) {
    return false;
  }

  if (buffer.length < 10) {
    return false;
  }

  // Check PDF header
  const header = buffer.toString('utf-8', 0, 8);
  return header.startsWith('%PDF-');
};

/**
 * Get PDF Version from Buffer
 * @param buffer - PDF buffer
 */
export const getPDFVersion = (buffer: Buffer): string | null => {
  if (!validatePDFBuffer(buffer)) {
    return null;
  }

  const header = buffer.toString('utf-8', 0, 10);
  const match = header.match(/%PDF-([\d.]+)/);
  return match ? match[1] : null;
};

/**
 * Validate LaTeX Content
 * @param content - LaTeX content to validate
 */
export const validateLatexContent = (content: string): boolean => {
  // Basic validation
  if (!content || content.trim().length === 0) {
    return false;
  }

  // Check for \documentclass
  if (!content.includes('\\documentclass')) {
    return false;
  }

  // Check for \begin{document} and \end{document}
  const hasBegin = content.includes('\\begin{document}');
  const hasEnd = content.includes('\\end{document}');

  return hasBegin && hasEnd;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default LaTeXServiceMock;

