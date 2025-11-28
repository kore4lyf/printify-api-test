import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Webhook shared secret from environment (set in .env.local and Printify dashboard)
const WEBHOOK_SECRET = process.env.PRINTIFY_WEBHOOK_SECRET || '';

/**
 * POST /api/webhooks/printify
 * Receive webhooks from Printify API
 * 
 * Handles:
 * - order:created - When new order is created
 * - order:updated - When order status changes
 * - order:shipment:created - When package ships
 * - order:shipment:delivered - When package is delivered
 * - order:canceled - When order is cancelled
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body as text (needed for signature verification)
    const body = await request.text();
    const signature = request.headers.get('x-pfy-signature');

    // Verify webhook signature for security
    if (!verifyWebhookSignature(body, signature, WEBHOOK_SECRET)) {
      console.warn('[Webhook] Invalid signature - rejecting webhook');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const { topic, shop_id, data } = payload;

    console.log(`[Webhook] Received: ${topic} for order ${data?.id}`);

    // Handle different webhook topics
    switch (topic) {
      case 'order:created':
        await handleOrderCreated(data);
        break;

      case 'order:updated':
        await handleOrderUpdated(data);
        break;

      case 'order:shipment:created':
        await handleShipmentCreated(data);
        break;

      case 'order:shipment:delivered':
        await handleShipmentDelivered(data);
        break;

      case 'order:canceled':
        await handleOrderCanceled(data);
        break;

      default:
        console.log(`[Webhook] Unhandled topic: ${topic}`);
    }

    // Always return 200 OK to acknowledge receipt
    // Printify will retry if we return 4xx/5xx
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('[Webhook] Processing error:', error);
    // Return 500 to trigger Printify retry
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Verify webhook signature using HMAC SHA256
 * Prevents spoofed webhooks from unauthorized sources
 */
function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn('[Webhook] Missing signature or secret');
    return false;
  }

  try {
    // Calculate expected signature
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const expectedSignature = `sha256=${hash}`;

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('[Webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * Handle order:created webhook
 * Called when new order is created in Printify
 */
async function handleOrderCreated(data: any) {
  try {
    console.log(`[Webhook] Order created: ${data.id}`, {
      status: data.status,
      totalPrice: data.total_price,
      customer: `${data.address_to.first_name} ${data.address_to.last_name}`,
    });

    // Initialize tracking record
    await updateTracking(data.id, 'pending', {
      description: 'Order created and received',
    });

    // TODO: Send confirmation email to customer
    // - Order ID
    // - Product details
    // - Total price
    // - Estimated delivery time
    // - Link to tracking page

  } catch (error) {
    console.error('[Webhook] Error handling order:created:', error);
    throw error;
  }
}

/**
 * Handle order:updated webhook
 * Called when order status changes in Printify
 */
async function handleOrderUpdated(data: any) {
  try {
    console.log(`[Webhook] Order updated: ${data.id}`, {
      status: data.status,
      updatedAt: data.updated_at,
    });

    // Map Printify status to our tracking status
    const trackingStatus = mapPrintifyStatusToTracking(data.status);

    // Update tracking record
    await updateTracking(data.id, trackingStatus, {
      description: `Order status updated to ${data.status}`,
    });

    // TODO: Send status update email if status changed to something important
    // - "Order confirmed"
    // - "Order printing"
    // - etc.

  } catch (error) {
    console.error('[Webhook] Error handling order:updated:', error);
    throw error;
  }
}

/**
 * Handle order:shipment:created webhook
 * Called when order ships (package picked up by carrier)
 */
async function handleShipmentCreated(data: any) {
  try {
    console.log(`[Webhook] Shipment created: ${data.id}`, {
      carrier: data.shipping_tracking_company,
      trackingNumber: data.shipping_tracking_number,
      trackingUrl: data.shipping_tracking_url,
    });

    // Update tracking with shipping information
    await updateTracking(data.id, 'shipped', {
      carrier: data.shipping_tracking_company,
      tracking_number: data.shipping_tracking_number,
      description: 'Package shipped and in transit',
    });

    // TODO: Send shipping notification email
    // - Carrier name
    // - Tracking number (clickable link)
    // - Estimated delivery
    // - Link to tracking page
    // - "Track your package" button

  } catch (error) {
    console.error('[Webhook] Error handling order:shipment:created:', error);
    throw error;
  }
}

/**
 * Handle order:shipment:delivered webhook
 * Called when package is delivered to customer
 */
async function handleShipmentDelivered(data: any) {
  try {
    console.log(`[Webhook] Shipment delivered: ${data.id}`, {
      deliveredAt: data.updated_at,
    });

    // Update tracking to delivered
    await updateTracking(data.id, 'delivered', {
      description: 'Package delivered successfully',
    });

    // TODO: Send delivery confirmation email
    // - "Your order has been delivered!"
    // - Delivery photo (if available)
    // - Thank you message
    // - Link to campaign/account
    // - Feedback/review request

  } catch (error) {
    console.error('[Webhook] Error handling order:shipment:delivered:', error);
    throw error;
  }
}

/**
 * Handle order:canceled webhook
 * Called when order is cancelled
 */
async function handleOrderCanceled(data: any) {
  try {
    console.log(`[Webhook] Order canceled: ${data.id}`);

    // Update tracking to cancelled
    await updateTracking(data.id, 'cancelled', {
      description: 'Order was cancelled',
    });

    // TODO: Send cancellation email
    // - Reason for cancellation
    // - Refund details (if applicable)
    // - Next steps
    // - Contact support link

  } catch (error) {
    console.error('[Webhook] Error handling order:canceled:', error);
    throw error;
  }
}

/**
 * Update tracking record for order
 * Called from webhook handlers to sync tracking with Printify status
 */
async function updateTracking(
  orderId: string,
  status: string,
  options?: {
    carrier?: string;
    tracking_number?: string;
    estimated_delivery?: string;
    description?: string;
    location?: string;
  }
) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const response = await fetch(`${appUrl}/api/fulfillment/tracking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        status,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tracking update failed: ${error}`);
    }

    console.log(`[Webhook] Tracking updated for order ${orderId}: ${status}`);

  } catch (error) {
    console.error('[Webhook] Error updating tracking:', error);
    throw error;
  }
}

/**
 * Map Printify order statuses to our tracking statuses
 * Printify statuses: draft, pending, confirmed, in_progress, failed, fulfilled, canceled
 */
function mapPrintifyStatusToTracking(printifyStatus: string): string {
  const mapping: Record<string, string> = {
    'draft': 'pending',
    'pending': 'pending',
    'confirmed': 'confirmed',
    'in_progress': 'printed',      // Order is being produced
    'failed': 'failed',
    'fulfilled': 'delivered',       // Order completed (might not have actual delivery yet)
    'canceled': 'cancelled',
  };

  return mapping[printifyStatus] || 'pending';
}
