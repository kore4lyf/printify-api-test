import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

/**
 * GET /api/shipping/express?product_id=XXX
 * Fetch Express shipping availability and costs for a product
 */
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('product_id');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    const product = await printify.products.getOne(productId);

    return NextResponse.json({
      product_id: productId,
      is_printify_express_eligible: product.is_printify_express_eligible || false,
      express_variants: product.variants
        ?.filter((v: any) => v.is_printify_express_eligible)
        .map((v: any) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
          is_printify_express_eligible: v.is_printify_express_eligible,
        })) || [],
      eligible_count: product.variants?.filter((v: any) => v.is_printify_express_eligible).length || 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
