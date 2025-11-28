'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Settings, Play } from 'lucide-react';
import { PrintifyProduct } from '@/lib/printify-types';

export default function PrintifyTestPage() {
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<any>(null);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const endpoints = [
    { name: 'Merchandise', path: '/api/merchandise' },
    { name: 'Shops', path: '/api/shops' },
    { name: 'Blueprints', path: '/api/blueprints' },
    { name: 'Uploads', path: '/api/uploads' },
    { name: 'Providers', path: '/api/providers' },
    { name: 'Orders', path: '/api/orders' },
    { name: 'Webhooks', path: '/api/webhooks' },
  ];

  const testEndpoint = async (endpoint: { name: string; path: string }) => {
    setTestingEndpoint(endpoint.path);
    try {
      const response = await fetch(endpoint.path);
      const data = await response.json();
      setDialogData(data);
      setDialogTitle(`${endpoint.name} API Response`);
      setDialogOpen(true);
    } catch (err) {
      setDialogData({ error: 'Request failed', details: err instanceof Error ? err.message : 'Unknown error' });
      setDialogTitle(`${endpoint.name} API Error`);
      setDialogOpen(true);
    } finally {
      setTestingEndpoint(null);
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/merchandise');
        const productsData = await response.json();

        if (!response.ok) {
          throw new Error(productsData.error || `HTTP ${response.status}`);
        }

        setProducts(productsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
  <div className="min-h-screen bg-slate-50">
  {/* Navigation */}
  <div className="bg-white border-b border-slate-200">
  <div className="container mx-auto px-6 py-4">
  <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
    Back to Campaigns
          </Link>
  </div>
  </div>

  {/* Header */}
  <div className="bg-white">
  <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Printify Integration Test
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Test your Printify setup by viewing products from your connected shop.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/printify-api">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium">
                  <Settings className="h-4 w-4 mr-2" />
                  Full API Dashboard
                </Button>
              </Link>
              <Link href="/webhooks">
                <Button variant="outline" className="px-6 py-3 rounded-xl font-medium">
                  <Settings className="h-4 w-4 mr-2" />
                  Webhooks
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="px-6 py-3 rounded-xl font-medium">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

        {/* Status */}
        <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          error
              ? 'bg-red-100 text-red-800 border border-red-200'
                : loading
              ? 'bg-slate-100 text-slate-800 border border-slate-200'
            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        }`}>
        {loading ? 'Loading products...' : error ? 'Connection Error' : `Found ${products.length} products`}
        </div>
        </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="font-semibold text-red-900">Connection Error</h3>
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

        {/* Products */}
        <div className="bg-white">
        <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
        {loading ? (
            <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-4 text-slate-600">
                <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-lg">Loading your Printify products...</span>
          </div>
        </div>
        ) : products.length > 0 ? (
        <>
        <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Printify Products</h2>
          <p className="text-slate-600">These products are available for your campaign rewards</p>
                </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
        <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="aspect-square bg-slate-100 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
              src={product.images[0].src}
                alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        )}
        </div>

        <div className="p-6">
        <h3 className="font-semibold text-slate-900 text-lg mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">{product.description}</p>

            <div className="space-y-3">
                <div>
                            <p className="text-sm font-medium text-slate-900 mb-2">Price Range</p>
                  <div className="space-y-1">
                  {product.variants.slice(0, 2).map((variant) => (
                  <div key={variant.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">{variant.title}</span>
                <span className="font-semibold text-slate-900">${(variant.price / 100).toFixed(2)}</span>
                </div>
                ))}
                  {product.variants.length > 2 && (
                      <p className="text-xs text-slate-500">
                          +{product.variants.length - 2} more options
                                </p>
                      )}
                  </div>
              </div>

                  {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                                  {tag}
                              </span>
                          ))}
                        </div>
                    )}
                    </div>

                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs text-slate-500">Product ID: {product.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : !error ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Products Found</h3>
                <p className="text-slate-600 mb-6">Your Printify shop doesn't have any products yet.</p>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Make sure your API key and shop ID are configured correctly in your environment variables.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* API Testing Section */}
      <div className="bg-white border-t border-slate-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Test All Endpoints</h2>
              <p className="text-slate-600">Click the buttons below to test each Printify API endpoint and view the raw JSON responses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endpoints.map((endpoint) => (
                <Button
                  key={endpoint.path}
                  onClick={() => testEndpoint(endpoint)}
                  disabled={testingEndpoint === endpoint.path}
                  className="h-auto p-4 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-xl font-medium text-left justify-start"
                >
                  <div className="flex items-center gap-3">
                    {testingEndpoint === endpoint.path ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                    ) : (
                      <Play className="h-5 w-5 text-slate-600" />
                    )}
                    <div>
                      <div className="font-semibold">{endpoint.name}</div>
                      <div className="text-sm text-slate-500">{endpoint.path}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog for API Responses */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Raw JSON response from the API endpoint.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-x-auto border">
              {JSON.stringify(dialogData, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
