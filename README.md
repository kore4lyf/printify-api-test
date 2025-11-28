# Campaign Contributions with Printify Integration

A Next.js application that demonstrates campaign contributions with Printify API integration. Users can support campaigns and receive exclusive merchandise through automated Printify order creation.

## Features

- **Campaign Page**: Single campaign with join button and contribution options
- **Contribution Options**: 3 contribution levels (basic, supporter, premium with merchandise)
- **Printify Integration**: Premium contributions automatically create orders on your Printify shop
- **Responsive Design**: Built with Next.js, Tailwind CSS, and shadcn/ui components
- **API Testing Page**: Dedicated page to test Printify API connectivity and find your product ID

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   Copy `.env.local` and add your Printify credentials:

   ```env
   PRINTIFY_API_KEY=your_printify_api_key_here
   NEXT_PUBLIC_PRINTIFY_SHOP_ID=your_printify_shop_id_here
   ```

   Get your API key from: https://printify.com/app/account
   Get your shop ID from: https://printify.com/app/shops

3. **Products Load Automatically**

   The app now automatically fetches your first product from Printify as the merchandise reward. No manual configuration needed!

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Campaign Flow
1. Users browse campaigns on the homepage
2. Click "Join Campaign" to view contribution options
3. Choose a contribution level:
   - **Basic/Supporter**: Simple contribution acknowledgment
   - **Premium (with merchandise)**: Triggers Printify order creation

### Printify Integration
- When a user selects a merchandise contribution, the app collects shipping information
- A Printify order is automatically created using the configured product
- The order includes shipping cost calculation and proper address formatting
- Users receive confirmation and Printify handles fulfillment

## API Testing

Visit `/printify-test` to:
- View all products from your Printify shop
- Test API connectivity
- Debug configuration issues

## Project Structure

```
src/
├── app/
│   ├── campaign/[id]/     # Dynamic campaign pages
│   ├── printify-test/     # API testing page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   ├── ui/                # shadcn/ui components
│   └── contribution-dialog.tsx  # Contribution modal
└── lib/
    ├── data.ts            # Campaign and contribution data
    ├── printify.ts        # Printify API integration
    └── utils.ts           # Utility functions
```

## Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Printify API** - E-commerce integration
- **Radix UI** - Accessible component primitives

## Development Notes

- The app uses mock campaign data but real Printify API integration
- Error handling is implemented for API failures
- The contribution flow simulates payment processing (you'd integrate with Stripe/PayPal in production)
- All merchandise contributions trigger actual Printify orders

## Production Deployment

1. Set up environment variables in your hosting platform
2. Ensure Printify API keys are properly configured
3. Add payment processing integration
4. Configure proper error monitoring
5. Set up webhooks for order status updates from Printify

## License

This project is for demonstration purposes. Modify and use as needed for your own campaigns.
