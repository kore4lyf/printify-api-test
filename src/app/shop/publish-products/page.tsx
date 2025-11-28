'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Package } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  images?: Array<{ src: string }>;
  variants?: any[];
  options?: any[];
  visible: boolean;
  updated_at?: string;
  external?: {
    id: string;
    handle: string;
  };
}

export default function PublishProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const endpoint = '/api/merchandise';
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      // Handle both array and paginated responses like in the test page
      let productsArray: Product[] = [];
      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && typeof data === 'object' && 'data' in data) {
        // Paginated response
        productsArray = data.data;
      } else {
        productsArray = [];
      }

      setProducts(productsArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (productId: string) => {
    setPublishing(productId);
    try {
      const res = await fetch(`/api/products/${productId}/publish`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Refresh products
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setPublishing(null);
    }
  };

  const handleUnpublish = async (productId: string) => {
    setPublishing(productId);
    try {
      const res = await fetch(`/api/products/${productId}/unpublish`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Refresh products
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish');
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/shop" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shop
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Publish Products</h1>
            <p className="text-slate-600">Manage and publish your products to sales channels</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="container mx-auto px-6 py-20">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </div>
        </div>
      ) : error ? (
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
              <h3 className="font-semibold text-red-900">Error Loading Products</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto grid gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  {/* Product Image */}
                  <div className="w-full md:w-56 h-48 md:h-auto flex-shrink-0 bg-slate-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].src}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">{product.title}</h3>
                          {product.description && (
                            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                            product.visible
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {product.visible ? 'Published' : 'Unpublished'}
                          </span>
                        </div>
                      </div>

                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                          {product.tags.length > 3 && (
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                              +{product.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Product Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                        {product.variants && (
                          <div>
                            <p className="text-xs text-slate-600 font-medium mb-1">Variants</p>
                            <p className="text-lg font-semibold text-slate-900">{product.variants.length}</p>
                          </div>
                        )}
                        {product.options && (
                          <div>
                            <p className="text-xs text-slate-600 font-medium mb-1">Options</p>
                            <p className="text-lg font-semibold text-slate-900">{product.options.length}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-slate-600 font-medium mb-1">ID</p>
                          <p className="text-xs font-mono text-slate-900 truncate">{product.id}</p>
                        </div>
                        {product.updated_at && (
                          <div>
                            <p className="text-xs text-slate-600 font-medium mb-1">Updated</p>
                            <p className="text-sm text-slate-900">{new Date(product.updated_at).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                      <Link href={`/shop/product/${product.id}`}>
                        <Button className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 rounded-xl">
                          View Product
                        </Button>
                      </Link>
                      {product.visible ? (
                        <Button
                          onClick={() => handleUnpublish(product.id)}
                          disabled={publishing === product.id}
                          className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 rounded-xl disabled:opacity-50"
                        >
                          {publishing === product.id && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                          Unpublish
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handlePublish(product.id)}
                          disabled={publishing === product.id}
                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl disabled:opacity-50"
                        >
                          {publishing === product.id && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                          Publish
                        </Button>
                      )}
                      {product.external && (
                        <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl">
                          <a href={`https://printify.com/app/store/products/${product.external.id}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Printify
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
