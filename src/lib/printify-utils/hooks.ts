'use client';

import { useState } from 'react';

interface ShippingOption {
  name: string;
  price: number;
  min_delivery_time: number;
  max_delivery_time: number;
}

interface ShippingCalculationResult {
  standard: ShippingOption[];
  express: ShippingOption[];
  priority: ShippingOption[];
  economy: ShippingOption[];
}

export function usePrintifyShipping() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingCalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  /**
   * Calculate shipping costs using Printify API
   */
  const calculateShipping = async (
    lineItems: Array<{
      product_id: string;
      variant_id: number;
      quantity: number;
    }>,
    address: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      country: string;
      region?: string;
      city: string;
      zip: string;
      address1: string;
      address2?: string;
    }
  ) => {
    setIsCalculating(true);
    setCalculationError(null);
    
    try {
      const response = await fetch('/api/printify/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line_items: lineItems,
          address_to: address
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to calculate shipping');
      }

      setShippingOptions(result.shipping_options);
      return { success: true, data: result.shipping_options };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate shipping costs';
      setCalculationError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Reset shipping calculation state
   */
  const resetShippingCalculation = () => {
    setIsCalculating(false);
    setShippingOptions(null);
    setCalculationError(null);
  };

  return {
    // State
    isCalculating,
    shippingOptions,
    calculationError,
    
    // Methods
    calculateShipping,
    resetShippingCalculation
  };
}

export function usePrintifyOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  /**
   * Submit an order to Printify
   */
  const submitOrder = async (orderData: any) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit order');
      }

      setOrderId(result.id);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit order';
      setSubmissionError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancel an order
   */
  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/printify/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel order');
      }

      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Reset order submission state
   */
  const resetOrderSubmission = () => {
    setIsSubmitting(false);
    setSubmissionError(null);
    setOrderId(null);
  };

  return {
    // State
    isSubmitting,
    submissionError,
    orderId,
    
    // Methods
    submitOrder,
    cancelOrder,
    resetOrderSubmission
  };
}