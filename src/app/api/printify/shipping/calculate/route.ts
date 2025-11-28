import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

interface ShippingCalculationRequest {
  line_items: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
  }>;
  address_to: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    region: string;
    city: string;
    zip: string;
    address1: string;
    address2?: string;
  };
}

/**
 * POST /api/printify/shipping/calculate
 * Calculate shipping costs using the Printify API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ShippingCalculationRequest;
    
    // Validate required fields
    if (!body.line_items || body.line_items.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 });
    }
    
    if (!body.address_to) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }
    
    // Calculate shipping using Printify API
    const shippingResult = await printify.orders.calculateShipping({
      line_items: body.line_items,
      address_to: body.address_to
    });
    
    return NextResponse.json({
      success: true,
      shipping_options: shippingResult
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to calculate shipping';
    console.error('Shipping calculation error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}