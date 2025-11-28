// Comprehensive test script for all Printify API endpoints
// Run with: node test-all-printify-endpoints.js

async function testEndpoint(url, description, method = 'GET', body = null) {
  try {
    console.log(`\nTesting ${description}...`);
    console.log(`URL: ${url}`);
    console.log(`Method: ${method}`);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`http://localhost:3000${url}`, options);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok}`);
    
    if (response.ok) {
      if (Array.isArray(data)) {
        console.log(`Data: Array with ${data.length} items`);
      } else if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          console.log(`Data: Paginated response with ${data.data.length} items`);
        } else if (data.available_endpoints) {
          console.log(`Data: Object with available endpoints`);
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

async function testAllPrintifyEndpoints() {
  console.log('Testing All Printify API Endpoints...\n');
  
  const endpoints = [
    // Read endpoints
    { url: '/api/shops', description: 'Shops List' },
    { url: '/api/blueprints', description: 'Blueprints List' },
    { url: '/api/providers', description: 'Providers List' },
    { url: '/api/merchandise', description: 'Merchandise List' },
    { url: '/api/orders', description: 'Orders List' },
    { url: '/api/uploads', description: 'Uploads List' },
    { url: '/api/webhooks', description: 'Webhooks List' },
    { url: '/api/blueprints-v2', description: 'Blueprints V2 Info' },
    
    // V2 Shipping endpoints (will show info since no params)
    { url: '/api/blueprints-v2/shipping', description: 'V2 Shipping Info' },
    { url: '/api/blueprints-v2/shipping/standard', description: 'V2 Standard Shipping Info' },
    { url: '/api/blueprints-v2/shipping/priority', description: 'V2 Priority Shipping Info' },
    { url: '/api/blueprints-v2/shipping/express', description: 'V2 Express Shipping Info' },
    { url: '/api/blueprints-v2/shipping/economy', description: 'V2 Economy Shipping Info' },
    
    // GPSR endpoint (will fail without product_id)
    { url: '/api/gpsr', description: 'GPSR Info (will fail without product_id)', expectFail: true },
  ];
  
  let passed = 0;
  let total = endpoints.length;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint.url, endpoint.description);
    
    // For endpoints that are expected to fail (like GPSR without params), count as pass if they fail correctly
    if (endpoint.expectFail) {
      if (!success) {
        console.log('✅ Expected failure - this is correct behavior');
        passed++;
      }
    } else {
      if (success) passed++;
    }
  }
  
  console.log(`\n\nTest Results: ${passed}/${total} endpoints working correctly`);
  
  if (passed === total) {
    console.log('✅ All endpoints are working correctly!');
  } else {
    console.log('❌ Some endpoints need attention');
  }
  
  // Test a few write endpoints with sample data
  console.log('\n\nTesting Write Endpoints (sample data)...\n');
  
  const writeEndpoints = [
    // These would need valid IDs to test properly
    { url: '/api/merchandise', description: 'Create Product', method: 'POST', body: { title: 'Test Product', description: 'Test Description' } },
    { url: '/api/webhooks', description: 'Create Webhook', method: 'POST', body: { topic: 'order:created', url: 'https://example.com/webhook' } },
  ];
  
  let writePassed = 0;
  let writeTotal = writeEndpoints.length;
  
  for (const endpoint of writeEndpoints) {
    const success = await testEndpoint(endpoint.url, endpoint.description, endpoint.method, endpoint.body);
    if (success) writePassed++;
  }
  
  console.log(`\nWrite Endpoint Results: ${writePassed}/${writeTotal} write endpoints working`);
}

// Run the tests
testAllPrintifyEndpoints();