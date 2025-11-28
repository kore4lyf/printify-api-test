import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // notifyUnpublished only notifies about unpublishing, doesn't actually unpublish
    // The Printify SDK doesn't have a direct unpublish method
    // In practice, you would need to use the Printify dashboard or handle this via the API differently
    const result = await printify.products.notifyUnpublished(id);
    return NextResponse.json({ 
      success: true, 
      message: 'Unpublish notification sent. Note: Use the Printify dashboard to actually unpublish a product, or use the API to publish to channels.',
      data: result 
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    // Check if it's a 400 error and provide helpful context
    if (message.includes('400')) {
      return NextResponse.json({ 
        error: message,
        hint: 'The Printify SDK notifyUnpublished method may require the product to be in a specific state. Ensure the product ID is valid and exists.'
      }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
