// Printify API Testing Utility
// This script helps you test Printify endpoints with proper data handling

const API_BASE = 'http://localhost:3000';

class PrintifyAPITester {
  constructor() {
    this.cache = {};
  }

  async fetchWithLogging(url, options = {}) {
    console.log(`\n🚀 Request: ${options.method || 'GET'} ${url}`);
    
    if (options.body) {
      console.log(`📄 Body: ${options.body}`);
    }
    
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      console.log(`📊 Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
      
      if (!response.ok) {
        console.log(`❌ Error: ${typeof data === 'object' ? data.error || JSON.stringify(data) : data}`);
      }
      
      return { response, data, ok: response.ok };
    } catch (error) {
      console.log(`💥 Network Error: ${error.message}`);
      return { error: error.message, ok: false };
    }
  }

  async getFirstItemId(endpoint, idField = 'id') {
    if (this.cache[endpoint]) {
      return this.cache[endpoint];
    }
    
    console.log(`\n🔍 Getting first item ID from ${endpoint}...`);
    
    const { data, ok } = await this.fetchWithLogging(endpoint);
    
    if (ok) {
      let items = [];
      
      if (Array.isArray(data)) {
        items = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        items = data.data;
      }
      
      if (items.length > 0) {
        const item = items[0];
        const id = item[idField] || item.product_id || item.order_id || Object.values(item)[0];
        this.cache[endpoint] = id;
        console.log(`✅ Found ID: ${id}`);
        return id;
      }
    }
    
    console.log(`⚠️  No items found in ${endpoint}`);
    return null;
  }

  async testReadEndpoints() {
    console.log('\n📂 Testing Read Endpoints');
    
    const endpoints = [
      '/api/shops',
      '/api/blueprints',
      '/api/providers',
      '/api/merchandise',
      '/api/orders',
      '/api/uploads',
      '/api/webhooks'
    ];
    
    for (const endpoint of endpoints) {
      await this.fetchWithLogging(endpoint);
    }
  }

  async testSpecificEndpoints() {
    console.log('\n🎯 Testing Specific Item Endpoints');
    
    // Get IDs first
    const productId = await this.getFirstItemId('/api/merchandise');
    const orderId = await this.getFirstItemId('/api/orders');
    const webhookId = await this.getFirstItemId('/api/webhooks');
    
    const tests = [];
    
    if (productId) {
      tests.push(
        { url: `/api/products/${productId}`, method: 'GET', description: 'Get Product' },
        { url: `/api/products/${productId}/unpublish`, method: 'POST', description: 'Unpublish Product' },
        { url: `/api/products/${productId}/publish`, method: 'POST', description: 'Publish Product' }
      );
    }
    
    if (orderId) {
      tests.push(
        { url: `/api/orders/${orderId}`, method: 'GET', description: 'Get Order' }
      );
    }
    
    if (webhookId) {
      tests.push(
        { url: `/api/webhooks/${webhookId}`, method: 'PUT', description: 'Update Webhook', body: JSON.stringify({ topic: 'order:updated', url: 'https://example.com/updated' }) }
      );
    }
    
    for (const test of tests) {
      await this.fetchWithLogging(test.url, {
        method: test.method,
        body: test.body
      });
    }
  }

  async testV2Endpoints() {
    console.log('\n🚀 Testing V2 Catalog Endpoints');
    
    // Get blueprint and provider IDs
    const blueprintId = await this.getFirstItemId('/api/blueprints');
    const providerId = await this.getFirstItemId('/api/providers');
    
    if (!blueprintId || !providerId) {
      console.log('⚠️  Need blueprint and provider IDs for V2 tests');
      await this.fetchWithLogging('/api/blueprints-v2');
      return;
    }
    
    const v2Endpoints = [
      `/api/blueprints-v2/shipping?blueprintId=${blueprintId}&printProviderId=${providerId}`,
      `/api/blueprints-v2/shipping/standard?blueprintId=${blueprintId}&printProviderId=${providerId}`,
      `/api/blueprints-v2/shipping/priority?blueprintId=${blueprintId}&printProviderId=${providerId}`,
      `/api/blueprints-v2/shipping/express?blueprintId=${blueprintId}&printProviderId=${providerId}`,
      `/api/blueprints-v2/shipping/economy?blueprintId=${blueprintId}&printProviderId=${providerId}`
    ];
    
    for (const endpoint of v2Endpoints) {
      await this.fetchWithLogging(endpoint);
    }
  }

  async testWriteEndpoints() {
    console.log('\n✍️  Testing Write Endpoints');
    
    const writeTests = [
      {
        url: '/api/webhooks',
        method: 'POST',
        body: JSON.stringify({
          topic: 'order:created',
          url: 'https://example.com/test-webhook'
        }),
        description: 'Create Webhook'
      }
    ];
    
    // Try to create a product if we have blueprint/provider data
    const blueprintId = await this.getFirstItemId('/api/blueprints');
    const providerId = await this.getFirstItemId('/api/providers');
    
    if (blueprintId && providerId) {
      writeTests.unshift({
        url: '/api/merchandise',
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Product',
          description: 'Created via API test',
          blueprint_id: blueprintId,
          print_provider_id: providerId,
          variants: [{ id: 12345, price: 1999 }],
          print_areas: [{
            variant_ids: [12345],
            placeholders: [{ position: 'front', images: [] }]
          }]
        }),
        description: 'Create Product'
      });
    }
    
    for (const test of writeTests) {
      await this.fetchWithLogging(test.url, {
        method: test.method,
        body: test.body
      });
    }
  }

  async runAllTests() {
    console.log('🧪 Printify API Comprehensive Test Suite');
    console.log('=====================================');
    
    await this.testReadEndpoints();
    await this.testSpecificEndpoints();
    await this.testV2Endpoints();
    await this.testWriteEndpoints();
    
    console.log('\n🏁 Test suite completed!');
    console.log('Use individual methods for targeted testing.');
  }
}

// Export for use in other scripts
module.exports = PrintifyAPITester;

// Run if called directly
if (require.main === module) {
  const tester = new PrintifyAPITester();
  tester.runAllTests().catch(console.error);
}