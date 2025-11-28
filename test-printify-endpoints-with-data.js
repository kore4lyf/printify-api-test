// Comprehensive test script for Printify API endpoints with proper data handling
// Run with: node test-printify-endpoints-with-data.js

async function testEndpoint(url, description, method = 'GET', body = null, expectSuccess = true) {
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
      console.log(`Body: ${JSON.stringify(body, null, 2)}`);
    }
    
    const response = await fetch(`http://localhost:3000${url}`, options);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok}`);
    
    if (response.ok) {
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          console.log(`Data: Array with ${data.length} items`);
          if (data.length > 0) {
            console.log(`First item keys: ${Object.keys(data[0]).join(', ')}`);
          }
        } else if (data.data && Array.isArray(data.data)) {
          console.log(`Data: Paginated response with ${data.data.length} items`);
          if (data.data.length > 0) {
            console.log(`First item keys: ${Object.keys(data.data[0]).join(', ')}`);
          }
        } else if (data.available_endpoints) {
          console.log(`Data: Object with available endpoints`);
        } else {
          console.log(`Data: Object with keys: ${Object.keys(data).join(', ')}`);
        }
      } else {
        console.log(`Data: ${typeof data}`);
      }
    } else {
      console.log(`Error: ${typeof data === 'object' ? data.error || JSON.stringify(data) : data}`);
    }
    
    return { success: response.ok, data };
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function getFirstItemId(url, itemName) {
  try {
    console.log(`\nGetting first ${itemName} ID...`);
    const response = await fetch(`http://localhost:3000${url}`);
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      if (data.length > 0) {
        const id = data[0].id || data[0].product_id || Object.keys(data[0])[0];
        console.log(`Found ${itemName} ID: ${id}`);
        return id;
      }
    } else if (response.ok && data && data.data && Array.isArray(data.data)) {
      if (data.data.length > 0) {
        const id = data.data[0].id || data.data[0].product_id || Object.keys(data.data[0])[0];
        console.log(`Found ${itemName} ID: ${id}`);
        return id;
      }
    }
    console.log(`No ${itemName} found`);
    return null;
  } catch (error) {
    console.log(`Error getting ${itemName} ID: ${error.message}`);
    return null;
  }
}

async function testAllPrintifyEndpoints() {
  console.log('Testing Printify API Endpoints with Proper Data Handling...\n');
  
  // Test read endpoints first to get IDs
  console.log('=== Testing Read Endpoints ===');
  
  const readEndpoints = [
    { url: '/api/shops', description: 'Shops List' },
    { url: '/api/blueprints', description: 'Blueprints List' },
    { url: '/api/providers', description: 'Providers List' },
    { url: '/api/merchandise', description: 'Merchandise List' },
    { url: '/api/orders', description: 'Orders List' },
    { url: '/api/uploads', description: 'Uploads List' },
    { url: '/api/webhooks', description: 'Webhooks List' },
  ];
  
  let readResults = [];
  for (const endpoint of readEndpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.description);
    readResults.push({ ...endpoint, result });
  }
  
  // Get IDs for testing specific endpoints
  let productId = null;
  let orderId = null;
  let webhookId = null;
  
  // Try to find a product ID
  try {
    const productResponse = await fetch('http://localhost:3000/api/merchandise');
    const productData = await productResponse.json();
    if (productResponse.ok && Array.isArray(productData) && productData.length > 0) {
      productId = productData[0].id;
      console.log(`\nUsing Product ID: ${productId}`);
    } else if (productResponse.ok && productData && productData.data && productData.data.length > 0) {
      productId = productData.data[0].id;
      console.log(`\nUsing Product ID: ${productId}`);
    }
  } catch (error) {
    console.log(`\nCould not get product ID: ${error.message}`);
  }
  
  // Try to find an order ID
  try {
    const orderResponse = await fetch('http://localhost:3000/api/orders');
    const orderData = await orderResponse.json();
    if (orderResponse.ok && Array.isArray(orderData) && orderData.length > 0) {
      orderId = orderData[0].id;
      console.log(`Using Order ID: ${orderId}`);
    } else if (orderResponse.ok && orderData && orderData.data && orderData.data.length > 0) {
      orderId = orderData.data[0].id;
      console.log(`Using Order ID: ${orderId}`);
    }
  } catch (error) {
    console.log(`Could not get order ID: ${error.message}`);
  }
  
  // Try to find a webhook ID
  try {
    const webhookResponse = await fetch('http://localhost:3000/api/webhooks');
    const webhookData = await webhookResponse.json();
    if (webhookResponse.ok && Array.isArray(webhookData) && webhookData.length > 0) {
      webhookId = webhookData[0].id;
      console.log(`Using Webhook ID: ${webhookId}`);
    } else if (webhookResponse.ok && webhookData && webhookData.data && webhookData.data.length > 0) {
      webhookId = webhookData.data[0].id;
      console.log(`Using Webhook ID: ${webhookId}`);
    }
  } catch (error) {
    console.log(`Could not get webhook ID: ${error.message}`);
  }
  
  // Test specific item endpoints if we have IDs
  console.log('\n=== Testing Specific Item Endpoints ===');
  
  const specificEndpoints = [];
  
  if (productId) {
    specificEndpoints.push(
      { url: `/api/products/${productId}`, description: 'Get Specific Product' },
      { url: `/api/products/${productId}/unpublish`, description: 'Unpublish Product', method: 'POST' },
      { url: `/api/products/${productId}/publish`, description: 'Publish Product', method: 'POST' }
    );
  }
  
  if (orderId) {
    specificEndpoints.push(
      { url: `/api/orders/${orderId}`, description: 'Get Specific Order' }
    );
  }
  
  if (webhookId) {
    specificEndpoints.push(
      { url: `/api/webhooks/${webhookId}`, description: 'Update Webhook', method: 'PUT', body: { topic: 'order:created', url: 'https://example.com/updated-webhook' } }
    );
  }
  
  for (const endpoint of specificEndpoints) {
    await testEndpoint(endpoint.url, endpoint.description, endpoint.method || 'GET', endpoint.body);
  }
  
  // Test V2 endpoints with sample parameters
  console.log('\n=== Testing V2 Catalog Endpoints ===');
  
  // First, get a blueprint and provider ID
  let blueprintId = null;
  let providerId = null;
  
  try {
    const blueprintResponse = await fetch('http://localhost:3000/api/blueprints');
    const blueprintData = await blueprintResponse.json();
    if (blueprintResponse.ok && Array.isArray(blueprintData) && blueprintData.length > 0) {
      blueprintId = blueprintData[0].id;
    } else if (blueprintResponse.ok && blueprintData && blueprintData.data && blueprintData.data.length > 0) {
      blueprintId = blueprintData.data[0].id;
    }
    
    const providerResponse = await fetch('http://localhost:3000/api/providers');
    const providerData = await providerResponse.json();
    if (providerResponse.ok && Array.isArray(providerData) && providerData.length > 0) {
      providerId = providerData[0].id;
    } else if (providerResponse.ok && providerData && providerData.data && providerData.data.length > 0) {
      providerId = providerData.data[0].id;
    }
  } catch (error) {
    console.log(`Could not get blueprint/provider IDs: ${error.message}`);
  }
  
  const v2Endpoints = [
    { url: '/api/blueprints-v2', description: 'Blueprints V2 Info' },
  ];
  
  if (blueprintId && providerId) {
    v2Endpoints.push(
      { url: `/api/blueprints-v2/shipping?blueprintId=${blueprintId}&printProviderId=${providerId}`, description: 'V2 Shipping Info' },
      { url: `/api/blueprints-v2/shipping/standard?blueprintId=${blueprintId}&printProviderId=${providerId}`, description: 'V2 Standard Shipping' },
      { url: `/api/blueprints-v2/shipping/priority?blueprintId=${blueprintId}&printProviderId=${providerId}`, description: 'V2 Priority Shipping' },
      { url: `/api/blueprints-v2/shipping/express?blueprintId=${blueprintId}&printProviderId=${providerId}`, description: 'V2 Express Shipping' },
      { url: `/api/blueprints-v2/shipping/economy?blueprintId=${blueprintId}&printProviderId=${providerId}`, description: 'V2 Economy Shipping' }
    );
  }
  
  for (const endpoint of v2Endpoints) {
    await testEndpoint(endpoint.url, endpoint.description);
  }
  
  // Test GPSR endpoint
  console.log('\n=== Testing GPSR Endpoint ===');
  
  if (productId) {
    await testEndpoint(`/api/gpsr?product_id=${productId}`, 'GPSR Info with Product ID');
  } else {
    await testEndpoint('/api/gpsr', 'GPSR Info (should fail without product_id)', 'GET', null, false);
  }
  
  // Test write endpoints with sample data
  console.log('\n=== Testing Write Endpoints ===');
  
  const writeEndpoints = [
    { 
      url: '/api/webhooks', 
      description: 'Create Webhook', 
      method: 'POST', 
      body: { 
        topic: 'order:created', 
        url: 'https://example.com/test-webhook' 
      }
    },
  ];
  
  // Only test product creation if we have required data
  if (blueprintId && providerId) {
    writeEndpoints.unshift({
      url: '/api/merchandise', 
      description: 'Create Product', 
      method: 'POST', 
      body: {
        title: 'Test T-Shirt',
        description: 'A test product for API testing',
        blueprint_id: blueprintId,
        print_provider_id: providerId,
        variants: [{ id: 12345, price: 1999 }],
        print_areas: [{
          variant_ids: [12345],
          placeholders: [{ position: 'front', images: [] }]
        }]
      }
    });
  }
  
  for (const endpoint of writeEndpoints) {
    await testEndpoint(endpoint.url, endpoint.description, endpoint.method, endpoint.body);
  }
  
  console.log('\n=== Test Summary ===');
  console.log('All endpoints have been tested with appropriate data handling.');
  console.log('Endpoints requiring specific IDs were tested only when IDs were available.');
  console.log('V2 endpoints were tested with proper blueprint and provider IDs when available.');
}

// Run the tests
testAllPrintifyEndpoints();