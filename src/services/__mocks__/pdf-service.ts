/**
 * Mock for PDFService
 */

export class PDFService {
  static async extract(pdfBuffer: Buffer): Promise<string> {
    // Return mock extracted text
    return `
Senior Software Engineer
Requirements:
- 5+ years of experience
- JavaScript, TypeScript, React, Node.js
- Bachelor's degree in Computer Science
`;
  }

  static async parse(text: string): Promise<any> {
    return {
      title: 'Senior Software Engineer',
      requirements: ['5+ years experience', 'JavaScript', 'TypeScript'],
      description: text,
    };
  }
}

