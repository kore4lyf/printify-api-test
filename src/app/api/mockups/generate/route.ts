import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export interface MockupGenerationRequest {
  product_id: string;
  variant_id: number;
  upload_id: string;
  position?: string; // e.g., "front", "back", "sleeve"
}

export interface GeneratedMockup {
  id: string;
  product_id: string;
  variant_id: number;
  upload_id: string;
  position: string;
  mockup_url: string;
  thumbnail_url: string;
  generated_at: string;
  expires_at: string;
}

// In-memory storage for generated mockups
const mockupDatabase: Map<string, GeneratedMockup> = new Map();

/**
 * POST /api/mockups/generate
 * Generate mockup image for a product variant with design
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, variant_id, upload_id, position = 'front' } = body as MockupGenerationRequest;

    // Validate required fields
    if (!product_id || !variant_id || !upload_id) {
      return NextResponse.json(
        { error: 'product_id, variant_id, and upload_id are required' },
        { status: 400 }
      );
    }

    // Fetch product and upload from Printify
    const [product, upload] = await Promise.all([
      printify.products.getOne(product_id),
      printify.uploads.getById(upload_id),
    ]);

    // Verify variant exists
    const variant = product.variants?.find((v: any) => v.id === variant_id);
    if (!variant) {
      return NextResponse.json(
        { error: `Variant ${variant_id} not found` },
        { status: 404 }
      );
    }

    // Generate mockup using Printify API
    const mockupResponse = await (printify as any).mockups.generate({
      product_id,
      variant_id,
      print_areas: {
        front_print: {
          top: 100,
          left: 100,
          scale: 0.5,
        },
      },
      files: [
        {
          id: upload_id,
          angle: 0,
          scale: 1,
        },
      ],
    });

    // Create mockup record
    const mockupId = `mockup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Mockups expire in 30 days

    const mockup: GeneratedMockup = {
      id: mockupId,
      product_id,
      variant_id,
      upload_id,
      position,
      mockup_url: mockupResponse.mockup_url || 'https://via.placeholder.com/500x500?text=Mockup+Generated',
      thumbnail_url: mockupResponse.thumbnail_url || 'https://via.placeholder.com/200x200?text=Mockup+Thumb',
      generated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    mockupDatabase.set(mockupId, mockup);

    return NextResponse.json({
      success: true,
      mockup,
      message: `Mockup generated for ${variant.title}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    console.error('Mockup generation error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
