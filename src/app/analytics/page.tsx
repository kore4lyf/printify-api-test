'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Package, DollarSign, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  line_items: any[];
}

interface AnalyticsData {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  total_items_sold: number;
  orders_by_status: Record<string, number>;
  revenue_trend: Array<{ date: string; revenue: number }>;
  top_products: Array<{ product_id: string; name: string; quantity: number; revenue: number }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [ordersRes] = await Promise.all([
          fetch('/api/orders'),
        ]);

        if (!ordersRes.ok) throw new Error('Failed to fetch orders');

        const ordersData = await ordersRes.json();
        const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.data || [];
        
        setOrders(ordersList);

        // Calculate analytics
        const totalOrders = ordersList.length;
        const totalRevenue = ordersList.reduce((sum: number, order: Order) => sum + (order.total_price || 0), 0);
        const totalItems = ordersList.reduce((sum: number, order: Order) => 
          sum + (order.line_items?.reduce((itemSum: number, item: any) => itemSum + (item.quantity || 0), 0) || 0), 0);

        const statusCounts: Record<string, number> = {};
        ordersList.forEach((order: Order) => {
          const status = order.status || 'unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Calculate simple revenue trend (by date)
        const revenueTrend: Record<string, number> = {};
        ordersList.forEach((order: Order) => {
          const date = new Date(order.created_at).toLocaleDateString();
          revenueTrend[date] = (revenueTrend[date] || 0) + (order.total_price || 0);
        });

        // Get top products
        const productStats: Record<string, any> = {};
        ordersList.forEach((order: Order) => {
          order.line_items?.forEach((item: any) => {
            const productId = item.product_id || 'unknown';
            if (!productStats[productId]) {
              productStats[productId] = {
                product_id: productId,
                name: item.metadata?.title || `Product ${productId}`,
                quantity: 0,
                revenue: 0,
              };
            }
            productStats[productId].quantity += item.quantity || 0;
            productStats[productId].revenue += item.total_cost || 0;
          });
        });

        const topProducts = Object.values(productStats)
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 5);

        setAnalytics({
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          average_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          total_items_sold: totalItems,
          orders_by_status: statusCounts,
          revenue_trend: Object.entries(revenueTrend).map(([date, revenue]) => ({
            date,
            revenue,
          })),
          top_products: topProducts,
        });

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/shop" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shop
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                <BarChart3 className="w-10 h-10" />
                Analytics & Reporting
              </h1>
              <p className="text-slate-600">
                Sales performance, order metrics, and product insights
              </p>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  variant={timeRange === range ? 'default' : 'outline'}
                  className={timeRange === range ? 'bg-slate-900 text-white' : ''}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Key Metrics */}
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Orders */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
                    <Package className="h-6 w-6 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{analytics.total_orders}</div>
                    <p className="text-xs text-slate-600 mt-1">Orders processed</p>
                  </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">
                      ${(analytics.total_revenue / 100).toFixed(2)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Total earnings</p>
                  </CardContent>
                </Card>

                {/* Average Order Value */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-slate-600">Avg. Order Value</CardTitle>
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">
                      ${(analytics.average_order_value / 100).toFixed(2)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Per order</p>
                  </CardContent>
                </Card>

                {/* Items Sold */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-slate-600">Items Sold</CardTitle>
                    <BarChart3 className="h-6 w-6 text-amber-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{analytics.total_items_sold}</div>
                    <p className="text-xs text-slate-600 mt-1">Total units</p>
                  </CardContent>
                </Card>
              </div>

              {/* Orders by Status */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.orders_by_status).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            <span className="text-sm font-medium text-slate-700 capitalize">{status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{
                                  width: `${(count / analytics.total_orders) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-900 w-12 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.revenue_trend.slice(-7).map((entry) => (
                        <div key={entry.date} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{entry.date}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600"
                                style={{
                                  width: `${Math.min(
                                    (entry.revenue / Math.max(...analytics.revenue_trend.map((e) => e.revenue), 1)) * 100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-900 w-16 text-right">
                              ${(entry.revenue / 100).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best performing products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Product</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-900">Units Sold</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-900">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.top_products.length > 0 ? (
                          analytics.top_products.map((product, index) => (
                            <tr key={product.product_id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-semibold text-slate-500 w-6">#{index + 1}</span>
                                  <span className="text-slate-900 font-medium truncate">{product.name}</span>
                                </div>
                              </td>
                              <td className="text-right py-3 px-4 text-slate-900">{product.quantity}</td>
                              <td className="text-right py-3 px-4 font-semibold text-slate-900">
                                ${(product.revenue / 100).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-slate-600">
                              No sales data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
