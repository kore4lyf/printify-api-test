'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BulkOperationManager } from '@/components/BulkOperationManager';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  visible: boolean;
  variants: Array<{ id: number; title: string }>;
}

export default function BulkOperationsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to load products');
        const data = await response.json();
        setProducts(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setSelectAll(newSelected.size === products.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

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

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Bulk Operations</h1>
            <p className="text-slate-600">
              Perform operations on multiple products at once
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Products List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Select Products</span>
                    <span className="text-sm font-normal text-slate-600">
                      {selectedProducts.size} selected
                    </span>
                  </CardTitle>
                  <CardDescription>Choose products for bulk operation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Select All */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-4">
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <label htmlFor="select-all" className="flex-1 font-semibold text-slate-900 cursor-pointer">
                        Select All ({products.length})
                      </label>
                    </div>

                    {/* Product Items */}
                    <div className="border border-slate-200 rounded-lg divide-y max-h-96 overflow-y-auto">
                      {products.length === 0 ? (
                        <div className="p-8 text-center text-slate-600">
                          No products available
                        </div>
                      ) : (
                        products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              id={product.id}
                              checked={selectedProducts.has(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="w-4 h-4 rounded border-slate-300"
                            />
                            <label htmlFor={product.id} className="flex-1 cursor-pointer">
                              <p className="font-medium text-slate-900">{product.title}</p>
                              <p className="text-sm text-slate-600">
                                {product.variants?.length || 0} variants • {product.visible ? '✓ Published' : 'Unpublished'}
                              </p>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bulk Operations */}
            <div>
              <div className="sticky top-4">
                <BulkOperationManager
                  selectedProductIds={Array.from(selectedProducts)}
                  onOperationComplete={() => setSelectedProducts(new Set())}
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl">
            <h3 className="font-semibold text-blue-900 mb-3">Bulk Operations Information</h3>
            <ul className="text-sm text-blue-800 space-y-2 ml-4 list-disc">
              <li>Select one or more products from the list</li>
              <li>Choose an operation (publish, unpublish, delete, update pricing, etc.)</li>
              <li>Provide any required parameters</li>
              <li>Execute the operation to apply it to all selected products</li>
              <li>Results are displayed immediately after completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
