import { NextRequest, NextResponse } from 'next/server';
import { printify, getCredentials } from '@/lib/printify';

/**
 * GET /api/orders
 * List all orders from Printify
 */
export async function GET() {
  try {
    const credentials = getCredentials();
    if (!credentials.isValid) {
      return NextResponse.json({ 
        error: 'Missing Printify credentials. Please set PRINTIFY_API_KEY and PRINTIFY_SHOP_ID in .env.local',
        details: { apiKey: credentials.apiKey ? 'set' : 'missing', shopId: credentials.shopId ? 'set' : 'missing' }
      }, { status: 401 });
    }

    if (!credentials.shopId) {
      return NextResponse.json({ 
        error: 'Invalid Printify shop ID'
      }, { status: 400 });
    }

    const orders = await printify.orders.list();
    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    const details = error instanceof Error ? error.stack : String(error);
    console.error('Orders fetch error:', message, details);
    return NextResponse.json({ error: message, details }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Submit a new order to Printify
 */
export async function POST(request: NextRequest) {
  try {
    const credentials = getCredentials();
    if (!credentials.isValid) {
      return NextResponse.json({ 
        error: 'Missing Printify credentials. Please set PRINTIFY_API_KEY and PRINTIFY_SHOP_ID in .env.local',
        details: { apiKey: credentials.apiKey ? 'set' : 'missing', shopId: credentials.shopId ? 'set' : 'missing' }
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('Order submission request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.address_to) {
      return NextResponse.json({ 
        error: 'Missing required field: address_to' 
      }, { status: 400 });
    }

    if (!body.line_items || !Array.isArray(body.line_items) || body.line_items.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required field: line_items (must be non-empty array)' 
      }, { status: 400 });
    }
    
    // Ensure product_id is a string as expected by Printify API
    const normalizedBody = {
      ...body,
      line_items: body.line_items.map((item: any) => ({
        ...item,
        product_id: String(item.product_id)
      }))
    };
    
    console.log('Normalized order body:', JSON.stringify(normalizedBody, null, 2));
    
    let order;
    try {
      order = await printify.orders.submit(normalizedBody);
    } catch (sdkError) {
      const sdkErrorMessage = sdkError instanceof Error ? sdkError.message : String(sdkError);
      const sdkErrorStack = sdkError instanceof Error ? sdkError.stack : '';
      console.error('SDK submit error:', sdkErrorMessage);
      console.error('SDK error details:', sdkError);
      
      return NextResponse.json({ 
        error: `Failed to submit order to Printify: ${sdkErrorMessage}`,
        code: 'PRINTIFY_SDK_ERROR',
        details: sdkErrorStack
      }, { status: 502 });
    }
    
    console.log('Order submission response:', JSON.stringify(order, null, 2));
    
    if (!order || typeof order !== 'object') {
      console.error('Invalid response from SDK:', order);
      return NextResponse.json({ 
        error: 'Invalid response from Printify API - empty response',
        code: 'INVALID_SDK_RESPONSE',
        response: order
      }, { status: 502 });
    }
    
    if (!order.id) {
      console.warn('Order response missing ID field:', order);
      return NextResponse.json({ 
        error: 'Order created but response missing order ID',
        code: 'MISSING_ORDER_ID',
        response: order
      }, { status: 201 });
    }
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit order';
    const stack = error instanceof Error ? error.stack : '';
    console.error('Order submission error:', message);
    console.error('Error stack:', stack);
    console.error('Full error:', error);
    
    return NextResponse.json({ 
      error: message,
      details: stack 
    }, { status: 500 });
  }
}
