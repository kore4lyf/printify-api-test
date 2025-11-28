import { NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export async function GET() {
  try {
    const uploads = await printify.uploads.list();
    return NextResponse.json(uploads);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const upload = await printify.uploads.uploadImage(body);
    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
