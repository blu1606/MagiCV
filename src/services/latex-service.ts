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
    try {
      console.log('🌐 Compiling LaTeX using online service...');
      const fetch = (await import('node-fetch')).default as any;

      // Strategy 1: POST raw text to /compile (preferred, simpler)
      const resp1 = await fetch('https://latexonline.cc/compile?command=pdflatex', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: latexContent,
      });

      if (resp1.ok) {
        const buf = await resp1.buffer();
        console.log('✅ PDF compiled successfully (online, text)');
        return buf;
      }

      // Strategy 2: multipart/form-data with file field (fallback)
      const FormData = (await import('form-data')).default as any;
      const form = new FormData();
      form.append('file', Buffer.from(latexContent), {
        filename: 'document.tex',
        contentType: 'text/plain',
      });

      const resp2 = await fetch('https://latexonline.cc/compile?command=pdflatex', {
        method: 'POST',
        body: form,
        headers: form.getHeaders ? form.getHeaders() : undefined,
      });

      if (!resp2.ok) {
        throw new Error(`HTTP ${resp2.status}: ${resp2.statusText}`);
      }

      const pdfBuffer = await resp2.buffer();
      console.log('✅ PDF compiled successfully (online, multipart)');
      return pdfBuffer;
    } catch (error: any) {
      console.error('❌ Online LaTeX compilation error:', error.message);
      throw new Error(`Failed to compile LaTeX online: ${error.message}`);
    }
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

