import { printify } from '@/lib/printify';

/**
 * Calculate shipping costs using Printify API
 * @param lineItems - Array of line items with product and variant information
 * @param address - Shipping address information
 * @returns Promise with shipping calculation results
 */
export async function calculateShippingCosts(
  lineItems: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
  }>,
  address: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    region: string;
    city: string;
    zip: string;
    address1: string;
    address2?: string;
  }
) {
  try {
    const shippingResult = await printify.orders.calculateShipping({
      line_items: lineItems,
      address_to: address
    });
    
    return {
      success: true,
      data: shippingResult
    };
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate shipping costs'
    };
  }
}

/**
 * Submit an order to Printify
 * @param orderData - Order information including line items and shipping details
 * @returns Promise with order submission results
 */
export async function submitOrder(orderData: any) {
  try {
    const order = await printify.orders.submit(orderData);
    return {
      success: true,
      data: order
    };
  } catch (error) {
    console.error('Order submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit order'
    };
  }
}

/**
 * Cancel an unpaid order
 * @param orderId - ID of the order to cancel
 * @returns Promise with cancellation results
 */
export async function cancelOrder(orderId: string) {
  try {
    const result = await printify.orders.cancelUnpaid(orderId);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Order cancellation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel order'
    };
  }
}

/**
 * Get order details
 * @param orderId - ID of the order to retrieve
 * @returns Promise with order details
 */
export async function getOrderDetails(orderId: string) {
  try {
    const order = await printify.orders.getOne(orderId);
    return {
      success: true,
      data: order
    };
  } catch (error) {
    console.error('Order fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order details'
    };
  }
}

/**
 * List all orders
 * @returns Promise with list of orders
 */
export async function listOrders() {
  try {
    const orders = await printify.orders.list();
    return {
      success: true,
      data: orders
    };
  } catch (error) {
    console.error('Orders fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    };
  }
}