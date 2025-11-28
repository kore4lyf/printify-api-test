// Test script for Printify API endpoints
// Run with: node test-printify-endpoints.js

async function testEndpoint(url, description) {
  try {
    console.log(`\nTesting ${description}...`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(`http://localhost:3000${url}`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok}`);
    
    if (response.ok) {
      if (Array.isArray(data)) {
        console.log(`Data: Array with ${data.length} items`);
      } else if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          console.log(`Data: Paginated response with ${data.data.length} items`);
        } else {
          console.log(`Data: Object with keys: ${Object.keys(data).join(', ')}`);
        }
      } else {
        console.log(`Data: ${typeof data}`);
      }
    } else {
      console.log(`Error: ${data.error || 'Unknown error'}`);
    }
    
    return response.ok;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return false;
  }
}

async function testPrintifyEndpoints() {
  console.log('Testing Printify API Endpoints...\n');
  
  const endpoints = [
    { url: '/api/shops', description: 'Shops List' },
    { url: '/api/blueprints', description: 'Blueprints List' },
    { url: '/api/providers', description: 'Providers List' },
    { url: '/api/merchandise', description: 'Merchandise List' },
    { url: '/api/orders', description: 'Orders List' },
    { url: '/api/uploads', description: 'Uploads List' },
    { url: '/api/webhooks', description: 'Webhooks List' },
    { url: '/api/blueprints-v2', description: 'Blueprints V2' },
  ];
  
  let passed = 0;
  let total = endpoints.length;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint.url, endpoint.description);
    if (success) passed++;
  }
  
  console.log(`\n\nTest Results: ${passed}/${total} endpoints working`);
  
  if (passed === total) {
    console.log('✅ All endpoints are working correctly!');
  } else {
    console.log('❌ Some endpoints need attention');
  }
}

// Run the tests
testPrintifyEndpoints();