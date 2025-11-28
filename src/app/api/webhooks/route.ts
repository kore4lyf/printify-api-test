import { NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export async function GET() {
  try {
    const webhooks = await printify.webhooks.list();
    return NextResponse.json(webhooks);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const webhook = await printify.webhooks.create(body);
    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
