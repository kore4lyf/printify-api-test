# Printify Integration Guide

This project integrates with Printify to handle merchandise orders. The integration includes several API endpoints and utility functions to manage the full order lifecycle.

## Available API Endpoints

### Orders
- `POST /api/orders` - Submit a new order to Printify
- `GET /api/orders` - List all orders from Printify
- `GET /api/printify/orders/[id]` - Get details of a specific order
- `POST /api/printify/orders/cancel` - Cancel an unpaid order

### Shipping
- `POST /api/printify/shipping/calculate` - Calculate shipping costs using Printify API

## Utility Functions

The `src/lib/printify-utils/index.ts` file contains helper functions for common Printify operations:

- `calculateShippingCosts()` - Calculate shipping costs
- `submitOrder()` - Submit an order to Printify
- `cancelOrder()` - Cancel an unpaid order
- `getOrderDetails()` - Get details of a specific order
- `listOrders()` - List all orders

## React Hooks

The `src/lib/printify-utils/hooks.ts` file contains React hooks for integrating Printify functionality:

- `usePrintifyShipping()` - Hook for calculating shipping costs
- `usePrintifyOrder()` - Hook for managing order submissions

## Testing

For testing purposes, you can use Printify's sandbox environment or mock the API calls to avoid creating actual orders.

## Error Handling

All API calls include proper error handling with detailed error messages to help with debugging.