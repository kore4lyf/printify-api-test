import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

interface ShippingCost {
  first_item: number;
  additional_items: number;
  currency: string;
}

interface VariantShipping {
  variant_id: number;
  variant_title: string;
  standard_shipping: ShippingCost;
  express_shipping: ShippingCost;
  cost_difference: number;
}

/**
 * GET /api/shipping/express/[id]/costs?variant_id=XXX
 * Fetch Express shipping costs compared to standard shipping for a product variant
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const variantId = request.nextUrl.searchParams.get('variant_id');

    const product = await printify.products.getOne(productId);

    if (!product.is_printify_express_eligible) {
      return NextResponse.json(
        {
          error: 'Product is not eligible for Printify Express shipping',
          is_eligible: false,
        },
        { status: 400 }
      );
    }

    // If specific variant requested, return costs for that variant
    if (variantId) {
      const variant = product.variants?.find((v: any) => String(v.id) === variantId);

      if (!variant) {
        return NextResponse.json(
          { error: `Variant ${variantId} not found` },
          { status: 404 }
        );
      }

      if (!variant.is_printify_express_eligible) {
        return NextResponse.json(
          {
            error: `Variant ${variantId} is not eligible for Printify Express`,
            variant_id: variantId,
            is_eligible: false,
          },
          { status: 400 }
        );
      }

      // Return estimated costs based on Printify docs:
      // Express: $7.99 base + $2.40 per additional item
      // Standard: $4.75 base + varies by provider
      return NextResponse.json({
        product_id: productId,
        variant_id: variantId,
        variant_title: variant.title,
        shipping_comparison: {
          standard: {
            first_item: 4.75,
            additional_items: 2.19,
            currency: 'USD',
            delivery_time: '2-5 business days',
          },
          express: {
            first_item: 7.99,
            additional_items: 2.4,
            currency: 'USD',
            delivery_time: '2-3 business days (incl. production)',
          },
          cost_difference: {
            first_item: 3.24,
            additional_items: 0.21,
            currency: 'USD',
          },
          note: 'Express pricing is fixed per Printify terms',
        },
      });
    }

    // Return costs for all eligible variants
    const shippingVariants: VariantShipping[] = (product.variants || [])
      .filter((v: any) => v.is_printify_express_eligible)
      .map((v: any) => ({
        variant_id: v.id,
        variant_title: v.title,
        standard_shipping: {
          first_item: 4.75,
          additional_items: 2.19,
          currency: 'USD',
        },
        express_shipping: {
          first_item: 7.99,
          additional_items: 2.4,
          currency: 'USD',
        },
        cost_difference: 3.24,
      }));

    return NextResponse.json({
      product_id: productId,
      is_printify_express_eligible: true,
      is_printify_express_enabled: product.is_printify_express_enabled || false,
      eligible_variants: shippingVariants,
      summary: {
        total_eligible_variants: shippingVariants.length,
        standard_base_cost: 4.75,
        express_base_cost: 7.99,
        express_additional_item_cost: 2.4,
        delivery_comparison: {
          standard: '2-5 business days',
          express: '2-3 business days (incl. production)',
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    console.error('Shipping costs error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
