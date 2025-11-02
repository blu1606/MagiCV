import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * LLM Utilities Service
 * Provides robust LLM interaction with validation, retry logic, and JSON parsing
 */
export class LLMUtilsService {
  /**
   * Parse LLM response and extract JSON
   * Handles markdown code blocks and malformed JSON
   */
  static parseJSON<T = any>(responseText: string): T {
    let cleanText = responseText.trim();

    // Remove markdown code blocks
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to parse
    try {
      return JSON.parse(cleanText);
    } catch (error: any) {
      // Try to find JSON object in text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {}
      }

      throw new Error(`Failed to parse JSON from LLM response: ${error.message}`);
    }
  }

  /**
   * Call LLM with retry logic and validation
   */
  static async callWithRetry<T = any>(
    model: any,
    prompt: string,
    options: {
      maxRetries?: number;
      validator?: (result: T) => boolean;
      validatorErrorMessage?: string;
      parseJSON?: boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      validator,
      validatorErrorMessage = 'Validation failed',
      parseJSON = false,
    } = options;

    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Parse JSON if requested
        let parsedResult: any = responseText;
        if (parseJSON) {
          parsedResult = this.parseJSON<T>(responseText);
        }

        // Validate if validator provided
        if (validator && !validator(parsedResult)) {
          throw new Error(validatorErrorMessage);
        }

        return parsedResult;
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ LLM call attempt ${attempt + 1} failed:`, error.message);

        // If last attempt, throw
        if (attempt === maxRetries - 1) {
          break;
        }

        // Wait before retry (exponential backoff)
        const waitMs = 500 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitMs));
      }
    }

    throw new Error(
      `LLM call failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown'}`
    );
  }

  /**
   * Generate structured output with schema validation
   */
  static async generateStructured<T extends object>(
    genAI: GoogleGenerativeAI,
    modelName: string,
    prompt: string,
    schema: {
      requiredFields: (keyof T)[];
      optionalFields?: (keyof T)[];
    },
    options?: {
      maxRetries?: number;
      temperature?: number;
    }
  ): Promise<T> {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
      },
    });

    // Add schema information to prompt
    const enhancedPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON (no markdown formatting, no explanations).
Required fields: ${schema.requiredFields.join(', ')}
${schema.optionalFields ? `Optional fields: ${schema.optionalFields.join(', ')}` : ''}`;

    const result = await this.callWithRetry<T>(model, enhancedPrompt, {
      maxRetries: options?.maxRetries ?? 3,
      parseJSON: true,
      validator: (data: T) => {
        // Check all required fields exist
        for (const field of schema.requiredFields) {
          if (!(field in data)) {
            console.error(`Missing required field: ${String(field)}`);
            return false;
          }
        }
        return true;
      },
      validatorErrorMessage: `Response missing required fields: ${schema.requiredFields.join(', ')}`,
    });

    return result;
  }

  /**
   * Batch LLM calls with concurrency control
   */
  static async batchCalls<T>(
    calls: (() => Promise<T>)[],
    maxConcurrent: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<any>[] = [];

    for (const call of calls) {
      const promise = call().then(result => {
        results.push(result);
        executing.splice(executing.indexOf(promise), 1);
      });

      executing.push(promise);

      if (executing.length >= maxConcurrent) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Stream LLM response (for future use with streaming UI)
   */
  static async *streamResponse(
    model: any,
    prompt: string
  ): AsyncGenerator<string, void, unknown> {
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }
}
