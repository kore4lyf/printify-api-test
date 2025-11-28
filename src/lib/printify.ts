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

// Initialize Printify SDK with provided credentials or defaults
export const printify = new Printify({
  accessToken: apiKey || '',
  shopId: shopId || '',
  enableLogging: true,
  host: 'api.printify.com',
  timeout: 5000,
});

// Export credentials for validation
export const getCredentials = () => ({
  apiKey,
  shopId,
  isValid: Boolean(apiKey && shopId)
});
