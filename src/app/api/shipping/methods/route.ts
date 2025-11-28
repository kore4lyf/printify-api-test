import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export enum ShippingMethod {
  STANDARD = 'standard',
  PRIORITY = 'priority',
  EXPRESS = 'express',
  ECONOMY = 'economy',
}

interface ShippingMethodInfo {
  id: number;
  name: ShippingMethod;
  cost_first_item: number;
  cost_additional_items: number;
  currency: string;
  delivery_days_min: number;
  delivery_days_max: number;
  available_countries: string[];
  is_available: boolean;
}

interface ShippingQuote {
  method: ShippingMethod;
  quantity: number;
  first_item_cost: number;
  additional_items_cost: number;
  total_cost: number;
  currency: string;
  delivery_window: string;
}

/**
 * GET /api/shipping/methods?product_id=XXX
 * Get available shipping methods for a product
 */
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('product_id');
    const destination = request.nextUrl.searchParams.get('destination') || 'US';

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    const product = await printify.products.getOne(productId);

    // Available shipping methods
    const shippingMethods: ShippingMethodInfo[] = [
      {
        id: 1,
        name: ShippingMethod.STANDARD,
        cost_first_item: 4.75,
        cost_additional_items: 2.19,
        currency: 'USD',
        delivery_days_min: 2,
        delivery_days_max: 5,
        available_countries: ['US', 'CA', 'GB', 'AU', 'EU'],
        is_available: true,
      },
      {
        id: 2,
        name: ShippingMethod.PRIORITY,
        cost_first_item: 9.99,
        cost_additional_items: 3.99,
        currency: 'USD',
        delivery_days_min: 2,
        delivery_days_max: 3,
        available_countries: ['US', 'CA', 'GB', 'AU'],
        is_available: true,
      },
      {
        id: 3,
        name: ShippingMethod.EXPRESS,
        cost_first_item: 7.99,
        cost_additional_items: 2.4,
        currency: 'USD',
        delivery_days_min: 2,
        delivery_days_max: 3,
        available_countries: ['US'],
        is_available: product.is_printify_express_eligible || false,
      },
      {
        id: 4,
        name: ShippingMethod.ECONOMY,
        cost_first_item: 3.99,
        cost_additional_items: 1.99,
        currency: 'USD',
        delivery_days_min: 4,
        delivery_days_max: 8,
        available_countries: ['US', 'CA'],
        is_available: true,
      },
    ];

    // Filter by destination
    const availableMethods = shippingMethods.filter(
      (method) => method.is_available && method.available_countries.includes(destination)
    );

    return NextResponse.json({
      product_id: productId,
      destination,
      available_methods: availableMethods,
      total_methods: availableMethods.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
