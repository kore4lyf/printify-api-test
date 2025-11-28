# Printify API - Complete Endpoint Reference

## Setup

**Base URL:** `https://api.printify.com/v1`

**Headers (All Requests):**
```javascript
{
  'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
  'Content-Type': 'application/json',
  'User-Agent': 'Your-App-Name/1.0'
}
```

**Environment Variables:**
```
PRINTIFY_API_TOKEN=your_personal_access_token (from https://printify.com/app/account/api)
PRINTIFY_SHOP_ID=your_shop_id (found via GET /shops.json)
```

---

## Shops Endpoints

### List All Shops
```
GET /shops.json
Parameters: None
Response: Array of shops with id, title, currency, etc.
Example: GET https://api.printify.com/v1/shops.json
```

---

## Catalog Endpoints

### Get All Blueprints (V1)
```
GET /catalog/blueprints.json
Parameters: None
Response: Array of blueprint objects with id, title, description, etc.
Example: GET https://api.printify.com/v1/catalog/blueprints.json
```

### Get All Blueprints (V2)
```
GET /catalog/v2/blueprints
Parameters: None
Response: Array of blueprints with updated schema
Example: GET https://api.printify.com/v1/catalog/v2/blueprints
```

### Get Print Providers
```
GET /catalog/print_providers.json
Parameters: None
Response: Array of providers (Printful, Teespring, etc.) with capabilities
Example: GET https://api.printify.com/v1/catalog/print_providers.json
```

---

## Products Endpoints

### List Products
```
GET /shops/{SHOP_ID}/products.json
Parameters: ?page=1&limit=20 (optional)
Variables: SHOP_ID = your shop ID
Response: { current_page, total_pages, data: [products array] }
Example: GET https://api.printify.com/v1/shops/123456/products.json?page=1
```

### Get Single Product
```
GET /shops/{SHOP_ID}/products/{PRODUCT_ID}.json
Variables: SHOP_ID, PRODUCT_ID
Response: Product object with id, title, description, variants, images, options, etc.
Example: GET https://api.printify.com/v1/shops/123456/products/6926f5169d09cfbad803ed1e.json

Response Fields:
{
  "id": "6926f5169d09cfbad803ed1e",
  "title": "Product Name",
  "description": "Product description",
  "tags": ["tag1", "tag2"],
  "options": [
    {
      "name": "Size",
      "type": "size",
      "values": [
        { "id": 1189, "title": "Small" },
        { "id": 1190, "title": "Medium" }
      ]
    }
  ],
  "variants": [
    {
      "id": 33719,
      "sku": "SKU-001",
      "title": "Small",
      "price": 2000 (in cents = $20.00),
      "cost": 1000,
      "is_enabled": true,
      "is_default": true,
      "options": [1189]
    }
  ],
  "images": [
    {
      "src": "https://images.printify.com/...",
      "variant_ids": [33719],
      "position": "front",
      "is_default": true
    }
  ],
  "visible": true,
  "published_at": "2024-01-15T10:30:00Z"
}
```

### Get Single Product (Old Method)
```
GET /shops/{SHOP_ID}/products/{PRODUCT_ID}.json
Variables: SHOP_ID, PRODUCT_ID
Response: Single product object with variants, images, etc.
Example: GET https://api.printify.com/v1/shops/123456/products/987.json
```

### Create Product
```
POST /shops/{SHOP_ID}/products.json
Variables: SHOP_ID
Body:
{
  "title": "Product Name",
  "description": "Description",
  "tags": ["tag1", "tag2"],
  "variants": [
    {
      "id": 1,
      "sku": "SKU-001",
      "title": "Small - Red",
      "price": 2000 (in cents),
      "cost": 1000,
      "quantity": 10
    }
  ],
  "images": [
    {
      "src": "https://example.com/image.jpg",
      "is_default": true
    }
  ]
}
Response: Created product object with id
Example: POST https://api.printify.com/v1/shops/123456/products.json
```

### Publish Product
```
POST /shops/{SHOP_ID}/products/{PRODUCT_ID}/publish.json
Variables: SHOP_ID, PRODUCT_ID
Body: {} (empty)
Response: { id, published_at, ... }
Example: POST https://api.printify.com/v1/shops/123456/products/987/publish.json
```

### Unpublish Product
```
POST /shops/{SHOP_ID}/products/{PRODUCT_ID}/unpublish.json
Variables: SHOP_ID, PRODUCT_ID
Body: {} (empty)
Response: { id, published_at: null, ... }
Example: POST https://api.printify.com/v1/shops/123456/products/987/unpublish.json
```

### Get Product GPSR (Regulations)
```
GET /shops/{SHOP_ID}/products/{PRODUCT_ID}/gpsr.json
Variables: SHOP_ID, PRODUCT_ID
Response: { regulations: [...] }
Example: GET https://api.printify.com/v1/shops/123456/products/987/gpsr.json
```

---

## Orders Endpoints

### List Orders
```
GET /shops/{SHOP_ID}/orders.json
Parameters: ?page=1&limit=20&status=fulfilled (optional)
Variables: SHOP_ID
Response: { current_page, total_pages, data: [orders array] }
Example: GET https://api.printify.com/v1/shops/123456/orders.json?status=fulfilled
```

### Get Single Order
```
GET /shops/{SHOP_ID}/orders/{ORDER_ID}.json
Variables: SHOP_ID, ORDER_ID
Response: Single order object with line_items, shipping, costs, etc.
Example: GET https://api.printify.com/v1/shops/123456/orders/5a9.json
```

### Create Order
```
POST /shops/{SHOP_ID}/orders.json
Variables: SHOP_ID
Body:
{
  "line_items": [
    {
      "product_id": 123,
      "variant_id": 456,
      "quantity": 1
    }
  ],
  "shipping_method": 1,
  "send_shipping_notification": false,
  "address_to": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "country": "US",
    "state": "CA",
    "city": "Los Angeles",
    "zip": "90001",
    "address1": "123 Main St",
    "address2": "Apt 4"
  }
}
Response: Created order object with id, total_price, etc.
Example: POST https://api.printify.com/v1/shops/123456/orders.json
```

---

## Uploads Endpoints

### List Uploads
```
GET /uploads.json
Parameters: None
Response: Array of upload objects with id, file_name, preview_url, etc.
Example: GET https://api.printify.com/v1/uploads.json
```

### Upload File
```
POST /uploads.json
Body:
{
  "file_name": "my-image.png",
  "file_url": "https://example.com/my-image.png",
  "type": "image/png"
}
Response: { id, file_name, preview_url, ... }
Example: POST https://api.printify.com/v1/uploads.json
```

---

## Webhooks Endpoints

### List Webhooks
```
GET /shops/{SHOP_ID}/webhooks.json
Variables: SHOP_ID
Response: Array of webhook objects with id, topic, url, etc.
Example: GET https://api.printify.com/v1/shops/123456/webhooks.json
```

### Create Webhook
```
POST /shops/{SHOP_ID}/webhooks.json
Variables: SHOP_ID
Body:
{
  "topic": "order:created",
  "url": "https://yourapp.com/api/webhooks/order-created"
}
Topics: order:created, order:updated, order:fulfilled, order:canceled, order:shipped, etc.
Response: { id, topic, url, shop_id, ... }
Example: POST https://api.printify.com/v1/shops/123456/webhooks.json
```

### Update Webhook
```
PUT /shops/{SHOP_ID}/webhooks/{WEBHOOK_ID}.json
Variables: SHOP_ID, WEBHOOK_ID
Body:
{
  "url": "https://yourapp.com/api/webhooks/new-url",
  "topic": "order:updated"
}
Response: Updated webhook object
Example: PUT https://api.printify.com/v1/shops/123456/webhooks/5cb87a8cd490a2ccb256cec4.json
```

### Delete Webhook
```
DELETE /shops/{SHOP_ID}/webhooks/{WEBHOOK_ID}.json
Variables: SHOP_ID, WEBHOOK_ID
Response: 204 No Content
Example: DELETE https://api.printify.com/v1/shops/123456/webhooks/5cb87a8cd490a2ccb256cec4.json
```

---

## Common Variables Reference

| Variable | Description | Where to Get |
|----------|-------------|-------------|
| `PRINTIFY_API_TOKEN` | Personal Access Token | https://printify.com/app/account/api |
| `SHOP_ID` | Your shop ID | GET /shops.json response |
| `PRODUCT_ID` | Product identifier | GET /shops/{SHOP_ID}/products.json response |
| `ORDER_ID` | Order identifier | GET /shops/{SHOP_ID}/orders.json response |
| `WEBHOOK_ID` | Webhook identifier | GET /shops/{SHOP_ID}/webhooks.json response |
| `VARIANT_ID` | Variant of a product | GET /shops/{SHOP_ID}/products/{PRODUCT_ID}.json response |

---

## Status Codes

```
200 OK - Success
201 Created - Resource created
204 No Content - Success, no response body
400 Bad Request - Invalid parameters
401 Unauthorized - Missing/invalid token
403 Forbidden - No permission
404 Not Found - Resource doesn't exist
429 Too Many Requests - Rate limited
500 Internal Server Error - Server error
```

---

## Example: Complete Fetch Function

```javascript
async function printifyFetch(endpoint, method = 'GET', body = null) {
  const url = `https://api.printify.com/v1${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Your-App/1.0',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[${response.status}] ${error}`);
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

// Usage
const shops = await printifyFetch('/shops.json');
const newProduct = await printifyFetch(
  `/shops/${SHOP_ID}/products.json`,
  'POST',
  { title: 'Product', ... }
);
```

---

## Example: Fetch a Particular Product

```javascript
const SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRODUCT_ID = '6926f5169d09cfbad803ed1e'; // ID from product listing

async function getProduct(productId) {
  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${SHOP_ID}/products/${productId}.json`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    throw error;
  }
}

// Call it
const product = await getProduct(PRODUCT_ID);

// Access product data
console.log('Title:', product.title);
console.log('Description:', product.description);
console.log('Price:', product.variants[0].price); // in cents
console.log('Images:', product.images);
console.log('Options:', product.options); // for selecting size, color, etc.
```

---

## Quick Start Example

```javascript
const SHOP_ID = process.env.PRINTIFY_SHOP_ID;

// 1. List shops to get ID
const shops = await printifyFetch('/shops.json');
const myShopId = shops[0].id;

// 2. Create a product
const product = await printifyFetch(
  `/shops/${myShopId}/products.json`,
  'POST',
  {
    title: 'My T-Shirt',
    description: 'Cool shirt',
    variants: [{ id: 1, title: 'Medium', price: 2000 }],
    images: [{ src: 'https://example.com/image.jpg' }]
  }
);

// 3. Publish it
await printifyFetch(
  `/shops/${myShopId}/products/${product.id}/publish.json`,
  'POST'
);

// 4. Create order
const order = await printifyFetch(
  `/shops/${myShopId}/orders.json`,
  'POST',
  {
    line_items: [{ product_id: product.id, variant_id: 1, quantity: 1 }],
    shipping_method: 1,
    address_to: { ... }
  }
);
```
