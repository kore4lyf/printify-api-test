import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export enum BulkOperation {
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  DELETE = 'delete',
  UPDATE_PRICE = 'update_price',
  UPDATE_SKU = 'update_sku',
  DISABLE_VARIANTS = 'disable_variants',
  ENABLE_VARIANTS = 'enable_variants',
}

interface BulkOperationRequest {
  operation: BulkOperation;
  product_ids: string[];
  data?: Record<string, any>;
}

interface BulkOperationResult {
  operation_id: string;
  operation: BulkOperation;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_items: number;
  processed_items: number;
  successful_items: number;
  failed_items: number;
  errors: Array<{ product_id: string; error: string }>;
  started_at: string;
  completed_at: string | null;
}

const operationDatabase: Map<string, BulkOperationResult> = new Map();

/**
 * POST /api/bulk/operations
 * Execute bulk operations on multiple products
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, product_ids, data } = body as BulkOperationRequest;

    // Validate request
    if (!operation || !product_ids || product_ids.length === 0) {
      return NextResponse.json(
        { error: 'operation and product_ids are required' },
        { status: 400 }
      );
    }

    if (!Object.values(BulkOperation).includes(operation)) {
      return NextResponse.json(
        { error: 'Invalid operation', valid_operations: Object.values(BulkOperation) },
        { status: 400 }
      );
    }

    // Create operation record
    const operationId = `bulk-op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const operationResult: BulkOperationResult = {
      operation_id: operationId,
      operation,
      status: 'processing',
      total_items: product_ids.length,
      processed_items: 0,
      successful_items: 0,
      failed_items: 0,
      errors: [],
      started_at: new Date().toISOString(),
      completed_at: null,
    };

    operationDatabase.set(operationId, operationResult);

    // Execute bulk operation (simplified - in production would be async job)
    let successCount = 0;
    const errors: Array<{ product_id: string; error: string }> = [];

    for (const productId of product_ids) {
      try {
        await executeBulkOperation(operation, productId, data);
        successCount++;
        operationResult.successful_items++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ product_id: productId, error: errorMsg });
        operationResult.failed_items++;
      }
      operationResult.processed_items++;
    }

    // Update operation result
    operationResult.status = errors.length === 0 ? 'completed' : 'completed';
    operationResult.errors = errors;
    operationResult.completed_at = new Date().toISOString();

    operationDatabase.set(operationId, operationResult);

    return NextResponse.json({
      success: true,
      operation_result: operationResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    console.error('Bulk operation error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/bulk/operations?operation_id=XXX
 * Get status of a bulk operation
 */
export async function GET(request: NextRequest) {
  try {
    const operationId = request.nextUrl.searchParams.get('operation_id');

    if (!operationId) {
      return NextResponse.json({ error: 'operation_id is required' }, { status: 400 });
    }

    const operation = operationDatabase.get(operationId);

    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }

    return NextResponse.json(operation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Execute individual bulk operation
 */
async function executeBulkOperation(
  operation: BulkOperation,
  productId: string,
  data?: Record<string, any>
): Promise<void> {
  const product = await printify.products.getOne(productId);

  switch (operation) {
    case BulkOperation.PUBLISH:
      // Would call Printify publish endpoint
      console.log(`Publishing product ${productId}`);
      break;

    case BulkOperation.UNPUBLISH:
      // Would call Printify unpublish endpoint
      console.log(`Unpublishing product ${productId}`);
      break;

    case BulkOperation.DELETE:
      // Would call Printify delete endpoint
      console.log(`Deleting product ${productId}`);
      break;

    case BulkOperation.UPDATE_PRICE:
      if (!data?.price) throw new Error('Price is required');
      await printify.products.updateOne(productId, {
        variants: product.variants?.map((v: any) => ({
          ...v,
          price: data.price,
        })),
      });
      console.log(`Updated price for ${productId} to ${data.price}`);
      break;

    case BulkOperation.UPDATE_SKU:
      if (!data?.sku) throw new Error('SKU is required');
      await printify.products.updateOne(productId, {
        variants: product.variants?.map((v: any) => ({
          ...v,
          sku: data.sku,
        })),
      });
      console.log(`Updated SKU for ${productId}`);
      break;

    case BulkOperation.DISABLE_VARIANTS:
      if (!data?.variant_ids || !Array.isArray(data.variant_ids))
        throw new Error('variant_ids array is required');
      await printify.products.updateOne(productId, {
        variants: product.variants?.map((v: any) =>
          data.variant_ids.includes(v.id) ? { ...v, is_enabled: false } : v
        ),
      });
      console.log(`Disabled variants for ${productId}`);
      break;

    case BulkOperation.ENABLE_VARIANTS:
      if (!data?.variant_ids || !Array.isArray(data.variant_ids))
        throw new Error('variant_ids array is required');
      await printify.products.updateOne(productId, {
        variants: product.variants?.map((v: any) =>
          data.variant_ids.includes(v.id) ? { ...v, is_enabled: true } : v
        ),
      });
      console.log(`Enabled variants for ${productId}`);
      break;

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
