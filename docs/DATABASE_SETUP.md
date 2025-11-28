# Database Setup Guide

## Overview

The application uses a file-based database layer for persistent storage of:
- GPSR Compliance data
- Generated Mockups
- Fulfillment Tracking records
- Bulk Operations history

## Data Location

By default, data is stored in `.data/` directory at the project root:
```
.data/
├── gpsr.json
├── mockups.json
├── fulfillment-tracking.json
└── bulk-operations.json
```

## Configuration

### Change Data Directory (Optional)

Set the `DATA_DIR` environment variable:

```bash
export DATA_DIR=/path/to/custom/data/directory
# or in .env.local:
DATA_DIR=/path/to/custom/data/directory
```

## Collections

### GPSR Compliance Data (`gpsr.json`)

Stores EU product safety compliance information.

**Schema:**
```json
{
  "gpsr-product-123": {
    "id": "gpsr-product-123",
    "product_id": "product-123",
    "safety_information": "Contains no known hazards...",
    "manufacturer_details": {
      "name": "Company Name",
      "address": "123 Main St, Berlin, Germany",
      "email": "info@company.com"
    },
    "product_details": {
      "brand": "Brand Name",
      "model": "MODEL-001",
      "warranty": "1 year"
    },
    "warnings": "Not for children under 3 years",
    "care_instructions": "Machine wash cold",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### Generated Mockups (`mockups.json`)

Stores generated product mockup records.

**Schema:**
```json
{
  "mockup-abc123": {
    "id": "mockup-abc123",
    "product_id": "product-123",
    "variant_id": 1,
    "upload_id": "upload-456",
    "position": "front",
    "mockup_url": "https://example.com/mockup.png",
    "thumbnail_url": "https://example.com/mockup-thumb.png",
    "generated_at": "2024-01-15T10:00:00Z",
    "expires_at": "2024-02-15T10:00:00Z"
  }
}
```

### Fulfillment Tracking (`fulfillment-tracking.json`)

Stores order fulfillment status and tracking information.

**Schema:**
```json
{
  "order-123": {
    "id": "order-123",
    "order_id": "order-123",
    "current_status": "shipped",
    "current_step": 6,
    "total_steps": 9,
    "progress_percentage": 66.67,
    "events": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T10:00:00Z",
        "description": "Order received",
        "location": null
      }
    ],
    "estimated_delivery": "2024-01-20T00:00:00Z",
    "carrier": "UPS",
    "tracking_number": "1Z999AA10123456784",
    "last_updated": "2024-01-17T15:00:00Z"
  }
}
```

### Bulk Operations (`bulk-operations.json`)

Stores bulk operation history and results.

**Schema:**
```json
{
  "bulk-op-1234567890-abc123": {
    "id": "bulk-op-1234567890-abc123",
    "operation_id": "bulk-op-1234567890-abc123",
    "operation": "publish",
    "status": "completed",
    "total_items": 10,
    "processed_items": 10,
    "successful_items": 8,
    "failed_items": 2,
    "errors": [
      {
        "product_id": "product-1",
        "error": "Product missing required fields"
      }
    ],
    "started_at": "2024-01-15T10:00:00Z",
    "completed_at": "2024-01-15T10:05:00Z"
  }
}
```

## API Usage

### Create/Update Data

```typescript
import { gpsrData } from '@/lib/db';

// Create
gpsrData.create('gpsr-product-1', {
  product_id: 'product-1',
  safety_information: '...',
  // ...
});
```

### Read Data

```typescript
// Find by ID
const record = gpsrData.findById('gpsr-product-1');

// Find all
const all = gpsrData.findAll();

// Find by query
const results = gpsrData.findByQuery((doc) => 
  doc.product_id === 'product-1'
);
```

### Update Data

```typescript
gpsrData.update('gpsr-product-1', {
  safety_information: 'Updated information',
  updated_at: new Date().toISOString()
});
```

### Delete Data

```typescript
gpsrData.delete('gpsr-product-1');
```

## Migration to Production Database

When ready to move to production, replace the file-based implementation with:

### PostgreSQL Example

```typescript
// Use Prisma ORM
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GPSR data
await prisma.gpsrCompliance.findUnique({
  where: { productId: 'product-1' }
});
```

### MongoDB Example

```typescript
// Use MongoDB client
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('printify');

// GPSR data
const gpsrRecord = await db.collection('gpsr').findOne({
  productId: 'product-1'
});
```

## Backup & Recovery

### Backup Data

```bash
# Backup all data files
cp -r .data .data.backup.$(date +%Y%m%d_%H%M%S)
```

### Restore Data

```bash
# Restore from backup
cp -r .data.backup.20240115_120000/* .data/
```

## Data Persistence

The file-based database automatically persists data when:
- Records are created
- Records are updated
- Records are deleted

No additional configuration is required for persistence.

## Performance Considerations

- File-based storage is suitable for small to medium datasets
- For large datasets or high-traffic applications, migrate to a proper database
- Consider implementing caching layer (Redis) for frequently accessed data
- Implement periodic cleanup of expired mockups (30-day retention)

## Monitoring

### Check Database Health

```bash
# Verify data files exist
ls -lh .data/

# Check file sizes
du -sh .data/*
```

### View Data Files

```bash
# View GPSR data (JSON)
cat .data/gpsr.json | jq .

# View mockups
cat .data/mockups.json | jq '.'
```

## Troubleshooting

### Data Not Persisting

1. Check `.data` directory exists and is writable
2. Verify `DATA_DIR` environment variable (if set)
3. Check file system permissions
4. Review application logs for errors

### Performance Issues

1. Monitor JSON file sizes
2. Implement archival strategy for old records
3. Consider database migration if files exceed 100MB
4. Use pagination for large result sets

## Best Practices

1. **Regular Backups**: Backup `.data` directory daily
2. **Version Control**: Don't commit `.data` directory to Git
3. **Data Validation**: Validate all data before storage
4. **Error Handling**: Implement proper error handling for storage operations
5. **Logging**: Log all database operations for debugging
6. **Testing**: Test data persistence in development environment
