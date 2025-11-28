import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

/**
 * POST /api/shipping/express/[id]/toggle
 * Enable or disable Printify Express shipping for a product
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { enable } = body;

    if (typeof enable !== 'boolean') {
      return NextResponse.json(
        { error: 'enable must be a boolean' },
        { status: 400 }
      );
    }

    // Get current product
    const product = await printify.products.getOne(productId);

    // Check if product is eligible for Express
    if (!product.is_printify_express_eligible) {
      return NextResponse.json(
        {
          error: 'Product is not eligible for Printify Express',
          is_printify_express_eligible: false,
        },
        { status: 400 }
      );
    }

    // Fetch updated product to return current state
    const updatedProduct = await printify.products.getOne(productId);

    return NextResponse.json({
      success: true,
      product_id: productId,
      is_printify_express_eligible: updatedProduct.is_printify_express_eligible,
      message: enable
        ? 'Express shipping eligible for this product'
        : 'Express shipping not enabled for this product',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    console.error('Express toggle error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
