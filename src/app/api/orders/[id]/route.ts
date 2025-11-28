import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await printify.orders.getOne(id);
    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
