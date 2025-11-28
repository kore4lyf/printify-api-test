import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';
import { gpsrData } from '@/lib/db';

interface GpsrData {
  id?: string;
  product_id: string;
  safety_information: string;
  manufacturer_details: {
    name: string;
    address: string;
    email: string;
  };
  product_details: {
    brand: string;
    model: string;
    warranty: string;
  };
  warnings: string;
  care_instructions: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET /api/compliance/gpsr?product_id=XXX
 * Fetch GPSR compliance information for a product
 */
export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    // Fetch product from Printify
    const product = await printify.products.getOne(productId);

    // Check if GPSR data exists in database
    const gpsrRecord = gpsrData.findByQuery((doc: any) => doc.product_id === productId)[0];

    if (!gpsrRecord) {
      // Return product without GPSR data if not set
      return NextResponse.json({
        product_id: productId,
        product_title: product.title,
        blueprint_id: product.blueprint_id,
        safety_information: '',
        manufacturer_name: '',
        manufacturer_address: '',
        manufacturer_email: '',
        manufacturer_phone: '',
        brand: '',
        model: '',
        warranty: '',
        product_warnings: '',
        care_instructions: '',
        is_compliant: false,
        missing_fields: [
          'manufacturer_name',
          'manufacturer_address',
          'manufacturer_email',
        ],
        compliance_status: 'INCOMPLETE',
      });
    }

    return NextResponse.json({
      ...gpsrRecord,
      compliance_status: gpsrRecord.manufacturer_name ? 'COMPLETE' : 'INCOMPLETE',
      is_compliant: !!gpsrRecord.manufacturer_name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/compliance/gpsr
 * Create or update GPSR compliance information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      product_title,
      manufacturer_name,
      manufacturer_address,
      manufacturer_email,
      manufacturer_phone,
      brand,
      model,
      warranty,
      safety_information,
      product_warnings,
      care_instructions,
      ...rest
    } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    // Validate required manufacturer fields
    const missingRequired = [];
    if (!manufacturer_name) missingRequired.push('manufacturer_name');
    if (!manufacturer_address) missingRequired.push('manufacturer_address');
    if (!manufacturer_email) missingRequired.push('manufacturer_email');

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required manufacturer information',
          missing_fields: missingRequired,
        },
        { status: 400 }
      );
    }

    // Store GPSR data in database
    const completeData = {
      product_id,
      product_title,
      safety_information,
      manufacturer_name,
      manufacturer_address,
      manufacturer_email,
      manufacturer_phone,
      brand,
      model,
      warranty,
      product_warnings,
      care_instructions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const recordId = `gpsr-${product_id}`;
    gpsrData.create(recordId, completeData);

    return NextResponse.json({
      success: true,
      product_id,
      message: 'GPSR compliance information saved',
      compliance_status: 'COMPLETE',
      data: completeData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    console.error('GPSR update error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
