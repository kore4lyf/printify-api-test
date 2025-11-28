'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FulfillmentTrackingViewer } from '@/components/FulfillmentTrackingViewer';
import { Loader2, Package, Truck, CheckCircle2 } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  shipping_method: number;
  line_items: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
    price?: number;
    print_files?: any[];
  }>;
  address_to: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address1: string;
    address2?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  shipment?: {
    id: string;
    carrier: string;
    tracking_number: string;
    created_at?: string;
  };
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        <p className="text-slate-600">Loading order details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-medium">{error}</p>
          <Link href="/shop" className="mt-4 inline-block">
            <Button variant="outline">Back to Shop</Button>
          </Link>
        </div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-slate-700 font-medium mb-4">Order not found</p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    </div>
  );

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'created':
      case 'pending':
        return <Package className="h-6 w-6 text-blue-600" />;
      case 'in_transit':
      case 'shipped':
        return <Truck className="h-6 w-6 text-amber-600" />;
      case 'delivered':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      default:
        return <Package className="h-6 w-6 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/shop" className="text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shop
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Order #{order.id}</h1>
          <p className="text-slate-600">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Current Status</p>
                  <p className="text-2xl font-bold text-slate-900 capitalize">
                    {order.status?.replace(/_/g, ' ')}
                  </p>
                </div>
                {order.shipment && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Shipping Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-slate-600">Carrier</p>
                        <p className="font-medium text-slate-900">{order.shipment.carrier}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Tracking Number</p>
                        <p className="font-medium text-slate-900 break-all">{order.shipment.tracking_number}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>{order.line_items.length} item(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.line_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Product: {item.product_id}</p>
                        <p className="text-sm text-slate-600">
                          Variant ID: {item.variant_id} • Quantity: {item.quantity}
                        </p>
                      </div>
                      {item.price && (
                        <p className="font-semibold text-slate-900">${(item.price / 100).toFixed(2)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fulfillment Tracking */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <FulfillmentTrackingViewer orderId={order.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium text-slate-900">
                  {order.address_to.first_name} {order.address_to.last_name}
                </p>
                <p className="text-slate-600">{order.address_to.address1}</p>
                {order.address_to.address2 && (
                  <p className="text-slate-600">{order.address_to.address2}</p>
                )}
                {order.address_to.city && (
                  <p className="text-slate-600">
                    {order.address_to.city}, {order.address_to.region} {order.address_to.postal_code}
                  </p>
                )}
                {order.address_to.country && (
                  <p className="text-slate-600">{order.address_to.country}</p>
                )}
                <div className="border-t pt-3 mt-3">
                  <p className="text-slate-600 mb-1">Email</p>
                  <p className="text-slate-900 break-all">{order.address_to.email}</p>
                </div>
                {order.address_to.phone && (
                  <div className="border-t pt-3">
                    <p className="text-slate-600 mb-1">Phone</p>
                    <p className="text-slate-900">{order.address_to.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/shop" className="block">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/shop/orders" className="block">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
