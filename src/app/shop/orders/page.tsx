'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  created_at: string;
  line_items: Array<{
    quantity: number;
  }>;
  address_to: {
    first_name: string;
    last_name: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load orders');
        setOrders(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'created':
      case 'pending':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'in_transit':
      case 'shipped':
        return <Truck className="h-5 w-5 text-amber-600" />;
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <Package className="h-5 w-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'created':
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_transit':
      case 'shipped':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        <p className="text-slate-600">Loading your orders...</p>
      </div>
    </div>
  );

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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Orders</h1>
          <p className="text-slate-600">Track and manage your Printify orders</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600 text-lg font-medium mb-6">No orders yet</p>
              <Link href="/shop">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = order.line_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
              return (
                <Link key={order.id} href={`/shop/order/${order.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-6">
                        {/* Left Side */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900">Order #{order.id}</p>
                            <p className="text-sm text-slate-600">
                              {order.address_to.first_name} {order.address_to.last_name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {itemCount} item{itemCount !== 1 ? 's' : ''} • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status?.replace(/_/g, ' ')}
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
