import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

/**
 * GET /api/blueprints-v2/shipping/express
 * Get express shipping information for a blueprint and print provider (V2 API)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blueprintId = searchParams.get('blueprintId');
    const printProviderId = searchParams.get('printProviderId');

    if (!blueprintId || !printProviderId) {
      return NextResponse.json(
        { error: 'blueprintId and printProviderId query parameters are required' },
        { status: 400 }
      );
    }

    const shippingInfo = await printify.v2.catalog.getExpressShippingInfo(
      blueprintId,
      printProviderId
    );

    return NextResponse.json(shippingInfo);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch express shipping information';
    console.error('Blueprint V2 express shipping error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}