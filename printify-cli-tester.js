#!/usr/bin/env node

// Printify API CLI Tester
// Usage: node printify-cli-tester.js [endpoint] [method] [data]

const PrintifyAPITester = require('./printify-api-tester.js');

async function main() {
  const args = process.argv.slice(2);
  const tester = new PrintifyAPITester();
  
  if (args.length === 0) {
    // Run full test suite
    console.log('Running full Printify API test suite...');
    await tester.runAllTests();
    return;
  }
  
  const [endpoint, method = 'GET', jsonData] = args;
  
  console.log(`Testing endpoint: ${endpoint}`);
  console.log(`Method: ${method}`);
  
  const options = { method };
  
  if (jsonData) {
    try {
      options.body = jsonData;
      console.log(`Data: ${jsonData}`);
    } catch (e) {
      console.log(`Invalid JSON data: ${e.message}`);
      process.exit(1);
    }
  }
  
  await tester.fetchWithLogging(endpoint, options);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});