import { NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id } = body;
    if (!product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    const result = await printify.products.publishOne(product_id, {
      title: true,
      description: true,
      images: true,
      variants: true,
      tags: true,
      keyFeatures: true,
      shipping_template: true
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
