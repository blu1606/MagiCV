/**
 * Mock for LaTeXService
 */

export class LaTeXService {
  static async render(templatePath: string, data: any): Promise<string> {
    // Return mock LaTeX content
    return `
\\documentclass{article}
\\begin{document}
Resume for ${data.name || 'John Doe'}
\\end{document}
`;
  }

  static async compilePDF(latexContent: string): Promise<Buffer> {
    // Return mock PDF buffer
    return Buffer.from('Mock PDF Content');
  }

  static async compileOnline(latexContent: string): Promise<Buffer> {
    // Return mock PDF buffer
    return Buffer.from('Mock PDF Content from Online');
  }

  static validateData(data: any): boolean {
    return true;
  }
}

