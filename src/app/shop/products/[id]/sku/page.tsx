'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { PrintifyProduct } from '@/lib/printify-types';

export default function SKUManagementPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<PrintifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skus, setSKUs] = useState<Record<number, string>>({});
  const [originalSKUs, setOriginalSKUs] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setProduct(data);

        const skuMap: Record<number, string> = {};
        data.variants?.forEach((v: any) => {
          skuMap[v.id] = v.sku || '';
        });
        setSKUs(skuMap);
        setOriginalSKUs(skuMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleSKUChange = (variantId: number, sku: string) => {
    setSKUs((prev) => ({ ...prev, [variantId]: sku }));
  };

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variants: product.variants?.map((v) => ({
            ...v,
            sku: skus[v.id] || v.sku,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to update SKUs');

      setOriginalSKUs(skus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save SKUs');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSKUs(originalSKUs);
  };

  const hasChanges = Object.keys(skus).some((key) => skus[key as any] !== originalSKUs[key as any]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-12">
          <p className="text-red-800">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/shop/products" className="text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">SKU Management - {product.title}</h1>
          <p className="text-slate-600">Manage variant SKUs and track inventory</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Variant SKUs</CardTitle>
                <CardDescription>
                  Stock Keeping Units (SKUs) help you track inventory across different variants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {product.variants?.map((variant) => (
                  <div key={variant.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{variant.title}</h3>
                        <p className="text-sm text-slate-600">
                          Variant ID: {variant.id}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          variant.is_enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {variant.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`sku-${variant.id}`}>SKU *</Label>
                        <Input
                          id={`sku-${variant.id}`}
                          value={skus[variant.id] || ''}
                          onChange={(e) => handleSKUChange(variant.id, e.target.value)}
                          placeholder="e.g., SHIRT-RED-M"
                          className="mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Unique identifier for this variant
                        </p>
                      </div>

                      <div>
                        <Label htmlFor={`cost-${variant.id}`}>Cost Price</Label>
                        <div className="relative mt-1">
                          <Input
                            id={`cost-${variant.id}`}
                            type="number"
                            disabled
                            value={(variant.cost || 0) / 100}
                            className="bg-slate-50"
                          />
                          <span className="absolute right-3 top-2.5 text-slate-600">
                            USD
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Set in product pricing
                        </p>
                      </div>
                    </div>

                    {/* SKU Format Info */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 mb-2">
                        <strong>SKU Format Tips:</strong>
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        <li>Keep it short and memorable (max 100 characters)</li>
                        <li>Use uppercase letters and numbers</li>
                        <li>Include product type and size (e.g., SHIRT-BLK-L)</li>
                        <li>Make it unique across all variants</li>
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Save Buttons */}
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save SKUs
              </Button>
              <Button onClick={handleReset} disabled={!hasChanges} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variants Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Total Variants</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {product.variants?.length || 0}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-slate-600 mb-1">Enabled</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {product.variants?.filter((v) => v.is_enabled).length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">SKUs Set</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {Object.values(skus).filter((s) => s).length}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base text-blue-900">What's a SKU?</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-900 space-y-2">
                <p>
                  A SKU is a unique identifier for tracking inventory and sales across different product variants.
                </p>
                <p>
                  Use consistent SKU patterns to make your inventory management easier.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
