# Printify SDK Complete Guide

## SDK Method Reference

All methods use the centralized `printify` instance from `/lib/printify.ts`.

### Shops

```typescript
// List all shops in your Printify account
await printify.shops.list()
// Response: Array<Shop>

// Disconnect a shop
await printify.shops.deleteOne(printify.shopId)
// Response: {}
```

### Catalog

```typescript
// List all blueprints (products available for POD)
await printify.catalog.listBlueprints()
// Response: Array<Blueprint>

// Get specific blueprint
await printify.catalog.getBlueprint(blueprintId)
// Response: Blueprint

// Get print providers for a blueprint
await printify.catalog.getBlueprintProviders(blueprintId)
// Response: Array<Provider>

// Get blueprint variants for a specific provider
await printify.catalog.getBlueprintVariants(blueprintId, printProviderId)
// Response: { id, title, variants: Array<Variant> }

// Get shipping info for blueprint variants
await printify.catalog.getVariantShipping(blueprintId, printProviderId)
// Response: { handling_time, profiles: Array<ShippingProfile> }

// List all print providers
await printify.catalog.listProviders()
// Response: Array<Provider>

// Get specific provider
await printify.catalog.getProvider(printProviderId)
// Response: Provider with blueprints
```

### Catalog V2

V2 Catalog API provides detailed shipping information per method:

```typescript
// Get available shipping methods
await printify.v2.catalog.getShippingListInfo(blueprintId, printProviderId)
// Response: Array<ShippingMethod>

// Get standard shipping details
await printify.v2.catalog.getStandardShippingInfo(blueprintId, printProviderId)

// Get priority shipping details
await printify.v2.catalog.getPriorityShippingInfo(blueprintId, printProviderId)

// Get express shipping details
await printify.v2.catalog.getExpressShippingInfo(blueprintId, printProviderId)

// Get economy shipping details
await printify.v2.catalog.getEconomyShippingInfo(blueprintId, printProviderId)
// Response: Array<ShippingInfo>
```

### Products

```typescript
// List products with pagination
await printify.products.list()
await printify.products.list({ page: 2 })
await printify.products.list({ limit: 20 })
// Response: { current_page, data: Array<Product>, total_pages, ... }

// Get specific product
await printify.products.getOne(productId)
// Response: Product

// Create product
await printify.products.create({
  title: 'My Product',
  description: 'Description',
  blueprint_id: 3,
  print_provider_id: 1,
  variants: [...],
  print_areas: [...]
})
// Response: Product

// Publish product
await printify.products.publishOne(productId)
// Response: { id, published_at, ... }

// Unpublish product
await printify.products.unpublishOne(productId)
// Response: { id, published_at: null, ... }
```

### Orders

```typescript
// List orders with optional filters
await printify.orders.list()
await printify.orders.list({ limit: 10, status: 'fulfilled' })
// Response: { current_page, data: Array<Order>, ... }

// Get specific order
await printify.orders.getOne(orderId)
// Response: Order

// Create order
await printify.orders.create({
  line_items: [...],
  shipping_method: 1,
  send_shipping_notification: false,
  address_to: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    country: 'US',
    ...
  }
})
// Response: Order
```

### Uploads

```typescript
// List uploaded files
await printify.uploads.list()
// Response: Array<Upload>

// Upload file
await printify.uploads.create({
  file_name: 'image.png',
  file_url: 'https://example.com/image.png'
})
// Response: Upload
```

### Webhooks

```typescript
// List webhooks
await printify.webhooks.list()
// Response: Array<Webhook>

// Create webhook
await printify.webhooks.create({
  topic: 'order:created',
  url: 'https://yourapp.com/api/webhooks/order-created'
})
// Response: Webhook

// Update webhook
await printify.webhooks.update(webhookId, {
  url: 'https://yourapp.com/new-url',
  topic: 'order:updated'
})
// Response: Webhook

// Delete webhook
await printify.webhooks.delete(webhookId)
// Response: null (204 No Content)
```

---

## TypeScript Types

### Product

```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  visible: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  options: Option[];
  variants: Variant[];
  images: Image[];
  print_areas: PrintArea[];
  blueprint_id: number;
  print_provider_id: number;
  user_id: number;
  shop_id: number;
}

interface Variant {
  id: number;
  sku: string;
  title: string;
  price: number; // in cents
  cost: number; // in cents
  grams: number;
  is_enabled: boolean;
  is_default: boolean;
  is_available: boolean;
  options: number[];
}

interface Option {
  name: string;
  type: 'size' | 'color' | string;
  values: Array<{ id: number; title: string }>;
}

interface Image {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
}

interface PrintArea {
  variant_ids: number[];
  placeholders: Placeholder[];
  background?: string;
}

interface Placeholder {
  position: string;
  images: PrintImage[];
}

interface PrintImage {
  id: string;
  name: string;
  x: number;
  y: number;
  scale: number;
  angle: number;
}
```

### Order

```typescript
interface Order {
  id: string;
  status: 'draft' | 'pending' | 'confirmed' | 'failed' | 'fulfilled' | 'canceled';
  total_price: number; // in cents
  line_items: LineItem[];
  shipping_method: number;
  shipping_tracking_url: string | null;
  shipping_tracking_company: string | null;
  address_to: Address;
  created_at: string;
  updated_at: string;
}

interface LineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
  print_areas?: PrintAreaData[];
  custom_note?: string;
}

interface Address {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  state?: string;
  city: string;
  zip: string;
  address1: string;
  address2?: string;
}
```

### Webhook

```typescript
interface Webhook {
  id: string;
  topic: string;
  url: string;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

interface WebhookPayload {
  topic: string;
  shop_id: string;
  timestamp: string;
  data: OrderData | Record<string, unknown>;
}
```

---

## Error Handling

### Error Response Examples

```typescript
// 400 Bad Request
{
  "error": "Invalid product data",
  "details": {
    "title": ["required"],
    "blueprint_id": ["invalid"]
  }
}

// 401 Unauthorized
{
  "error": "API token is invalid or expired"
}

// 404 Not Found
{
  "error": "Product not found"
}

// 422 Unprocessable Entity
{
  "error": "Unable to process request",
  "message": "Product is locked and cannot be edited"
}

// 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "trace_id": "abc123def456"
}
```

### Error Handling in Routes

```typescript
import { NextResponse } from 'next/server';
import { printify } from '@/lib/printify';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await printify.products.getOne(id);
    return NextResponse.json(product);
  } catch (error) {
    // SDK throws errors with statusCode property
    if (error instanceof Error && 'statusCode' in error) {
      const statusError = error as Error & { statusCode: number; body?: unknown };
      return NextResponse.json(
        { error: error.message, details: statusError.body },
        { status: statusError.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
```

---

## Pagination

### Products Listing

```typescript
// Default: page 1, limit 10
const page1 = await printify.products.list();

// Specify page
const page2 = await printify.products.list({ page: 2 });

// Specify limit (max 100)
const limited = await printify.products.list({ limit: 50 });

// Combine
const result = await printify.products.list({ page: 3, limit: 25 });

// Response structure
{
  current_page: 1,
  data: [...],
  first_page_url: '/?page=1',
  from: 1,
  last_page: 5,
  last_page_url: '/?page=5',
  next_page_url: '/?page=2',
  path: '/',
  per_page: 10,
  prev_page_url: null,
  to: 10,
  total: 50
}
```

### Orders Listing

```typescript
// With filters
const orders = await printify.orders.list({
  limit: 20,
  page: 1,
  status: 'fulfilled' // or 'pending', 'confirmed', 'failed', 'canceled'
});
```

---

## Webhook Events

### Webhook Topics

```typescript
type WebhookTopic =
  | 'order:created'
  | 'order:updated'
  | 'order:fulfilled'
  | 'order:canceled'
  | 'order:shipped'
  | 'product:created'
  | 'product:updated'
  | 'product:deleted';
```

### Example Webhook Handler

```typescript
// src/app/api/webhooks/order-created/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Verify webhook (check signature if needed)
    const { topic, shop_id, data } = payload;
    
    if (topic === 'order:created') {
      const order = data;
      console.log(`Order created: ${order.id}`, {
        status: order.status,
        total: order.total_price,
        customer: order.address_to
      });
      
      // Process order
      // - Send notification
      // - Update database
      // - Trigger fulfillment
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

### Webhook Payload Example

```json
{
  "topic": "order:created",
  "shop_id": "25274428",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "5a9",
    "status": "pending",
    "total_price": 2500,
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
      "phone": "+1234567890",
      "country": "US",
      "state": "CA",
      "city": "Los Angeles",
      "zip": "90001",
      "address1": "123 Main St"
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## Testing Endpoints

### Using cURL

```bash
# Get all shops
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.printify.com/v1/shops.json

# Get product
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.printify.com/v1/shops/25274428/products/6926f5169d09cfbad803ed1e.json

# Create order
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "line_items": [{"product_id": "123", "variant_id": 456, "quantity": 1}],
    "shipping_method": 1,
    "address_to": {...}
  }' \
  https://api.printify.com/v1/shops/25274428/orders.json
```

### Using Node.js (with SDK)

```typescript
import { printify } from '@/lib/printify';

// Test connection
const shops = await printify.shops.list();
console.log('Shops:', shops);

// Test product retrieval
const product = await printify.products.getOne('6926f5169d09cfbad803ed1e');
console.log('Product:', product.title);

// Test order creation
const order = await printify.orders.create({
  line_items: [
    { product_id: product.id, variant_id: product.variants[0].id, quantity: 1 }
  ],
  shipping_method: 1,
  address_to: {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    country: 'US',
    city: 'New York',
    zip: '10001',
    address1: '123 Main St'
  }
});
console.log('Order created:', order.id);
```

### Using Postman

1. Create environment with variables:
   - `token`: Your PRINTIFY_API_TOKEN
   - `shopId`: Your PRINTIFY_SHOP_ID
   - `baseUrl`: https://api.printify.com/v1

2. Create request:
   ```
   GET {{baseUrl}}/shops/{{shopId}}/products.json
   Headers:
     Authorization: Bearer {{token}}
     Content-Type: application/json
   ```

3. Or use your Next.js API routes:
   ```
   GET http://localhost:3000/api/products
   ```

---

## Common Issues

### "shopId is required" Error

The SDK requires shopId in configuration. Make sure `PRINTIFY_SHOP_ID` is set in `.env.local`:

```env
PRINTIFY_SHOP_ID=25274428
```

### 422 Unprocessable Entity

Usually means invalid data in request body. Check:
- Required fields are present
- Data types are correct (e.g., price in cents, not dollars)
- References exist (product_id, variant_id, etc.)

### Rate Limiting (429)

Printify API has rate limits. Implement exponential backoff:

```typescript
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.statusCode === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```
