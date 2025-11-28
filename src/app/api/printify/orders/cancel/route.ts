import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

interface CancelOrderRequest {
  order_id: string;
}

/**
 * POST /api/printify/orders/cancel
 * Cancel an unpaid order using the Printify API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CancelOrderRequest;
    
    // Validate required fields
    if (!body.order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Cancel the order using Printify API
    const cancelResult = await printify.orders.cancelUnpaid(body.order_id);
    
    return NextResponse.json({
      success: true,
      result: cancelResult
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel order';
    console.error('Order cancellation error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}