'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Plus, ListIcon, ShoppingCart as CartIcon, Settings, Truck, Upload, Globe, BarChart3, Zap, Boxes } from 'lucide-react';
import { useCart } from './cart-context';
import { SkeletonProductGrid, SkeletonHero } from '@/components/skeleton-loader';

interface Shop {
  id: string;
  title: string;
  sales_channel: string;
}

interface Product {
  id: string;
  title: string;
  images: Array<{ src: string; variant_ids: number[] }>;
  variants: Array<{ price: number }>;
}

export default function ShopHomePage() {
  const { cart } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched) return;
    const fetchData = async () => {
      try {
        const [shopRes, productsRes] = await Promise.all([
          fetch('/api/shops'),
          fetch('/api/merchandise'),
        ]);
        const shopData = await shopRes.json();
        const productsData = await productsRes.json();
        if (!shopRes.ok) throw new Error(shopData.error);
        if (!productsRes.ok) throw new Error(productsData.error);

        setShop(Array.isArray(shopData) && shopData.length > 0 ? shopData[0] : null);
        const productsArray = productsData.data || [];
        setFeatured(productsArray.slice(0, 6));
        setFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetched]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {loading ? (
              <SkeletonHero />
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  {shop?.title || 'Premium Print Store'}
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Professional custom printing services. Quality products, fast delivery, exceptional service.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      {loading ? (
        <div className="bg-white">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto animate-pulse" />
              </div>
              <SkeletonProductGrid count={6} />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
                <h3 className="font-semibold text-red-900">Error Loading Shop</h3>
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Products</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">Professional quality merchandise for your brand</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {featured.map((item) => (
                  <Link key={item.id} href={`/shop/product/${item.id}`}>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                      <div className="aspect-square bg-slate-100 overflow-hidden">
                        {item.images?.[0]?.src ? (
                          <img
                            src={item.images[0].src}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-slate-600 text-sm mb-4">Product</p>
                        <p className="text-2xl font-bold text-slate-900">
                          ${(item.variants?.[0]?.price || 0) / 100}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Grid */}
      <div className="bg-slate-50">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/shop/catalog">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Browse Catalog</h3>
                  <p className="text-slate-600 text-sm">Explore our full collection</p>
                </div>
              </Link>

              <Link href="/shop/create-product">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Create Product</h3>
                  <p className="text-slate-600 text-sm">Design custom merchandise</p>
                </div>
              </Link>

              <Link href="/shop/products">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <ListIcon className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Products</h3>
                  <p className="text-slate-600 text-sm">Edit and organize items</p>
                </div>
              </Link>

              <Link href="/shop/orders">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Truck className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Order History</h3>
                  <p className="text-slate-600 text-sm">Track your orders</p>
                </div>
              </Link>

              <Link href="/shop/upload">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Images</h3>
                  <p className="text-slate-600 text-sm">Add design images</p>
                </div>
              </Link>

              <Link href="/shop/setup">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Shop Setup</h3>
                  <p className="text-slate-600 text-sm">Configure settings</p>
                </div>
              </Link>

              <Link href="/shop/bulk-operations">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Boxes className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Bulk Operations</h3>
                  <p className="text-slate-600 text-sm">Manage multiple products</p>
                </div>
              </Link>

              <Link href="/analytics">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics</h3>
                  <p className="text-slate-600 text-sm">View sales insights</p>
                </div>
              </Link>

              <Link href="/shop/cart">
                <div className={`bg-white rounded-2xl shadow-sm border-2 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center ${
                  cart.length > 0 ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                }`}>
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <CartIcon className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Shopping Cart</h3>
                  <p className="text-slate-600 text-sm">{cart.length} items</p>
                </div>
              </Link>
            </div>
          </div>
          </div>
          </div>

          {/* Additional Features Section */}
          <div className="bg-white border-t border-slate-200">
          <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Advanced Features</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Access powerful tools for managing your Printify integration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/shop/providers">
                <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Print Providers</h3>
                  <p className="text-slate-600 text-sm">Choose print partners</p>
                </div>
              </Link>

              <Link href="/webhooks">
                <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Webhooks</h3>
                  <p className="text-slate-600 text-sm">Event management & logging</p>
                </div>
              </Link>

              <Link href="/settings">
                <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">API Settings</h3>
                  <p className="text-slate-600 text-sm">Manage credentials</p>
                </div>
              </Link>
            </div>
          </div>
          </div>
          </div>
          </div>
          );
          }
