# Webhook Quick Start (5 Minutes)

## TL;DR Setup

### 1. Generate Secret (Terminal)
```bash
# macOS/Linux
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

### 2. Add to `.env.local`
```env
PRINTIFY_WEBHOOK_SECRET=your-generated-secret
NEXT_PUBLIC_APP_URL=https://your-public-url
```

### 3. Get Public URL
```bash
# In new terminal (if using ngrok)
ngrok http 3000

# Copy URL: https://abc-123-def.ngrok.io
```

### 4. Register in Printify Dashboard
1. Go: https://dashboard.printify.com/settings/webhooks
2. Click "Add Webhook"
3. Fill:
   - **Topic:** `order:shipment:created`
   - **URL:** `https://abc-123-def.ngrok.io/api/webhooks/printify`
   - **Secret:** Your generated secret
4. Click Save

### 5. Test
Create an order via campaign → Check tracking page → Status auto-updates

---

## What Happens

```
Order Created in Printify
        ↓
Printify sends POST to your webhook
        ↓
/api/webhooks/printify receives it
        ↓
Verifies signature (security check)
        ↓
Updates tracking record
        ↓
User's tracking page shows update
```

---

## Environment Variables

Add these to `.env.local`:

```env
# Required
PRINTIFY_API_KEY=your_api_key
PRINTIFY_SHOP_ID=your_shop_id

# For webhooks
PRINTIFY_WEBHOOK_SECRET=generated_secret_here
NEXT_PUBLIC_APP_URL=https://abc-123-def.ngrok.io
```

---

## Webhook Events to Register

In Printify dashboard, add webhooks for:

| Event | What Happens | Tracking Updates |
|-------|--------------|------------------|
| `order:created` | Order placed | Initialize tracking |
| `order:updated` | Status changes | Update progress |
| `order:shipment:created` | Ships | Add tracking #, carrier |
| `order:shipment:delivered` | Delivered | Mark as delivered |
| `order:canceled` | Cancelled | Mark as cancelled |

---

## Test Webhook Manually

```bash
# Generate test signature
BODY='{"topic":"order:shipment:created","data":{"id":"order123","shipping_tracking_company":"FedEx","shipping_tracking_number":"1Z123"}}'
SECRET="your-webhook-secret"
SIGNATURE="sha256=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)"

# Send test webhook
curl -X POST http://localhost:3000/api/webhooks/printify \
  -H "Content-Type: application/json" \
  -H "x-pfy-signature: $SIGNATURE" \
  -d "$BODY"
```

---

## Check Logs

Run app and look for:
```bash
npm run dev

# Watch for:
# [Webhook] Received: order:shipment:created for order abc123
# [Webhook] Tracking updated for order abc123: shipped
```

---

## Troubleshooting

**Webhook not received?**
- Is URL public? Test: `curl https://your-url/api/webhooks/printify`
- Is webhook registered in Printify? Check dashboard
- Is ngrok running? `ngrok http 3000`

**Signature validation failed?**
- Double-check `PRINTIFY_WEBHOOK_SECRET` matches dashboard
- Verify secret is not quoted in .env

**Tracking not updating?**
- Check app logs for "[Webhook]" messages
- Verify tracking endpoint works: `curl http://localhost:3000/api/fulfillment/tracking`

---

## Files Created

- ✅ `/src/app/api/webhooks/printify/route.ts` - Webhook handler
- ✅ Webhook handlers for each event type
- ✅ Signature verification
- ✅ Tracking auto-update

---

## What You Get

✨ **Real-time order tracking**
- No more polling with auto-refresh
- Instant status updates when Printify updates
- Users see shipping info immediately
- Better UX for customers

---

## Next Steps

1. Generate secret & add to .env
2. Get public URL (ngrok or deploy)
3. Register webhook in Printify
4. Create test order
5. Watch tracking page update in real-time

See **WEBHOOK_SETUP_GUIDE.md** for detailed instructions.

