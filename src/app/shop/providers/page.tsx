'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, MapPin, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface PrintProvider {
  id: number;
  title: string;
  location?: {
    country: string;
    address1: string;
    city: string;
    region: string;
    zip: string;
  };
  capabilities?: {
    print_on_demand: boolean;
    drop_shipping: boolean;
    bulk_orders: boolean;
  };
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<PrintProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/providers');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProviders(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="text-slate-600">Loading print providers...</p>
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Print Providers</h1>
          <p className="text-slate-600">Choose a print provider for your products</p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">What's a Print Provider?</p>
                <p>Print providers are printing companies that Printify partners with. They handle the actual printing, packaging, and shipping of your products. Different providers have different capabilities, pricing, and locations.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {providers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600 text-lg font-medium">No providers available</p>
              <p className="text-slate-500 text-sm mt-2">Check your API connection</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Provider Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Card
                  key={provider.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedProvider === provider.id
                      ? 'border-slate-900 border-2 bg-slate-50'
                      : 'hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{provider.title}</CardTitle>
                      {selectedProvider === provider.id && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Location */}
                    {provider.location && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-medium text-slate-900">Location</p>
                        </div>
                        <div className="bg-slate-50 rounded p-3 text-sm text-slate-600 space-y-1">
                          <p>{provider.location.address1}</p>
                          <p>
                            {provider.location.city}, {provider.location.region} {provider.location.zip}
                          </p>
                          <p className="font-medium text-slate-900">{provider.location.country}</p>
                        </div>
                      </div>
                    )}

                    {/* Capabilities */}
                    {provider.capabilities && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-medium text-slate-900">Capabilities</p>
                        </div>
                        <ul className="space-y-2">
                          {provider.capabilities.print_on_demand && (
                            <li className="text-sm text-slate-600 flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                              Print on Demand
                            </li>
                          )}
                          {provider.capabilities.drop_shipping && (
                            <li className="text-sm text-slate-600 flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                              Drop Shipping
                            </li>
                          )}
                          {provider.capabilities.bulk_orders && (
                            <li className="text-sm text-slate-600 flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                              Bulk Orders
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selection Details */}
            {selectedProvider && (
              <Card className="bg-slate-900 text-white border-0">
                <CardHeader>
                  <CardTitle>
                    {providers.find((p) => p.id === selectedProvider)?.title} Selected
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-slate-300">
                    This provider will be used to print and ship products created through Printify.
                    You can change providers later for individual products.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Features</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <span className="text-sm">Advanced capabilities</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Shipping</p>
                      <span className="text-sm">Worldwide delivery</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Support</p>
                      <span className="text-sm">24/7 support available</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Link href="/shop/create-product">
                      <Button className="bg-white text-slate-900 hover:bg-slate-100">
                        Create Product with This Provider
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
