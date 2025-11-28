'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { PrintifyProduct } from '@/lib/printify-types';

export default function PricingPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<PrintifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<number, number>>({});
  const [originalPrices, setOriginalPrices] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setProduct(data);
        
        const priceMap: Record<number, number> = {};
        data.variants?.forEach((v: any) => {
          priceMap[v.id] = v.price;
        });
        setPrices(priceMap);
        setOriginalPrices(priceMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handlePriceChange = (variantId: number, price: number) => {
    setPrices((prev) => ({ ...prev, [variantId]: price }));
  };

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    try {
      const updates = product.variants
        ?.filter((v) => prices[v.id] !== originalPrices[v.id])
        .map((v) => ({
          variant_id: v.id,
          price: prices[v.id],
        })) || [];

      if (updates.length === 0) {
        setError('No price changes to save');
        return;
      }

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variants: product.variants?.map((v) => ({
            ...v,
            price: prices[v.id],
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to update pricing');

      setOriginalPrices(prices);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prices');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPrices(originalPrices);
  };

  const hasChanges = Object.keys(prices).some(
    (key) => prices[key as any] !== originalPrices[key as any]
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <p className="text-red-800">Product not found</p>
      </div>
    </div>
  );

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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Pricing - {product.title}</h1>
          <p className="text-slate-600">Manage variant pricing for this product</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Variant Prices</CardTitle>
            <CardDescription>Update prices for each product variant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {product.variants?.map((variant) => (
                <div key={variant.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{variant.title}</h3>
                      <p className="text-sm text-slate-600">SKU: {variant.sku}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      variant.is_enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {variant.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`price-${variant.id}`}>Price (cents)</Label>
                      <Input
                        id={`price-${variant.id}`}
                        type="number"
                        min="0"
                        value={prices[variant.id] || 0}
                        onChange={(e) =>
                          handlePriceChange(variant.id, parseInt(e.target.value) || 0)
                        }
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        USD $
                        {((prices[variant.id] || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`cost-${variant.id}`}>Cost (cents)</Label>
                      <Input
                        id={`cost-${variant.id}`}
                        type="number"
                        disabled
                        value={variant.cost || 0}
                        className="mt-1 bg-slate-50"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        USD $
                        {((variant.cost || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`margin-${variant.id}`}>Margin</Label>
                      <Input
                        id={`margin-${variant.id}`}
                        type="number"
                        disabled
                        value={Math.max(0, (prices[variant.id] || 0) - (variant.cost || 0))}
                        className="mt-1 bg-slate-50"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        USD $
                        {(
                          Math.max(0, (prices[variant.id] || 0) - (variant.cost || 0)) / 100
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-8">
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
                Save Prices
              </Button>
              <Button
                onClick={handleReset}
                disabled={!hasChanges}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
