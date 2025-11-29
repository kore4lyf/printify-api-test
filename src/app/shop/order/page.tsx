'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '../cart-context';
import { Loader2 } from 'lucide-react';
import { usePrintifyOrder, usePrintifyShipping } from '@/lib/printify-utils/hooks';

export default function OrderPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const { submitOrder, isSubmitting } = usePrintifyOrder();
  const { calculateShipping, isCalculating } = usePrintifyShipping();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    region: '',
    zip: '',
    country: 'US'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.first_name.trim()) errors.first_name = 'First name is required';
    if (!form.last_name.trim()) errors.last_name = 'Last name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email is invalid';
    if (!form.phone.trim()) errors.phone = 'Phone is required';
    if (!form.address1.trim()) errors.address1 = 'Address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.region.trim()) errors.region = 'State/Region is required';
    if (!form.zip.trim()) errors.zip = 'ZIP/Postal code is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // Validate all cart items have product IDs
      const itemsWithoutProductId = cart.filter(item => !item.productId);
      if (itemsWithoutProductId.length > 0) {
        setError('Some items in your cart are missing product information. Please clear your cart and re-add items.');
        return;
      }

      // Calculate shipping first
      const shippingLineItems = cart.map((item) => ({
        product_id: item.productId as string,
        variant_id: item.variantId,
        quantity: item.quantity,
      }));

      const addressTo = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || '',
        country: form.country,
        region: form.region,
        address1: form.address1,
        address2: form.address2 || '',
        city: form.city,
        zip: form.zip,
      };

      const shippingResponse = await calculateShipping(shippingLineItems, addressTo);

      if (!shippingResponse.success) {
        setError(shippingResponse.error || 'Failed to calculate shipping');
        return;
      }

      // Submit order
      const orderResponse = await submitOrder({
        line_items: shippingLineItems,
        shipping_method: 1,
        address_to: addressTo,
      });

      if (!orderResponse.success) {
        setError(orderResponse.error || 'Failed to create order');
        return;
      }

      const order = orderResponse.data;
      if (order && order.id) {
        setResult(order);
        clearCart();
        setTimeout(() => {
          router.push(`/shop/order/${order.id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (cart.length === 0) return <div className="text-center py-8">Cart is empty. <Link href="/shop/catalog"><Button>Shop Now</Button></Link></div>;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
  <div className="min-h-screen bg-gray-50">
  <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                   <div key={`${item.id}-${item.variantId}`} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity / 100).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total:</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <Card>
        <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
          <CardDescription>Please provide your shipping details to complete the order.</CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
        <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input
            id="first_name"
            value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className={formErrors.first_name ? 'border-red-500' : ''}
          />
          {formErrors.first_name && <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>}
          </div>
          <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
              id="last_name"
              value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className={formErrors.last_name ? 'border-red-500' : ''}
              />
                  {formErrors.last_name && <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={formErrors.phone ? 'border-red-500' : ''}
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="address1">Street Address *</Label>
                <Input
                  id="address1"
                  value={form.address1}
                  onChange={(e) => setForm({ ...form, address1: e.target.value })}
                  placeholder="123 Main Street"
                  className={formErrors.address1 ? 'border-red-500' : ''}
                />
                {formErrors.address1 && <p className="text-red-500 text-sm mt-1">{formErrors.address1}</p>}
              </div>

              <div>
                <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                <Input
                  id="address2"
                  value={form.address2}
                  onChange={(e) => setForm({ ...form, address2: e.target.value })}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={formErrors.city ? 'border-red-500' : ''}
                  />
                  {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="region">State/Region *</Label>
                  <Input
                    id="region"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="NY"
                    className={formErrors.region ? 'border-red-500' : ''}
                  />
                  {formErrors.region && <p className="text-red-500 text-sm mt-1">{formErrors.region}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    placeholder="10001"
                    className={formErrors.zip ? 'border-red-500' : ''}
                  />
                  {formErrors.zip && <p className="text-red-500 text-sm mt-1">{formErrors.zip}</p>}
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="US"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting || isCalculating} className="w-full h-12">
                 {isSubmitting || isCalculating ? <Loader2 className="animate-spin mr-2" /> : 'Complete Order'}
               </Button>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
            )}
            {result && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-green-800 font-semibold">Order Submitted Successfully!</h3>
                    <p className="text-green-700">Order ID: {result.id}</p>
                    </div>
                    )}
                    </CardContent>
        </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
