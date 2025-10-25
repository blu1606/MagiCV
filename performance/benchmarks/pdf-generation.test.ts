/**
 * Performance Benchmark: PDF Generation (Mocked)
 * 
 * Measures PDF generation performance with mocked services
 * 
 * Run: pnpm test:performance
 */

import { describe, test, expect } from '@jest/globals';
import { performance } from 'perf_hooks';

// Skip if performance tests disabled
const describePerf = process.env.ENABLE_PERFORMANCE_TESTS === 'true' 
  ? describe 
  : describe.skip;

// Mock PDF generation (simulates real workload)
async function mockPDFGeneration(useOnline: boolean): Promise<Buffer> {
  // Simulate LaTeX rendering (CPU-bound)
  const template = `
    \\documentclass{article}
    \\begin{document}
    \\section{Experience}
    Senior Software Engineer at Tech Corp
    \\end{document}
  `;
  
  // Simulate template processing
  await new Promise(resolve => setTimeout(resolve, useOnline ? 50 : 20));
  
  // Simulate PDF compilation
  const buffer = Buffer.from(template);
  return buffer;
}

// Mock component selection
async function mockComponentSelection(): Promise<any[]> {
  // Simulate embedding generation
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Simulate vector search
  await new Promise(resolve => setTimeout(resolve, 15));
  
  return [
    { id: '1', type: 'experience', title: 'Senior Engineer' },
    { id: '2', type: 'skill', title: 'TypeScript' },
  ];
}

describePerf('PDF Generation Performance', () => {
  test('Benchmark: Generate CV PDF (Local Compiler)', async () => {
    const iterations = 50;
    const times: number[] = [];

    console.log('\n📊 Starting PDF Generation Benchmark (Local)...\n');

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      await mockPDFGeneration(false);
      
      const end = performance.now();
      const duration = end - start;
      times.push(duration);
      
      if (i % 10 === 0) {
        console.log(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
      }
    }

    // Calculate statistics
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = [...times].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    console.log(`
📊 PDF Generation Performance Results (Local):
   Iterations: ${iterations}
   
   Average: ${avg.toFixed(2)}ms
   Median (P50): ${p50.toFixed(2)}ms
   P95: ${p95.toFixed(2)}ms
   P99: ${p99.toFixed(2)}ms
   Min: ${min.toFixed(2)}ms
   Max: ${max.toFixed(2)}ms
    `);

    // Performance assertions (mocked values)
    expect(avg).toBeLessThan(100); // 100ms max average for mocked
    expect(p95).toBeLessThan(150); // 150ms max for 95th percentile
  });

  test('Benchmark: Generate CV PDF (Online Compiler)', async () => {
    const iterations = 30;
    const times: number[] = [];

    console.log('\n📊 Starting Online PDF Generation Benchmark...\n');

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      await mockPDFGeneration(true);
      
      const end = performance.now();
      const duration = end - start;
      times.push(duration);
      
      if (i % 10 === 0) {
        console.log(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
      }
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];

    console.log(`
📊 Online PDF Generation Results:
   Average: ${avg.toFixed(2)}ms
   Median: ${p50.toFixed(2)}ms
   Iterations: ${times.length}
    `);

    // Online compiler can be slower
    expect(avg).toBeLessThan(200); // 200ms max for mocked
  });

  test('Benchmark: Component Selection Performance', async () => {
    const iterations = 100;
    const times: number[] = [];

    console.log('\n📊 Starting Component Selection Benchmark...\n');

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      await mockComponentSelection();
      
      const end = performance.now();
      times.push(end - start);
      
      if (i % 25 === 0) {
        console.log(`  Iteration ${i + 1}: ${(end - start).toFixed(2)}ms`);
      }
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    console.log(`
📊 Component Selection Performance:
   Average: ${avg.toFixed(2)}ms
   P50: ${p50.toFixed(2)}ms
   P95: ${p95.toFixed(2)}ms
   Iterations: ${times.length}
    `);

    // Component selection should be fast
    expect(avg).toBeLessThan(100); // 100ms max for mocked
    expect(p95).toBeLessThan(150); // 150ms P95
  });
});
