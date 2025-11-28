import { NextResponse } from 'next/server';
import { printify } from '@/lib/printify';
import { gpsrData } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
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
