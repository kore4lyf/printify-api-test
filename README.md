# Printify Campaign Merchandise Order Integration Testing

A comprehensive Next.js application designed to test the complete integration and flow of merchandise orders within a campaign management system using the Printify API.

## 🎯 Project Purpose

This project provides a complete testing environment for:
- Campaign creation and management
- Merchandise order workflows from campaign to fulfillment
- Printify API integration and connectivity
- Order tracking and status management
- Shipping calculation and provider integration
- Product catalog and print provider management

## ✨ Key Features

### Campaign Management
- **Campaign Pages**: Create and manage fundraising campaigns with merchandise rewards
- **Contribution Tiers**: Multi-level contribution options with different merchandise rewards
- **Merchandise Included**: Premium tiers automatically trigger Printify order creation

### Order Integration
- **Complete Order Flow**: From campaign selection → shipping details → order creation → fulfillment
- **Printify API Integration**: Direct connection to Printify's production API
- **Shipping Calculation**: Real-time shipping cost calculation based on destination
- **Order Tracking**: View order status and tracking information

### API Testing & Debugging
- **Printify API Explorer** (`/printify-api`): Interactive UI to test all Printify endpoints
- **Blueprint Catalog**: Browse available products and print providers
- **Product Management**: Create, publish, and unpublish products
- **Provider Network**: View available print providers and locations
- **Webhook Management**: Test and manage order webhooks
- **GPSR Compliance**: Access product safety information

### Shop Management
- **Product Catalog**: Manage products with variants and pricing
- **Bulk Operations**: Perform operations on multiple products
- **SKU Management**: Update product SKUs and identifiers
- **Pricing Management**: Adjust variant pricing
- **Upload Management**: Handle image uploads for product mockups
- **Mockup Generation**: Generate product mockups

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Printify account with API access

### Installation

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create `.env.local`:
   ```env
   PRINTIFY_API_KEY=your_printify_api_key
   NEXT_PUBLIC_PRINTIFY_SHOP_ID=your_shop_id
   ```

   Get credentials from:
   - API Key: https://printify.com/app/account
   - Shop ID: https://printify.com/app/shops

3. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📋 Testing Workflows

### 1. Campaign Order Flow
**Path:** `/campaign/[id]` → Select contribution → Confirm → Create order

1. Visit home page
2. Click campaign card
3. Select a contribution tier with merchandise
4. Fill in shipping details
5. Confirm order creation
6. Order automatically created in Printify

### 2. Product Management Testing
**Path:** `/shop/products`

- View all products in your shop
- Test product creation with blueprints
- Publish/unpublish products
- Manage pricing and SKUs
- View product variants

### 3. Shipping Testing
**Path:** `/api/shipping/express` or `/shop/checkout`

- Calculate shipping for different destinations
- Test express shipping eligibility
- Compare shipping methods
- Validate address handling

### 4. API Integration Testing
**Path:** `/printify-api`

Interactive dashboard to test:

**Read Operations:**
- Merchant Shops
- Catalog Blueprints (with enhanced V2 data)
- Print Providers (with full location details)
- Shop Products
- Shop Orders
- Uploaded Files
- Webhooks
- GPSR Compliance Data

**Write Operations:**
- Create Products
- Create Orders
- Create Webhooks
- Publish Products
- Unpublish Products
- Update Webhooks
- Delete Products

**Special Features:**
- Fetch specific products by ID
- Bulk operations on multiple products
- Catalog V2 with shipping endpoints
- Real-time product updates

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── blueprints/           # Catalog blueprints endpoints
│   │   ├── blueprints-v2/        # V2 catalog with shipping
│   │   ├── gpsr/                 # GPSR compliance data
│   │   ├── merchandise/          # Product management
│   │   ├── mockups/              # Mockup generation
│   │   ├── orders/               # Order management
│   │   ├── products/             # Product endpoints
│   │   ├── providers/            # Print provider listing
│   │   ├── shipping/             # Shipping calculation
│   │   ├── uploads/              # File uploads
│   │   └── webhooks/             # Webhook management
│   ├── campaign/[id]/            # Campaign detail pages
│   ├── shop/
│   │   ├── product/[id]/         # Product detail
│   │   ├── products/             # Products listing
│   │   ├── bulk-operations/      # Bulk product operations
│   │   ├── upload/               # Image upload interface
│   │   ├── checkout/             # Order checkout
│   │   └── cart/                 # Shopping cart
│   ├── printify-api/             # API testing dashboard
│   └── page.tsx                  # Homepage
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── contribution-dialog.tsx   # Contribution flow modal
│   ├── BulkOperationManager.tsx  # Bulk operations interface
│   ├── ExpressShippingInfo.tsx   # Shipping information
│   ├── ExpressShippingToggle.tsx # Toggle express shipping
│   ├── GpsrComplianceForm.tsx    # GPSR compliance form
│   └── MockupGenerator.tsx       # Product mockup generator
├── lib/
│   ├── printify.ts               # Printify SDK initialization
│   ├── printify-utils/           # API utility functions
│   ├── data.ts                   # Campaign and contribution data
│   └── cart-context.tsx          # Shopping cart context
└── public/                       # Static assets
```

## 🔧 API Endpoints

### Campaign & Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get specific order

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `POST /api/products/[id]/publish` - Publish product
- `POST /api/products/[id]/unpublish` - Unpublish product

### Catalogs & Providers
- `GET /api/blueprints` - Get catalog blueprints
- `GET /api/blueprints-v2/shipping` - Get shipping options
- `GET /api/providers` - List print providers

### Shipping
- `GET /api/shipping/express` - Express shipping info
- `POST /api/shipping/quote` - Calculate shipping

### File Management
- `GET /api/uploads` - List uploaded files
- `POST /api/uploads` - Upload new file

### Webhooks
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `PUT /api/webhooks/[id]` - Update webhook
- `DELETE /api/webhooks/[id]` - Delete webhook

## 🧪 Testing Tips

### Finding Valid Product IDs
1. Go to `/printify-api`
2. Click "Fetch Data" on "Shop Products"
3. Copy product ID from the results
4. Use in publish/unpublish tests

### Testing Orders
1. Fetch shop products to get valid IDs
2. Use "Create Order" form with:
   - Valid product ID
   - Variant ID from product
   - Shipping address with all required fields
   - Test cards: Use Printify test credit card numbers

### Testing Shipping
1. Go to `/shop/checkout`
2. Add products to cart
3. Enter different addresses
4. View calculated shipping costs

### Using the API Dashboard
- Start with "Fetch Data" on read operations
- Test single operations before bulk operations
- Use sample data provided in create forms
- Check "Catalog V2" for available endpoints

## 📊 Data Types

### Campaign
```typescript
interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  contributionOptions: ContributionOption[];
}
```

### ContributionOption
```typescript
interface ContributionOption {
  id: string;
  title: string;
  description: string;
  amount: number;
  includesMerch: boolean;
}
```

### Order
```typescript
interface Order {
  line_items: LineItem[];
  shipping_method: number;
  address_to: Address;
}
```

### Blueprint (Product)
```typescript
interface Blueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}
```

## 🛠 Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety and development experience
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Pre-built accessible components
- **Printify SDK** - Official API integration
- **React Context** - State management for cart

## 📝 Common Tasks

### Add a New Campaign
Edit `src/lib/data.ts` and add to campaigns array.

### Test a New Product
1. Create product on Printify dashboard
2. Get blueprint ID
3. Use in "Create Product" form on API page

### Debug API Errors
1. Check environment variables
2. Verify Printify account access
3. Use `/printify-api` to test endpoints
4. Review error messages for API hints

### Test Order Flow
1. Fill cart with products
2. Enter valid shipping address
3. Complete checkout
4. Check Printify dashboard for order

## 🚨 Troubleshooting

### 400 Bad Request Errors
- Use correct ID format (Printify IDs are numeric)
- Don't use MongoDB IDs from your database
- Verify product exists in your shop

### 422 Unprocessable Entity
- Product ID is invalid or doesn't exist
- Check Shop Products first to get valid IDs

### Shipping Calculation Fails
- Ensure all address fields are populated
- Phone number must be provided
- Region/state must be valid for country

### API Key Issues
- Verify `PRINTIFY_API_KEY` in `.env.local`
- Check key hasn't expired on Printify dashboard
- Regenerate key if needed

## 🔐 Security Notes

- Never commit `.env.local` with real API keys
- API keys are server-side only, never exposed to client
- Use environment variables for all secrets
- Set up CORS properly for production

## 📚 Additional Resources

- [Printify API Documentation](https://printify.com/api/docs)
- [Printify Dashboard](https://printify.com/app)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## 📄 License

This project is for testing and demonstration purposes.

## 👤 Support

For Printify-specific issues, contact Printify support.
For application issues, check the troubleshooting section or review the code comments.
