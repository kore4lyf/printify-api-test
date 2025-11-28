import { NextRequest, NextResponse } from 'next/server';

const mockupDatabase: Map<string, any> = new Map();

/**
 * GET /api/mockups/list?product_id=XXX
 * List all generated mockups for a product
 */
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('product_id');
    const variantId = request.nextUrl.searchParams.get('variant_id');

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    // Filter mockups by product (and variant if provided)
    const mockups = Array.from(mockupDatabase.values()).filter((mockup) => {
      if (mockup.product_id !== productId) return false;
      if (variantId && mockup.variant_id !== parseInt(variantId)) return false;
      return true;
    });

    // Filter out expired mockups
    const now = new Date();
    const activeMockups = mockups.filter((m) => new Date(m.expires_at) > now);

    return NextResponse.json({
      product_id: productId,
      variant_id: variantId || null,
      total_mockups: activeMockups.length,
      mockups: activeMockups.sort(
        (a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
      ),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
