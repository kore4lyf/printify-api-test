import { NextResponse } from 'next/server';
import { getCredentials } from '@/lib/printify';

/**
 * GET /api/diagnostics/printify
 * Check Printify SDK configuration and connectivity
 */
export async function GET() {
  const credentials = getCredentials();
  
  return NextResponse.json({
    status: 'diagnostic',
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: credentials.hasApiKey,
      hasShopId: credentials.hasShopId,
      apiKeyLength: credentials.apiKey ? credentials.apiKey.length : 0,
      shopIdLength: credentials.shopId ? credentials.shopId.length : 0,
      shopId: credentials.shopId || 'NOT SET',
    },
    validation: {
      isValid: credentials.isValid,
      missingApiKey: !credentials.hasApiKey,
      missingShopId: !credentials.hasShopId,
      issues: [
        ...(!credentials.hasApiKey ? ['PRINTIFY_API_KEY not set'] : []),
        ...(!credentials.hasShopId ? ['PRINTIFY_SHOP_ID not set'] : []),
      ]
    },
    recommendations: credentials.isValid 
      ? 'Credentials appear to be configured correctly. If you still see errors, the Printify API may be rejecting your request.'
      : 'Please ensure PRINTIFY_API_KEY and PRINTIFY_SHOP_ID are set in your .env.local file'
  }, { status: credentials.isValid ? 200 : 400 });
}
