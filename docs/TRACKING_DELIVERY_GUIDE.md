# Tracking & Delivery Guide

## Overview

This guide explains how the order tracking system works after users complete their campaign contributions with merchandise.

---

## What is Order Tracking?

After a user contributes to a campaign and receives merchandise (Merch VIP tier), they can track their order through the fulfillment process:

- **Production Stage**: When the product is being printed/customized
- **Quality Check**: When the product is inspected
- **Packaging**: When the product is being prepared for shipment
- **Shipping**: When the product is picked up by carrier
- **Delivery**: When the product arrives at the customer

---

## How It Works

### 1. User Completes Campaign Contribution

**Path:** Home → Campaign → Merch VIP Contribution

**Flow:**
1. User selects "Merch VIP" tier
2. Fills in shipping information
3. Clicks "Complete Contribution"
4. Order created in Printify API
5. **Order ID received** and displayed in success dialog

### 2. Order ID Display

After order is created, the success screen shows:

```
┌─────────────────────────────────────────┐
│  ✓ Thank You!                           │
│                                         │
│  Your merchandise order has been        │
│  created. You'll receive shipping       │
│  updates and tracking information       │
│  via email.                             │
│                                         │
│  Your Order ID: [5a9c1d2e3f4g5h6i7j8k] │
│  Save this ID to track your order       │
│                                         │
│  [Track Your Delivery >]                │
└─────────────────────────────────────────┘
```

**What users get:**
- Order ID (unique identifier for Printify order)
- Link to tracking page
- Confirmation email with order details

### 3. Access Tracking Page

**Path:** `/campaign/track`

**Features:**
- Search by Order ID
- Real-time fulfillment status
- Progress percentage
- Timeline of events
- Shipping information (carrier, tracking number, estimated delivery)
- Auto-refresh capability (every 60 seconds)

---

## Tracking Workflow

### Step 1: Enter Order ID

```
┌──────────────────────────────────────────┐
│  Track Your Campaign Order               │
│  Enter your order ID to view real-time   │
│  delivery tracking and fulfillment       │
│  status                                  │
│                                          │
│  [Order ID Input Field]                  │
│  [Track Order Button]                    │
│                                          │
│  💡 Tip: After completing your campaign  │
│  contribution, you'll receive an email   │
│  with your order ID.                     │
└──────────────────────────────────────────┘
```

### Step 2: View Order Status

Once order ID is submitted, the page displays:

#### Status Summary Card
```
┌────────────────────────────────────────┐
│  Current Status: [Status Name]         │
│  Progress: XX%                         │
│  Step: X of 9                          │
│  Last Updated: [Date/Time]             │
└────────────────────────────────────────┘
```

#### Shipping Information
```
┌────────────────────────────────────────┐
│  Shipping Information                  │
│  Carrier: FedEx (or UPS, DHL, etc.)    │
│  Tracking #: 1Z999AA10123456784        │
│  Est. Delivery: Jan 20, 2024           │
└────────────────────────────────────────┘
```

#### Progress Bar
```
Fulfillment Progress: 45%
[███████░░░░░░░░░░░░░░░░░░░░░] 45%
```

#### Timeline
Shows chronological events:
```
📍 Pending
   Order received and pending confirmation
   Jan 15, 2024 10:30 AM

|

📍 Confirmed
   Order confirmed and sent to production
   Jan 15, 2024 11:00 AM

|

📍 Printed
   Design printed on product
   Jan 17, 2024 2:15 PM

|

📍 Quality Check
   Product being inspected
   Jan 18, 2024 9:45 AM

|

📍 Packaged
   Order packaged for shipment
   Jan 19, 2024 4:20 PM

|

📍 Shipped
   Package picked up by carrier
   Jan 20, 2024 8:00 AM
   📦 FedEx | Tracking: 1Z999AA10123...
```

---

## Fulfillment Statuses

### Complete Status Lifecycle

1. **PENDING** (0%)
   - Order received from API
   - Awaiting production start
   - Typically: 0-2 hours

2. **CONFIRMED** (11%)
   - Order confirmed with print provider
   - Added to production queue
   - Typically: 2-4 hours

3. **PRINTED** (22%)
   - Design printed on product
   - Customization complete
   - Typically: 1-3 days

4. **QUALITY CHECK** (33%)
   - Product inspected for defects
   - Approved for packaging
   - Typically: 1 day

5. **PACKAGED** (44%)
   - Product packed for shipment
   - Label generated
   - Ready for pickup
   - Typically: 1 day

6. **SHIPPED** (55%)
   - Package picked up by carrier
   - In carrier's network
   - Tracking number available
   - Typically: 1 day

7. **IN_TRANSIT** (66%)
   - Package in transit to destination
   - Moving through carrier network
   - Typically: 3-7 days

8. **OUT_FOR_DELIVERY** (77%)
   - Package out for final delivery
   - Expected to arrive same day
   - Typically: 0-1 days

9. **DELIVERED** (88%)
   - Package delivered to customer
   - Complete!
   - Final status

### Additional Statuses

- **FAILED** (0%) - Order creation or fulfillment failed
- **CANCELLED** (0%) - Order was cancelled

---

## Tracking Architecture

### Frontend Components

**Path:** `/src/components/FulfillmentTrackingViewer.tsx`

```typescript
interface TrackingData {
  order_id: string;
  current_status: string;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  events: TrackingEvent[];
  estimated_delivery: string | null;
  carrier: string | null;
  tracking_number: string | null;
  last_updated: string;
}

interface TrackingEvent {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
  details?: Record<string, any>;
}
```

**Features:**
- Real-time status fetching
- Auto-refresh every 60 seconds (optional)
- Visual status icons
- Timeline display
- Progress percentage calculation

### Backend API

**Path:** `/src/app/api/fulfillment/tracking/route.ts`

#### GET `/api/fulfillment/tracking?order_id=XXX`

**Request:**
```
GET /api/fulfillment/tracking?order_id=5a9c1d2e3f4g5h6i7j8k
```

**Response (200 OK):**
```json
{
  "order_id": "5a9c1d2e3f4g5h6i7j8k",
  "current_status": "in_transit",
  "current_step": 7,
  "total_steps": 9,
  "progress_percentage": 66.67,
  "events": [
    {
      "status": "pending",
      "timestamp": "2024-01-15T10:30:00Z",
      "description": "Order received and pending confirmation"
    },
    {
      "status": "confirmed",
      "timestamp": "2024-01-15T11:00:00Z",
      "description": "Order confirmed and sent to production"
    }
    // ... more events
  ],
  "carrier": "FedEx",
  "tracking_number": "1Z999AA10123456784",
  "estimated_delivery": "2024-01-22T18:00:00Z",
  "last_updated": "2024-01-20T15:30:00Z",
  "order_summary": {
    "id": "5a9c1d2e3f4g5h6i7j8k",
    "status": "in_transit",
    "total_price": 15000,
    "line_items_count": 1,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### POST `/api/fulfillment/tracking`

**Update tracking status** (e.g., when Printify sends webhook)

**Request:**
```json
{
  "order_id": "5a9c1d2e3f4g5h6i7j8k",
  "status": "in_transit",
  "carrier": "FedEx",
  "tracking_number": "1Z999AA10123456784",
  "estimated_delivery": "2024-01-22",
  "description": "Package in transit to destination",
  "location": "Memphis, TN"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "order_id": "5a9c1d2e3f4g5h6i7j8k",
  "message": "Order status updated to in_transit",
  "tracking": {
    // Full tracking object
  }
}
```

---

## Data Flow

```
┌─────────────────────────────────────────┐
│  1. Campaign Contribution               │
│  User selects Merch VIP, fills form     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  2. Order Creation                      │
│  POST /api/orders (to Printify)         │
│  Returns: Order ID + status: "draft"    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  3. Success Display                     │
│  Show Order ID in dialog                │
│  User saves Order ID                    │
│  User receives confirmation email       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  4. User Visits Tracking Page           │
│  /campaign/track                        │
│  Enters Order ID                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  5. Fetch Tracking Info                 │
│  GET /api/fulfillment/tracking?order_id │
│  Returns: Current status, progress, etc │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  6. Display Tracking                    │
│  Status summary card                    │
│  Progress bar                           │
│  Timeline of events                     │
│  Shipping information                   │
│  Auto-refresh every 60s                 │
└─────────────────────────────────────────┘
```

---

## Testing the Tracking System

### Manual Testing

1. **Create an order:**
   - Go to home page
   - Select a campaign
   - Choose Merch VIP tier
   - Fill shipping information
   - Complete contribution
   - Copy the Order ID

2. **View tracking:**
   - Click "Track Your Delivery" link or
   - Go to `/campaign/track`
   - Paste Order ID
   - Click "Track Order"
   - See initial "pending" status with 0% progress

3. **Simulate status update** (requires terminal/API tool):
   ```bash
   curl -X POST http://localhost:3000/api/fulfillment/tracking \
     -H "Content-Type: application/json" \
     -d '{
       "order_id": "YOUR_ORDER_ID",
       "status": "confirmed",
       "description": "Order confirmed and sent to production"
     }'
   ```

4. **Auto-refresh test:**
   - Enable "Auto-refresh" checkbox
   - Page will fetch new data every 60 seconds
   - Update status via API and watch page refresh

### Printify Webhook Integration

When Printify sends order webhooks, parse them and update tracking:

```typescript
// Webhook received: "order:updated"
POST /api/webhooks
{
  "topic": "order:updated",
  "data": {
    "id": "5a9...",
    "status": "in_progress",
    "shipping_tracking_url": "https://tracking.fedex.com/...",
    "shipping_tracking_company": "FedEx",
    "shipping_tracking_number": "1Z999AA10123456784"
  }
}

// Update tracking:
POST /api/fulfillment/tracking
{
  "order_id": "5a9...",
  "status": "in_transit",
  "carrier": "FedEx",
  "tracking_number": "1Z999AA10123456784",
  "description": "Order shipped and in transit"
}
```

---

## User Experience Flow

### Desktop View
```
┌────────────────────────────────────────────┐
│  Track Your Campaign Order                  │
│  ────────────────────────────────────────  │
│                                             │
│  Enter Order ID                             │
│  [Order ID input field          ][Search]   │
│                                             │
│  💡 Tip: Check your confirmation email    │
└────────────────────────────────────────────┘

                    ▼

┌────────────────────────────────────────────┐
│  Order Tracking - Order ID: 5a9c1d2e...    │
│                                             │
│  [← Search Another Order]                   │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Current Status: In Transit        ▶  │  │
│  │ Progress: 66%                        │  │
│  │ Step: 7 of 9                        │  │
│  │ Last Updated: Jan 20, 3:30 PM       │  │
│  │ ☐ Auto-refresh                      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Shipping Information                 │  │
│  │ Carrier: FedEx                       │  │
│  │ Tracking: 1Z999AA10123456784         │  │
│  │ Est. Delivery: Jan 22, 2024          │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Fulfillment Progress                       │
│  [███████████░░░░░░░░░░░░░░░░] 66%         │
│                                             │
│  Timeline                                   │
│  ✓ Pending - Jan 15, 10:30 AM              │
│  ✓ Confirmed - Jan 15, 11:00 AM            │
│  ✓ Printed - Jan 17, 2:15 PM               │
│  ✓ Quality Check - Jan 18, 9:45 AM         │
│  ✓ Packaged - Jan 19, 4:20 PM              │
│  ✓ Shipped - Jan 20, 8:00 AM               │
│  ◐ In Transit - Jan 20, 3:30 PM            │
│  ○ Out for Delivery (pending)               │
│  ○ Delivered (pending)                      │
│                                             │
│  Fulfillment Status Guide                   │
│  ● Pending: Order awaiting production      │
│  ● Confirmed: Sent to production           │
│  ...                                        │
└────────────────────────────────────────────┘
```

---

## FAQ

**Q: When will I get my Order ID?**
A: Immediately after completing your campaign contribution. It's displayed in the success dialog and also sent to your confirmation email.

**Q: How often is tracking updated?**
A: Tracking updates automatically as your order progresses. You can enable auto-refresh to check every 60 seconds.

**Q: What if my tracking shows "Pending" for a long time?**
A: Orders typically move through pending within 2-4 hours. If it's been longer, check your email for updates or try refreshing.

**Q: Can I track my order without the Order ID?**
A: You'll need the Order ID to search. Check your confirmation email or the success dialog from when you placed the order.

**Q: How long does shipping take?**
A: Shipping time varies by location. Once "Shipped" status is reached, your estimated delivery date will appear in the tracking info.

**Q: What if my package shows "Out for Delivery" but doesn't arrive?**
A: Contact the carrier using your tracking number for updates. Check the carrier's website for status.

---

## Integration Checklist

- [x] Tracking page created (`/campaign/track`)
- [x] FulfillmentTrackingViewer component displays tracking
- [x] Tracking API endpoint (`/api/fulfillment/tracking`)
- [x] Order ID captured and displayed in success dialog
- [x] Order ID link to tracking page in dialog
- [x] Auto-refresh capability
- [x] Visual status indicators and timeline
- [x] Progress percentage calculation
- [ ] Printify webhook integration to auto-update tracking
- [ ] Email notifications when status changes
- [ ] SMS tracking option (future)

