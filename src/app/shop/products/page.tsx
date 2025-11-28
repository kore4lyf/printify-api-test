'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { PrintifyProduct } from '@/lib/printify-types';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/merchandise');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProducts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    setDeleting(productId);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (product: PrintifyProduct) => {
    try {
      const endpoint = product.visible
        ? `/api/products/${product.id}/unpublish`
        : `/api/products/${product.id}/publish`;
      
      const res = await fetch(endpoint, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to update');
      
      setProducts(products.map((p) =>
        p.id === product.id ? { ...p, visible: !p.visible } : p
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        <p className="text-slate-600">Loading products...</p>
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Product Management</h1>
          <p className="text-slate-600">Edit and manage your Printify products</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-600 text-lg font-medium mb-6">No products found</p>
              <Link href="/shop/create-product">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Create Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-6">
                    {/* Product Image */}
                    {product.images?.[0] && (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={product.images[0].src}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.visible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {product.visible ? 'Published' : 'Draft'}
                        </span>
                        {product.is_locked && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Created {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => togglePublish(product)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title={product.visible ? 'Unpublish' : 'Publish'}
                      >
                        {product.visible ? (
                          <Eye className="h-5 w-5 text-green-600" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                      <Link href={`/shop/products/${product.id}/edit`}>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit2 className="h-5 w-5 text-blue-600" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === product.id ? (
                          <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5 text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
