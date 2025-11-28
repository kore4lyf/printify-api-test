import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

interface GetOrderRequest {
  order_id: string;
}

/**
 * GET /api/printify/orders/[id]
 * Get details of a specific order from Printify
 */
export async function GET(
   request: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
     const { id } = await params;
     const orderId = id;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    const order = await printify.orders.getOne(orderId);
    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch order';
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}