import { NextRequest, NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export enum FulfillmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PRINTED = 'printed',
  QUALITY_CHECK = 'quality_check',
  PACKAGED = 'packaged',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

interface TrackingEvent {
  status: FulfillmentStatus;
  timestamp: string;
  description: string;
  location?: string;
  details?: Record<string, any>;
}

interface FulfillmentTracking {
  order_id: string;
  current_status: FulfillmentStatus;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  events: TrackingEvent[];
  estimated_delivery: string | null;
  carrier: string | null;
  tracking_number: string | null;
  last_updated: string;
}

// In-memory storage for tracking (production: use database)
const trackingDatabase: Map<string, FulfillmentTracking> = new Map();

// Initialize tracking timeline
const fulfillmentTimeline = [
  FulfillmentStatus.PENDING,
  FulfillmentStatus.CONFIRMED,
  FulfillmentStatus.PRINTED,
  FulfillmentStatus.QUALITY_CHECK,
  FulfillmentStatus.PACKAGED,
  FulfillmentStatus.SHIPPED,
  FulfillmentStatus.IN_TRANSIT,
  FulfillmentStatus.OUT_FOR_DELIVERY,
  FulfillmentStatus.DELIVERED,
];

/**
 * GET /api/fulfillment/tracking?order_id=XXX
 * Fetch fulfillment tracking information for an order
 */
export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Try to get from Printify API first
    const order = await printify.orders.getOne(orderId);

    // Check local tracking database
    let tracking = trackingDatabase.get(orderId);

    if (!tracking) {
      // Initialize new tracking record
      tracking = {
        order_id: orderId,
        current_status: FulfillmentStatus.PENDING,
        current_step: 0,
        total_steps: fulfillmentTimeline.length,
        progress_percentage: 0,
        events: [
          {
            status: FulfillmentStatus.PENDING,
            timestamp: new Date().toISOString(),
            description: 'Order received and pending confirmation',
            details: { order_id: orderId },
          },
        ],
        estimated_delivery: null,
        carrier: null,
        tracking_number: null,
        last_updated: new Date().toISOString(),
      };
      trackingDatabase.set(orderId, tracking);
    }

    return NextResponse.json({
      ...tracking,
      order_summary: {
        id: order.id,
        status: order.status,
        total_price: order.total_price,
        line_items_count: order.line_items.length,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/fulfillment/tracking
 * Update fulfillment tracking status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status, tracking_number, carrier, estimated_delivery, description, location } = body;

    if (!order_id || !status) {
      return NextResponse.json(
        { error: 'order_id and status are required' },
        { status: 400 }
      );
    }

    if (!Object.values(FulfillmentStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid fulfillment status', valid_statuses: Object.values(FulfillmentStatus) },
        { status: 400 }
      );
    }

    let tracking = trackingDatabase.get(order_id);

    if (!tracking) {
      tracking = {
        order_id,
        current_status: FulfillmentStatus.PENDING,
        current_step: 0,
        total_steps: fulfillmentTimeline.length,
        progress_percentage: 0,
        events: [],
        estimated_delivery: null,
        carrier: null,
        tracking_number: null,
        last_updated: new Date().toISOString(),
      };
    }

    // Find step number
    const stepIndex = fulfillmentTimeline.indexOf(status);
    const progressPercentage = ((stepIndex + 1) / fulfillmentTimeline.length) * 100;

    // Add event
    const event: TrackingEvent = {
      status,
      timestamp: new Date().toISOString(),
      description: description || `Status updated to ${status}`,
      location,
      details: {
        tracking_number,
        carrier,
      },
    };

    tracking.events.push(event);
    tracking.current_status = status;
    tracking.current_step = stepIndex + 1;
    tracking.progress_percentage = progressPercentage;

    if (tracking_number) tracking.tracking_number = tracking_number;
    if (carrier) tracking.carrier = carrier;
    if (estimated_delivery) tracking.estimated_delivery = estimated_delivery;

    tracking.last_updated = new Date().toISOString();

    trackingDatabase.set(order_id, tracking);

    return NextResponse.json({
      success: true,
      order_id,
      tracking,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    console.error('Fulfillment tracking error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
