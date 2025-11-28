# Printify API Testing Guide

This guide explains how to test all Printify API endpoints properly, including those that require specific data.

## Available Testing Tools

### 1. Automated Test Scripts

#### Comprehensive Data-Aware Testing
```bash
node test-printify-endpoints-with-data.js
```
This script automatically:
- Tests read endpoints first to get IDs
- Uses those IDs to test specific item endpoints
- Tests V2 endpoints with proper blueprint/provider IDs
- Handles write endpoints with sample data
- Provides detailed output for each test

#### Simple Endpoint Testing
```bash
node test-all-printify-endpoints.js
```
Basic testing of all endpoints (some will fail without proper data)

### 2. Interactive Testing Utility

#### Full Test Suite
```bash
node printify-api-tester.js
```

#### Specific Endpoint Testing
```bash
# Test a specific endpoint
node printify-api-tester.js /api/shops

# Test with specific method
node printify-api-tester.js /api/webhooks POST

# Test with data
node printify-api-tester.js /api/webhooks POST '{"topic":"order:created","url":"https://example.com"}'
```

### 3. CLI Tester

```bash
# Run full test suite
node printify-cli-tester.js

# Test specific endpoint
node printify-cli-tester.js /api/merchandise

# Test with method and data
node printify-cli-tester.js /api/webhooks POST '{"topic":"order:created","url":"https://example.com/webhook"}'
```

## Endpoint Testing Requirements

### Endpoints Requiring Specific Data

| Endpoint | Required Data | How to Get It |
|----------|---------------|---------------|
| `/api/products/[id]` | Product ID | Test read endpoints first or use existing product |
| `/api/products/[id]/unpublish` | Product ID | Same as above |
| `/api/products/[id]/publish` | Product ID | Same as above |
| `/api/orders/[id]` | Order ID | Create order first or use existing order |
| `/api/webhooks/[id]` | Webhook ID | Create webhook first or use existing webhook |
| `/api/gpsr?product_id=[id]` | Product ID | Use existing product ID |
| V2 endpoints | Blueprint ID + Provider ID | Get from blueprints and providers endpoints |

### Testing Strategy

1. **Start with read endpoints** to gather IDs:
   ```bash
   node printify-cli-tester.js /api/merchandise
   node printify-cli-tester.js /api/blueprints
   node printify-cli-tester.js /api/providers
   ```

2. **Use gathered IDs** for specific endpoint testing:
   ```bash
   node printify-cli-tester.js /api/products/PRODUCT_ID
   ```

3. **Test V2 endpoints** with blueprint and provider IDs:
   ```bash
   node printify-cli-tester.js "/api/blueprints-v2/shipping?blueprintId=123&printProviderId=456"
   ```

4. **Test write endpoints** with proper sample data:
   ```bash
   node printify-cli-tester.js /api/webhooks POST '{"topic":"order:created","url":"https://example.com"}'
   ```

## Common Test Scenarios

### Testing Product Lifecycle
1. Create a product
2. Get product details
3. Unpublish product
4. Publish product
5. Get updated product details

### Testing Order Flow
1. Create an order
2. Get order details
3. (Optional) Cancel order if supported

### Testing Webhook Management
1. Create a webhook
2. Get webhook details
3. Update webhook
4. Delete webhook

### Testing V2 Shipping Information
1. Get blueprint IDs
2. Get provider IDs
3. Test various shipping endpoints with the IDs

## Troubleshooting

### Authentication Issues
- Ensure `PRINTIFY_API_TOKEN` and `PRINTIFY_SHOP_ID` are set in `.env.local`
- Verify token has proper scopes for requested operations

### Data Not Found Errors
- Use read endpoints first to gather valid IDs
- Some endpoints require recently created data
- Check that your shop has data for testing

### Rate Limiting
- Add delays between requests if hitting rate limits
- Test during off-peak hours

## Best Practices

1. **Always test read endpoints first** to gather required IDs
2. **Use test data** rather than production data when possible
3. **Clean up after testing** (delete created webhooks, etc.)
4. **Log responses** for debugging failed tests
5. **Test incrementally** rather than running full suite every time