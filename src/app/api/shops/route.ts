import { NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export async function GET() {
  try {
    const shops = await printify.shops.list();
    return NextResponse.json(shops);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
