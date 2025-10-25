/**
 * API Load Testing with Autocannon
 * 
 * Tests API endpoints under concurrent load
 * 
 * Install: pnpm add -D autocannon
 * Run: node performance/load-tests/api-load.js
 */

const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  url: process.env.API_URL || 'http://localhost:3000',
  connections: 10, // Concurrent connections
  duration: 30, // Test duration in seconds
  timeout: 10, // Request timeout in seconds
};

// Test scenarios
const scenarios = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/api/health',
  },
  {
    name: 'Component Search',
    method: 'POST',
    path: '/api/search/components',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      userId: 'test-user-id',
      query: 'software engineer',
      limit: 10,
    }),
  },
  {
    name: 'CV Match',
    method: 'POST',
    path: '/api/cv/match',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      userId: 'test-user-id',
      jobDescription: 'Senior Software Engineer with React experience',
      topK: 10,
    }),
  },
];

// Run load test for a scenario
async function runLoadTest(scenario) {
  console.log(`\n🚀 Starting load test: ${scenario.name}`);
  console.log(`   URL: ${config.url}${scenario.path}`);
  console.log(`   Connections: ${config.connections}`);
  console.log(`   Duration: ${config.duration}s\n`);

  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url: config.url,
      connections: config.connections,
      duration: config.duration,
      timeout: config.timeout,
      requests: [scenario],
    });

    // Show progress bar
    autocannon.track(instance, { renderProgressBar: true });

    instance.on('done', (results) => {
      console.log(`\n✅ Load test completed: ${scenario.name}\n`);
      
      // Print results
      console.log('📊 Results:');
      console.log(`   Requests: ${results.requests.total}`);
      console.log(`   Requests/sec: ${results.requests.average.toFixed(2)}`);
      console.log(`   Latency (avg): ${results.latency.mean.toFixed(2)}ms`);
      console.log(`   Latency (P50): ${results.latency.p50.toFixed(2)}ms`);
      console.log(`   Latency (P95): ${results.latency.p95.toFixed(2)}ms`);
      console.log(`   Latency (P99): ${results.latency.p99.toFixed(2)}ms`);
      console.log(`   Throughput: ${(results.throughput.average / 1024).toFixed(2)} KB/sec`);
      console.log(`   Errors: ${results.errors}`);
      console.log(`   Timeouts: ${results.timeouts}`);
      console.log(`   2xx responses: ${results['2xx'] || 0}`);
      console.log(`   4xx responses: ${results['4xx'] || 0}`);
      console.log(`   5xx responses: ${results['5xx'] || 0}`);

      // Save results
      const resultsDir = path.join(__dirname, '../results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }

      const filename = `${scenario.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
      const filepath = path.join(resultsDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
      console.log(`\n💾 Results saved: ${filepath}`);

      // Assert performance requirements
      const avgLatency = results.latency.mean;
      const errorRate = (results.errors / results.requests.total) * 100;
      
      if (avgLatency > 1000) {
        console.warn(`⚠️  WARNING: Average latency (${avgLatency.toFixed(2)}ms) exceeds 1000ms`);
      }
      
      if (errorRate > 1) {
        console.warn(`⚠️  WARNING: Error rate (${errorRate.toFixed(2)}%) exceeds 1%`);
      }
      
      if (avgLatency <= 1000 && errorRate <= 1) {
        console.log('✅ Performance requirements met!');
      }

      resolve(results);
    });

    instance.on('error', (error) => {
      console.error(`❌ Load test failed: ${error.message}`);
      reject(error);
    });
  });
}

// Run all scenarios
async function runAllTests() {
  console.log('🎯 API Load Testing Suite\n');
  console.log('Configuration:');
  console.log(`  Base URL: ${config.url}`);
  console.log(`  Connections: ${config.connections}`);
  console.log(`  Duration: ${config.duration}s`);
  console.log(`  Timeout: ${config.timeout}s`);

  const results = [];

  for (const scenario of scenarios) {
    try {
      const result = await runLoadTest(scenario);
      results.push({ scenario: scenario.name, result });
    } catch (error) {
      console.error(`❌ Scenario failed: ${scenario.name}`);
      results.push({ scenario: scenario.name, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOAD TEST SUMMARY');
  console.log('='.repeat(60));

  results.forEach(({ scenario, result, error }) => {
    if (error) {
      console.log(`\n❌ ${scenario}: FAILED`);
      console.log(`   Error: ${error}`);
    } else {
      console.log(`\n✅ ${scenario}:`);
      console.log(`   Requests/sec: ${result.requests.average.toFixed(2)}`);
      console.log(`   Avg Latency: ${result.latency.mean.toFixed(2)}ms`);
      console.log(`   P95 Latency: ${result.latency.p95.toFixed(2)}ms`);
      console.log(`   Errors: ${result.errors}`);
    }
  });

  console.log('\n' + '='.repeat(60));
}

// Main execution
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('\n✅ All load tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Load testing failed:', error);
      process.exit(1);
    });
}

module.exports = { runLoadTest, runAllTests };

