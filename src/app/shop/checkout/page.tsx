'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShippingCalculator } from '@/components/ShippingCalculator';
import { useCart } from '../cart-context';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [selectedShipping, setSelectedShipping] = useState<{ method: string; cost: number } | null>(null);
  const [destination, setDestination] = useState('US');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = selectedShipping?.cost || 0;
  const tax = (subtotal + shippingCost) * 0.1; // 10% tax
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!selectedShipping) {
      alert('Please select a shipping method');
      return;
    }

    setLoading(true);
    try {
      // Simulate order creation
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_items: cart,
          shipping_method: selectedShipping.method,
          address_to: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            address1: formData.address,
            city: formData.city,
            region: formData.state,
            zip: formData.zip,
            country: destination,
          },
        }),
      });

      if (response.ok) {
        alert('Order placed successfully!');
        // Redirect to orders page
        window.location.href = '/shop/orders';
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto text-center">
            <p className="text-slate-700 font-medium mb-4">Your cart is empty</p>
            <Link href="/shop/catalog">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/shop/cart" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription>Where should we send your order?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                  <Input
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                  <Input
                    placeholder="ZIP"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Method</CardTitle>
                <CardDescription>Select a shipping option</CardDescription>
              </CardHeader>
              <CardContent>
                <ShippingCalculator
                  productId="checkout"
                  quantity={cart.reduce((sum, item) => sum + item.quantity, 0)}
                  onMethodSelect={(method, cost) => {
                    setSelectedShipping({ method, cost });
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-2 pb-4 border-b border-slate-200">
                    {cart.map((item) => (
                       <div key={`${item.id}-${item.variantId}`} className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {item.title} x {item.quantity}
                        </span>
                        <span className="font-medium text-slate-900">
                          ${(item.price * item.quantity / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="text-slate-900">${(subtotal / 100).toFixed(2)}</span>
                    </div>
                    {selectedShipping && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Shipping ({selectedShipping.method})</span>
                        <span className="text-slate-900">${selectedShipping.cost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tax (10%)</span>
                      <span className="text-slate-900">${(tax / 100).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span className="text-slate-900">Total</span>
                      <span className="text-slate-900">${(total / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!selectedShipping || loading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                    <Link href="/shop/cart" className="block">
                      <Button variant="outline" className="w-full">
                        Return to Cart
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
