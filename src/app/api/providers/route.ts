import { NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export async function GET() {
  try {
    const providers = await printify.catalog.listProviders();
    return NextResponse.json(providers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
