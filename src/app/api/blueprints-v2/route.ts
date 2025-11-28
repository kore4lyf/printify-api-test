import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/blueprints-v2
 * Get information about V2 Catalog API endpoints
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blueprintId = searchParams.get('blueprintId');
    const printProviderId = searchParams.get('printProviderId');

    // If no parameters provided, show available endpoints
    if (!blueprintId || !printProviderId) {
      return NextResponse.json({
        message: 'V2 Catalog API requires blueprintId and printProviderId query parameters',
        available_endpoints: {
          shipping: '/api/blueprints-v2/shipping?blueprintId={id}&printProviderId={id}',
          standard_shipping: '/api/blueprints-v2/shipping/standard?blueprintId={id}&printProviderId={id}',
          priority_shipping: '/api/blueprints-v2/shipping/priority?blueprintId={id}&printProviderId={id}',
          express_shipping: '/api/blueprints-v2/shipping/express?blueprintId={id}&printProviderId={id}',
          economy_shipping: '/api/blueprints-v2/shipping/economy?blueprintId={id}&printProviderId={id}',
        },
        example: '/api/blueprints-v2/shipping?blueprintId=123&printProviderId=456'
      });
    }

    // If parameters provided, redirect to main shipping endpoint
    const redirectUrl = `/api/blueprints-v2/shipping?blueprintId=${blueprintId}&printProviderId=${printProviderId}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
