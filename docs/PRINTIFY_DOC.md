# Printify API Documentation

## Overview
Automate your Print on Demand business with the Printify API. REST API for managing shops, products, and orders.

## Authentication
All requests require:
- `Authorization: Bearer {token}` header (Personal Access Token or OAuth 2.0)
- `User-Agent` header (e.g., "NodeJS", "MyApp")

Base URL: `https://api.printify.com/v1/`

Example:
```bash
curl -X GET https://api.printify.com/v1/shops.json --header "Authorization: Bearer $PRINTIFY_API_TOKEN"
```

## Rate Limits
- **Global**: 600 requests/minute → 429 Too Many Requests
- **Catalog API**: 100 requests/minute (separate limit)
- **Product Publishing**: 200 requests/30 minutes
- **Error Threshold**: Requests resulting in errors must not exceed 5% of total

## Key Resources

### Shops
Retrieve and manage merchant stores.
- `GET /v1/shops.json` - List shops
- `DELETE /v1/shops/{shop_id}/connection.json` - Disconnect shop

### Catalog
Access blueprints (base products), print providers, and variants.
- `GET /v1/catalog/blueprints.json` - List all blueprints
- `GET /v1/catalog/blueprints/{blueprint_id}.json` - Get specific blueprint
- `GET /v1/catalog/blueprints/{blueprint_id}/print_providers.json` - Print providers for blueprint
- `GET /v1/catalog/blueprints/{blueprint_id}/print_providers/{print_provider_id}/variants.json` - Variants
- `GET /v1/catalog/blueprints/{blueprint_id}/print_providers/{print_provider_id}/shipping.json` - Shipping info
- `GET /v1/catalog/print_providers.json` - List all print providers

### Products
Create and manage products in a shop.
- `POST /v1/shops/{shop_id}/products.json` - Create product
- `GET /v1/shops/{shop_id}/products.json` - List products
- `GET /v1/shops/{shop_id}/products/{product_id}.json` - Get product
- `PUT /v1/shops/{shop_id}/products/{product_id}.json` - Update product
- `DELETE /v1/shops/{shop_id}/products/{product_id}.json` - Delete product

### Orders
Create and track orders.
- `POST /v1/shops/{shop_id}/orders.json` - Create order
- `GET /v1/shops/{shop_id}/orders.json` - List orders
- `GET /v1/shops/{shop_id}/orders/{order_id}.json` - Get order details

### Webhooks
Subscribe to events: order:created, order:updated, order:shipment:created, order:shipment:delivered, product:deleted, product:publish:started, shop:disconnected

- `GET /v1/shops/{shop_id}/webhooks.json` - List webhooks
- `POST /v1/shops/{shop_id}/webhooks.json` - Create webhook
- `PUT /v1/shops/{shop_id}/webhooks/{webhook_id}.json` - Modify webhook
- `DELETE /v1/shops/{shop_id}/webhooks/{webhook_id}.json` - Delete webhook

### Webhook Security
1. Set shared secret: `openssl rand -hex 20`
2. Printify sends `X-Pfy-Signature` header with HMAC SHA256 signature: `sha256={digest}`
3. Validate with constant-time comparison:
```python
import hmac
def secure_compare(a, b):
    return hmac.compare_digest(a, b)
```
4. Retry logic: 3 retries on 4xx/5xx, 1-hour block after failure
5. Expect 200 OK response

## Pagination
Responses include:
- `first_page_url`, `prev_page_url`, `next_page_url`, `last_page_url`
- `current_page`, `last_page`, `total`, `per_page`
- `from`, `to`

## Important Notes
- **CORS**: Frontend cannot call API directly; use backend proxy
- **Encoding**: All data is JSON with UTF-8
- **Date/Time**: UTC timezone
- **HTTPS Only**: Insecure HTTP not supported
