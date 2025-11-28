import { NextRequest, NextResponse } from 'next/server';

export enum ShippingMethod {
  STANDARD = 'standard',
  PRIORITY = 'priority',
  EXPRESS = 'express',
  ECONOMY = 'economy',
}

interface QuoteRequest {
  method: ShippingMethod;
  destination: string;
  quantity: number;
  line_items: Array<{
    product_id: string;
    variant_id: number;
    price: number;
    quantity: number;
  }>;
}

/**
 * POST /api/shipping/quote
 * Calculate shipping costs for an order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as QuoteRequest;
    const { method, destination = 'US', quantity = 1, line_items = [] } = body;

    if (!method) {
      return NextResponse.json({ error: 'Shipping method is required' }, { status: 400 });
    }

    if (!Object.values(ShippingMethod).includes(method)) {
      return NextResponse.json(
        {
          error: 'Invalid shipping method',
          valid_methods: Object.values(ShippingMethod),
        },
        { status: 400 }
      );
    }

    // Shipping costs per method
    const shippingRates: Record<ShippingMethod, { first: number; additional: number }> = {
      standard: { first: 4.75, additional: 2.19 },
      priority: { first: 9.99, additional: 3.99 },
      express: { first: 7.99, additional: 2.4 },
      economy: { first: 3.99, additional: 1.99 },
    };

    const rate = shippingRates[method];

    // Calculate total shipping cost
    const baseShipping = rate.first;
    const additionalShipping = (quantity - 1) * rate.additional;
    const totalShipping = baseShipping + additionalShipping;

    // Calculate order subtotal
    const subtotal = line_items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Apply regional adjustments
    const regionalMultiplier = getRegionalMultiplier(destination);
    const adjustedShipping = totalShipping * regionalMultiplier;

    // Calculate delivery estimate
    const deliveryEstimate = getDeliveryEstimate(method, destination);

    const quote = {
      method,
      destination,
      quantity,
      currency: 'USD',
      breakdown: {
        first_item: rate.first,
        additional_items_cost: additionalShipping,
        subtotal_shipping: totalShipping,
        regional_adjustment: (regionalMultiplier - 1) * 100,
      },
      total_shipping: Math.round(adjustedShipping * 100) / 100,
      estimated_delivery: deliveryEstimate,
      order_summary: {
        product_subtotal: subtotal,
        shipping_cost: Math.round(adjustedShipping * 100) / 100,
        total: subtotal + Math.round(adjustedShipping * 100) / 100,
      },
    };

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    console.error('Quote error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Get regional shipping multiplier
 */
function getRegionalMultiplier(destination: string): number {
  const multipliers: Record<string, number> = {
    US: 1.0,
    CA: 1.2,
    GB: 1.5,
    EU: 1.6,
    AU: 1.8,
    DEFAULT: 2.0,
  };

  return multipliers[destination] || multipliers.DEFAULT;
}

/**
 * Calculate delivery estimate
 */
function getDeliveryEstimate(
  method: ShippingMethod,
  destination: string
): { min_days: number; max_days: number; estimated_date: string } {
  const baseDelivery: Record<ShippingMethod, { min: number; max: number }> = {
    standard: { min: 2, max: 5 },
    priority: { min: 2, max: 3 },
    express: { min: 2, max: 3 },
    economy: { min: 4, max: 8 },
  };

  const regional: Record<string, number> = {
    US: 0,
    CA: 2,
    GB: 5,
    EU: 7,
    AU: 10,
  };

  const base = baseDelivery[method];
  const adjustment = regional[destination] || 0;

  const minDays = base.min + adjustment;
  const maxDays = base.max + adjustment;

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + maxDays);

  return {
    min_days: minDays,
    max_days: maxDays,
    estimated_date: estimatedDate.toISOString().split('T')[0],
  };
}
