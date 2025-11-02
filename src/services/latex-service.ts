import nunjucks from 'nunjucks';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * LaTeX Service - Render templates and compile to PDF
 */
export class LaTeXService {
  private static templateDir = path.join(process.cwd());

  /**
   * Configure nunjucks environment
   */
  private static configureNunjucks() {
    const env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(this.templateDir),
      {
        autoescape: false, // LaTeX has its own escaping
        trimBlocks: true,
        lstripBlocks: true,
      }
    );
    return env;
  }

  /**
   * Render LaTeX template with data
   */
  static async renderTemplate(
    templateName: string,
    data: any
  ): Promise<string> {
    try {
      const env = this.configureNunjucks();
      const rendered = env.render(templateName, data);
      return rendered;
    } catch (error: any) {
      console.error('❌ Template rendering error:', error.message);
      throw new Error(`Failed to render template: ${error.message}`);
    }
  }

  /**
   * Compile LaTeX to PDF using pdflatex
   * Note: Requires pdflatex to be installed on the system
   */
  static async compileToPDF(
    latexContent: string,
    outputFilename: string = 'output'
  ): Promise<Buffer> {
    const tempDir = path.join(process.cwd(), 'temp');
    const texFile = path.join(tempDir, `${outputFilename}.tex`);
    const pdfFile = path.join(tempDir, `${outputFilename}.pdf`);

    try {
      // Create temp directory if not exists
      await fs.mkdir(tempDir, { recursive: true });

      // Write LaTeX content to file
      await fs.writeFile(texFile, latexContent, 'utf-8');

      console.log('🔨 Compiling LaTeX to PDF...');

      // Check if pdflatex is available
      try {
        await execAsync('which pdflatex');
      } catch {
        throw new Error('pdflatex is not installed. Please install TeX Live or MiKTeX.');
      }

      // Compile LaTeX to PDF (run twice for references)
      const compileCommand = `cd ${tempDir} && pdflatex -interaction=nonstopmode -output-directory=${tempDir} ${texFile}`;
      
      await execAsync(compileCommand);
      // Run second time for references
      await execAsync(compileCommand);

      console.log('✅ PDF compiled successfully');

      // Read PDF file
      const pdfBuffer = await fs.readFile(pdfFile);

      // Clean up temporary files
      await this.cleanupTempFiles(tempDir, outputFilename);

      return pdfBuffer;
    } catch (error: any) {
      console.error('❌ LaTeX compilation error:', error.message);
      
      // Try to read log file for more details
      try {
        const logFile = path.join(tempDir, `${outputFilename}.log`);
        const logContent = await fs.readFile(logFile, 'utf-8');
        const errorLines = logContent.split('\n').filter(line => 
          line.includes('!') || line.includes('Error')
        );
        console.error('LaTeX errors:', errorLines.join('\n'));
      } catch {}

      throw new Error(`Failed to compile LaTeX to PDF: ${error.message}`);
    }
  }

  /**
   * Clean up temporary LaTeX files
   */
  private static async cleanupTempFiles(
    tempDir: string,
    basename: string
  ): Promise<void> {
    const extensions = ['.aux', '.log', '.out', '.tex'];
    
    for (const ext of extensions) {
      try {
        await fs.unlink(path.join(tempDir, `${basename}${ext}`));
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Generate PDF from template and data
   * Main method that combines rendering and compilation
   */
  static async generatePDF(
    templateName: string,
    data: any,
    outputFilename: string = 'resume'
  ): Promise<Buffer> {
    console.log('📝 Generating PDF from template...');
    
    // Render template
    const latexContent = await this.renderTemplate(templateName, data);
    
    // Compile to PDF
    const pdfBuffer = await this.compileToPDF(latexContent, outputFilename);
    
    return pdfBuffer;
  }

  /**
   * Alternative: Generate PDF using online service (fallback if pdflatex not available)
   * Using LaTeX.Online API
   */
  static async generatePDFOnline(
    latexContent: string
  ): Promise<Buffer> {
    const fetch = (await import('node-fetch')).default;
    const FormData = require('form-data');

    console.log('🌐 Compiling LaTeX using online service...');

    // List of free LaTeX compilation services
    const services = [
      {
        name: 'latex.ytotech.com',
        compile: async () => {
          const form = new FormData();
          form.append('compiler', 'pdflatex');
          form.append('resources[]', Buffer.from(latexContent), {
            filename: 'main.tex',
            contentType: 'text/x-tex',
          });

          const response = await fetch('https://latex.ytotech.com/builds/sync', {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          return await response.buffer();
        }
      },
      {
        name: 'texlive.net',
        compile: async () => {
          const form = new FormData();
          form.append('filecontents[]', latexContent);
          form.append('filename[]', 'document.tex');
          form.append('engine', 'pdflatex');

          const response = await fetch('https://texlive.net/cgi-bin/latexcgi', {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          return await response.buffer();
        }
      },
      {
        name: 'latexbase.com',
        compile: async () => {
          // LaTeX Base API
          const response = await fetch('https://latexbase.com/api/v1/compile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latex: latexContent,
              format: 'pdf',
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const result = await response.json();
          if (result.pdf_url) {
            const pdfResponse = await fetch(result.pdf_url);
            return await pdfResponse.buffer();
          }

          throw new Error('No PDF URL returned');
        }
      }
    ];

    // Try each service sequentially
    const errors: string[] = [];

    for (const service of services) {
      try {
        console.log(`  → Trying ${service.name}...`);
        const pdfBuffer = await service.compile();
        console.log(`✅ PDF compiled successfully (${service.name})`);
        return pdfBuffer;
      } catch (error: any) {
        const errorMsg = `${service.name}: ${error.message}`;
        console.warn(`  ✗ ${errorMsg}`);
        errors.push(errorMsg);
        continue;
      }
    }

    // All services failed
    const errorMessage = `All online LaTeX compilers failed:\n${errors.join('\n')}`;
    console.error('❌ Online LaTeX compilation error:', errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * Validate template data structure
   */
  static validateResumeData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!data.profile) {
      errors.push('profile is required');
    } else {
      if (!data.profile.name) errors.push('profile.name is required');
      if (!data.profile.email) errors.push('profile.email is required');
    }

    if (!data.margins) {
      errors.push('margins is required');
    } else {
      const requiredMargins = ['left', 'right', 'top', 'bottom'];
      requiredMargins.forEach(m => {
        if (!data.margins[m]) errors.push(`margins.${m} is required`);
      });
    }

    if (!data.education || !Array.isArray(data.education)) {
      errors.push('education must be an array');
    }

    if (!data.experience || !Array.isArray(data.experience)) {
      errors.push('experience must be an array');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get default margins
   */
  static getDefaultMargins() {
    return {
      left: '1.5cm',
      right: '1.5cm',
      top: '2cm',
      bottom: '2cm',
    };
  }
}

