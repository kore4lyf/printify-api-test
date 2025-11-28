'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Shop {
  id: string;
  title: string;
  sales_channel: string;
  user_id: string;
  created_at: string;
}

export default function ShopSetupPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    sales_channel: 'shopify',
  });

  const salesChannels = [
    { value: 'shopify', label: 'Shopify' },
    { value: 'woocommerce', label: 'WooCommerce' },
    { value: 'etsy', label: 'Etsy' },
    { value: 'custom', label: 'Custom Integration' },
    { value: 'api', label: 'API Only' },
  ];

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shops');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const shopData = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (shopData) {
        setShop(shopData);
        setFormData({
          title: shopData.title,
          sales_channel: shopData.sales_channel,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.title.trim()) {
        throw new Error('Shop title is required');
      }

      // Mock save - in production would update the shop via API
      // const res = await fetch(`/api/shops/${shop?.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simulate success
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccess('Shop settings saved successfully');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="text-slate-600">Loading shop settings...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Shop Setup</h1>
          <p className="text-slate-600">Configure your Printify shop settings</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shop Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>Configure your shop details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {shop && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Shop ID</p>
                        <p className="font-mono text-sm font-medium text-slate-900">{shop.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Created</p>
                        <p className="font-medium text-slate-900">
                          {new Date(shop.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="title">Shop Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="My Printify Shop"
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    The name customers see for your shop
                  </p>
                </div>

                <div>
                  <Label htmlFor="channel">Sales Channel *</Label>
                  <Select
                    value={formData.sales_channel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sales_channel: value })
                    }
                  >
                    <SelectTrigger id="channel" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {salesChannels.map((channel) => (
                        <SelectItem key={channel.value} value={channel.value}>
                          {channel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    Where your products will be sold
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sales Channel Details */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Channel Details</CardTitle>
                <CardDescription>
                  {formData.sales_channel === 'api' 
                    ? 'Use Printify API directly for custom integrations'
                    : `Information for ${formData.sales_channel}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.sales_channel === 'shopify' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                      Connect your Shopify store to automatically sync products and orders.
                    </p>
                    <Button variant="outline" className="w-full">
                      Connect Shopify Store
                    </Button>
                    <p className="text-xs text-slate-500">
                      You'll be redirected to Shopify to authorize the connection
                    </p>
                  </div>
                )}

                {formData.sales_channel === 'woocommerce' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                      Connect your WooCommerce store via API credentials.
                    </p>
                    <div>
                      <Label htmlFor="wc-url">Store URL</Label>
                      <Input
                        id="wc-url"
                        placeholder="https://yourstore.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wc-key">API Key</Label>
                      <Input
                        id="wc-key"
                        placeholder="ck_..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wc-secret">API Secret</Label>
                      <Input
                        id="wc-secret"
                        type="password"
                        placeholder="cs_..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {formData.sales_channel === 'etsy' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                      Connect your Etsy shop via OAuth.
                    </p>
                    <Button variant="outline" className="w-full">
                      Connect Etsy Shop
                    </Button>
                    <p className="text-xs text-slate-500">
                      You'll be redirected to Etsy to authorize the connection
                    </p>
                  </div>
                )}

                {formData.sales_channel === 'custom' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                      Set up custom webhook endpoints for your integration.
                    </p>
                    <div>
                      <Label htmlFor="webhook">Webhook URL</Label>
                      <Input
                        id="webhook"
                        type="url"
                        placeholder="https://yourserver.com/webhook"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {formData.sales_channel === 'api' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                      Use Printify API directly for complete control.
                    </p>
                    <Link href="/settings">
                      <Button variant="outline" className="w-full">
                        Go to API Settings
                      </Button>
                    </Link>
                    <Link href="/webhooks">
                      <Button variant="outline" className="w-full">
                        Configure Webhooks
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
              <Link href="/shop">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Shop Connected
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-green-900">
                {shop ? (
                  <div>
                    <p className="font-medium mb-1">{shop.title}</p>
                    <p className="text-green-800">
                      Ready to create and manage products
                    </p>
                  </div>
                ) : (
                  <p>No shop detected</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/shop/create-product">
                  <Button variant="outline" className="w-full justify-start text-left">
                    Create Product
                  </Button>
                </Link>
                <Link href="/shop/products">
                  <Button variant="outline" className="w-full justify-start text-left">
                    Manage Products
                  </Button>
                </Link>
                <Link href="/webhooks">
                  <Button variant="outline" className="w-full justify-start text-left">
                    Webhooks
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start text-left">
                    API Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base text-blue-900">
                  About Sales Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-900 space-y-2">
                <p>
                  A sales channel is where your Printify products are displayed and sold.
                </p>
                <p>
                  You can connect multiple channels to one shop and sync products across them.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
