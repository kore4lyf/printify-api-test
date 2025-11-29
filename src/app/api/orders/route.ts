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

    const orders = await printify.orders.list();
    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
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
    
    // Ensure product_id is a string as expected by Printify API
    const normalizedBody = {
      ...body,
      line_items: body.line_items?.map((item: any) => ({
        ...item,
        product_id: String(item.product_id)
      })) || []
    };
    
    const order = await printify.orders.submit(normalizedBody);
    console.log('Order submission response:', JSON.stringify(order, null, 2));
    
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
