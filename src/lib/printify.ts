import Printify from 'printify-sdk-js';

// Support both naming conventions for API key
const apiKey = process.env.PRINTIFY_API_KEY || process.env.PRINTIFY_API_TOKEN;
// Support both naming conventions for shop ID
const shopId = process.env.PRINTIFY_SHOP_ID || process.env.NEXT_PUBLIC_PRINTIFY_SHOP_ID;

if (!apiKey) {
  console.warn('PRINTIFY_API_KEY or PRINTIFY_API_TOKEN environment variable is not set. Please add it to .env.local');
}

if (!shopId) {
  console.warn('PRINTIFY_SHOP_ID or NEXT_PUBLIC_PRINTIFY_SHOP_ID environment variable is not set. Please add it to .env.local');
}

// Validate and initialize Printify SDK with provided credentials
if (!apiKey || !shopId) {
  console.error('❌ Printify SDK initialization failed: Missing required credentials');
  console.error('   API Key:', apiKey ? '✓ set' : '✗ missing');
  console.error('   Shop ID:', shopId ? '✓ set' : '✗ missing');
}

// Initialize Printify SDK with provided credentials or defaults
export const printify = new Printify({
  accessToken: apiKey || '',
  shopId: shopId || '',
  enableLogging: process.env.NODE_ENV === 'development',
  host: 'api.printify.com',
  timeout: 10000, // Increased timeout to handle slower connections
});

// Export credentials for validation
export const getCredentials = () => ({
  apiKey,
  shopId,
  isValid: Boolean(apiKey && shopId),
  hasApiKey: Boolean(apiKey),
  hasShopId: Boolean(shopId)
});
