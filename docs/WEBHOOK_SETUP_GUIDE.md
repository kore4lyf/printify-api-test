# Printify Webhook Setup Guide

## What Are Webhooks?

Webhooks are real-time notifications from Printify when your orders change status.

**Without webhooks** (current):
- You must manually check tracking page
- Auto-refresh polls every 60 seconds
- Delays in seeing updates

**With webhooks** (goal):
- Printify sends instant notification when order updates
- Your app automatically updates tracking
- Real-time status for users

---

## Prerequisites

1. **Printify Account** with shop connected
2. **API Key** (`PRINTIFY_API_KEY` in .env.local)
3. **Shop ID** (`PRINTIFY_SHOP_ID` in .env.local)
4. **Public URL** for your app (webhooks need to reach you)

---

## Part 1: Get Public URL (for local development)

### Option A: Using ngrok (Recommended for local testing)

1. **Install ngrok:**
   ```bash
   # Windows: download from https://ngrok.com/download
   # Or use choco: choco install ngrok
   ngrok --version  # verify installation
   ```

2. **Start your Next.js app:**
   ```bash
   npm run dev
   # Should run on http://localhost:3000
   ```

3. **In new terminal, expose to internet:**
   ```bash
   ngrok http 3000
   ```

4. **Copy public URL:**
   ```
   Forwarding    https://abc-123-def.ngrok.io -> http://localhost:3000
                                    ^^^^^^^^^^^^
                              Use this URL
   ```

5. **Your webhook URL will be:**
   ```
   https://abc-123-def.ngrok.io/api/webhooks
   ```

### Option B: Deploy to production

If already deployed:
- Use your production domain: `https://yourdomain.com/api/webhooks`

### Option C: Local testing only

If not ready for webhooks, skip to Part 5 for testing without them.

---

## Part 2: Create Webhook Handler

Create a handler to receive Printify webhooks:

**File:** `/src/app/api/webhooks/printify/route.ts` (new file)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Webhook shared secret (configure in Printify dashboard)
const WEBHOOK_SECRET = process.env.PRINTIFY_WEBHOOK_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-pfy-signature');

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, WEBHOOK_SECRET)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const { topic, shop_id, data } = payload;

    console.log(`[Webhook] Topic: ${topic}, Order: ${data?.id}`);

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

    // Printify requires 200 OK response
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Verify webhook signature for security
function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const expectedSignature = `sha256=${hash}`;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Handle order:created webhook
async function handleOrderCreated(data: any) {
  console.log(`Order created: ${data.id}`, {
    status: data.status,
    total: data.total_price,
  });

  // Initialize tracking record
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fulfillment/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: data.id,
      status: 'pending',
      description: 'Order created and received',
    }),
  });

  // TODO: Send confirmation email to customer
}

// Handle order:updated webhook
async function handleOrderUpdated(data: any) {
  console.log(`Order updated: ${data.id}`, {
    status: data.status,
  });

  // Map Printify status to tracking status
  let trackingStatus = data.status; // pending, confirmed, in_progress, etc.

  // Update tracking
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fulfillment/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: data.id,
      status: trackingStatus,
      description: `Order status updated to ${data.status}`,
    }),
  });
}

// Handle order:shipment:created webhook
async function handleShipmentCreated(data: any) {
  console.log(`Shipment created: ${data.id}`, {
    tracking_number: data.shipping_tracking_number,
    carrier: data.shipping_tracking_company,
  });

  // Update tracking with shipping info
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fulfillment/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: data.id,
      status: 'shipped',
      carrier: data.shipping_tracking_company,
      tracking_number: data.shipping_tracking_number,
      description: 'Package shipped and in transit',
    }),
  });

  // TODO: Send shipping notification email with tracking link
}

// Handle order:shipment:delivered webhook
async function handleShipmentDelivered(data: any) {
  console.log(`Shipment delivered: ${data.id}`);

  // Update tracking
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fulfillment/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: data.id,
      status: 'delivered',
      description: 'Package delivered successfully',
    }),
  });

  // TODO: Send delivery confirmation email
}

// Handle order:canceled webhook
async function handleOrderCanceled(data: any) {
  console.log(`Order canceled: ${data.id}`);

  // Update tracking
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fulfillment/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: data.id,
      status: 'cancelled',
      description: 'Order was cancelled',
    }),
  });

  // TODO: Send cancellation email
}
```

---

## Part 3: Register Webhook in Printify Dashboard

### Step 1: Get Webhook Secret

In your terminal, generate a secure random secret:

```bash
# macOS/Linux
openssl rand -hex 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

Copy the generated secret and save it to `.env.local`:

```env
PRINTIFY_WEBHOOK_SECRET=your-generated-secret-here
```

### Step 2: Register Webhook in Printify

1. **Login to Printify Dashboard:** https://dashboard.printify.com

2. **Go to Settings → Webhooks**

3. **Create a new webhook:**
   - **Event Type:** Select all events you want:
     - `order:created` - When new order is created
     - `order:updated` - When order status changes
     - `order:shipment:created` - When order ships
     - `order:shipment:delivered` - When order delivered
     - `order:canceled` - When order is canceled

   - **URL:** Your webhook endpoint
     ```
     https://abc-123-def.ngrok.io/api/webhooks/printify
     ```

   - **Shared Secret:** The secret you generated above
     ```
     your-generated-secret-here
     ```

4. **Click Save**

5. **Test webhook** (if available in dashboard)

---

## Part 4: Update Environment Variables

Add to `.env.local`:

```env
# Printify API
PRINTIFY_API_KEY=your_api_key
PRINTIFY_SHOP_ID=your_shop_id
PRINTIFY_WEBHOOK_SECRET=your-webhook-secret

# Public URL for webhooks
NEXT_PUBLIC_APP_URL=https://abc-123-def.ngrok.io
```

---

## Part 5: Test Webhook Flow

### Test 1: Manual Webhook Trigger

Simulate a webhook without Printify:

```bash
# Generate signature (macOS/Linux)
BODY='{"topic":"order:updated","shop_id":"123","data":{"id":"5a9","status":"in_progress"}}'
SIGNATURE="sha256=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "your-webhook-secret" -hex | cut -d' ' -f2)"

curl -X POST http://localhost:3000/api/webhooks/printify \
  -H "Content-Type: application/json" \
  -H "x-pfy-signature: $SIGNATURE" \
  -d "$BODY"
```

### Test 2: Using Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:3000/api/webhooks/printify`
4. Headers:
   ```
   Content-Type: application/json
   x-pfy-signature: sha256=<calculated-signature>
   ```
5. Body (raw JSON):
   ```json
   {
     "topic": "order:shipment:created",
     "shop_id": "your_shop_id",
     "timestamp": "2024-01-20T10:30:00Z",
     "data": {
       "id": "5a9c1d2e3f4g5h6i7j8k",
       "status": "in_progress",
       "shipping_tracking_number": "1Z999AA10123456784",
       "shipping_tracking_company": "FedEx"
     }
   }
   ```

### Test 3: Monitor Tracking Update

1. Create an order via campaign (get Order ID)
2. Send webhook to `/api/webhooks/printify` with that Order ID
3. Go to `/campaign/track`
4. Enter Order ID
5. See updated status!

---

## Part 6: Webhook Flow Diagram

```
┌──────────────────┐
│  Printify API    │
│  Order Updated   │
└────────┬─────────┘
         │
         │ HTTP POST
         │ (order:shipment:created)
         │
         ▼
┌──────────────────────────────────────┐
│  Your App: /api/webhooks/printify    │
│                                      │
│  1. Receive webhook                  │
│  2. Verify signature                 │
│  3. Parse order data                 │
│  4. Determine tracking status        │
│  5. Update tracking record           │
└─────────┬──────────────────────────┬─┘
          │                          │
          ▼                          ▼
  ┌──────────────────┐   ┌──────────────────┐
  │ Update Tracking  │   │  Send Email      │
  │ /fulfillment/    │   │  (notification)  │
  │ tracking         │   │  (future)        │
  └──────────────────┘   └──────────────────┘
          │
          ▼
  ┌──────────────────┐
  │ User's Browser   │
  │ Auto-refresh     │
  │ /campaign/track  │
  │ Sees new status! │
  └──────────────────┘
```

---

## Part 7: Printify Webhook Events

### Available Events

| Event | When | Payload |
|-------|------|---------|
| `order:created` | Order placed | Order object |
| `order:updated` | Status changes | Updated order object |
| `order:shipment:created` | Order ships | Shipment tracking info |
| `order:shipment:delivered` | Delivered | Delivery confirmation |
| `order:canceled` | Order cancelled | Cancellation details |
| `product:created` | Product added | Product object |
| `product:deleted` | Product removed | Product object |

### Webhook Payload Example

```json
{
  "topic": "order:shipment:created",
  "shop_id": "25274428",
  "timestamp": "2024-01-20T10:30:00Z",
  "data": {
    "id": "5a9c1d2e3f4g5h6i7j8k",
    "status": "in_progress",
    "total_price": 15000,
    "line_items": [
      {
        "product_id": "5d39b159e7c48c000728c89f",
        "variant_id": 33719,
        "quantity": 1
      }
    ],
    "shipping_method": 1,
    "address_to": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "country": "US",
      "city": "New York",
      "zip": "10001",
      "address1": "123 Main St"
    },
    "shipping_tracking_company": "FedEx",
    "shipping_tracking_number": "1Z999AA10123456784",
    "shipping_tracking_url": "https://tracking.fedex.com/...",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  }
}
```

---

## Part 8: Webhook Security

### Signature Verification (Already Implemented)

Printify sends `x-pfy-signature` header with HMAC SHA256 signature:

```
x-pfy-signature: sha256=abc123def456...
```

Your code verifies:
```typescript
const hash = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

const valid = hash === signature.replace('sha256=', '');
```

### Best Practices

1. ✅ **Verify signature** (prevents spoofed webhooks)
2. ✅ **Log all webhooks** (for debugging)
3. ✅ **Handle idempotency** (Printify retries; same event can arrive twice)
4. ✅ **Return 200 OK** (tells Printify you received it)
5. ✅ **Don't block on processing** (respond quickly, process in background)

---

## Part 9: Retry Logic

Printify retries failed webhooks:
- **3 retries** on 4xx/5xx errors
- **1 hour block** after final failure
- **Exponential backoff** between retries

Make sure your endpoint:
- ✅ Returns 200 OK (even if processing fails)
- ✅ Doesn't timeout (keep it fast)
- ✅ Handles duplicate events (idempotent)

---

## Part 10: Monitor Webhooks

### Check Webhook Logs

Use Printify SDK to list webhooks:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.printify.com/v1/shops/YOUR_SHOP_ID/webhooks.json
```

Or use your app:

```bash
GET http://localhost:3000/api/webhooks
```

Response:
```json
[
  {
    "id": "webhook_id",
    "topic": "order:created",
    "url": "https://abc-123-def.ngrok.io/api/webhooks/printify",
    "created_at": "2024-01-20T10:30:00Z"
  }
]
```

---

## Troubleshooting

### Webhook Not Received

1. **Check URL is public:**
   ```bash
   curl https://abc-123-def.ngrok.io/api/webhooks/printify
   # Should not error
   ```

2. **Verify in Printify dashboard** that webhook is registered

3. **Check app logs:**
   ```bash
   npm run dev
   # Look for "[Webhook]" logs
   ```

4. **Test with ngrok inspect:**
   ```bash
   ngrok http --inspect-browsers=false 3000
   # Visit http://127.0.0.1:4040 to see requests
   ```

### Signature Validation Failed

1. **Verify WEBHOOK_SECRET matches** in Printify dashboard
2. **Ensure exact body** is used for signature (don't parse/reparse)
3. **Check secret format** (no extra spaces/quotes)

### Tracking Not Updating

1. **Check webhook received** (logs should show "[Webhook] Topic: ...")
2. **Verify tracking API endpoint** is accessible
3. **Check browser DevTools** → Network → tracking updates

---

## Summary

**Setup Steps:**
1. ✅ Get public URL (ngrok)
2. ✅ Create webhook handler (`/api/webhooks/printify`)
3. ✅ Generate webhook secret
4. ✅ Register in Printify dashboard
5. ✅ Add env variables
6. ✅ Test webhook flow
7. ✅ Monitor tracking updates

**Result:**
- Real-time order status updates
- Automatic tracking page refreshes
- No more polling with auto-refresh

