'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrintPreview } from '@/components/print-preview';
import { ExpressShippingInfo } from '@/components/ExpressShippingInfo';
import { ExpressShippingToggle } from '@/components/ExpressShippingToggle';
import { GpsrComplianceForm } from '@/components/GpsrComplianceForm';
import { MockupGenerator } from '@/components/MockupGenerator';
import { useCart } from '../../cart-context';
import { Loader2, Minus, Plus } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  images: Array<{ src: string; position: string }>;
  variants: Array<{ id: number; price: number; title: string; options: number[]; is_enabled: boolean }>;
  options: Array<{ name: string; type: string; values: Array<{ id: number; title: string }> }>;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const productData = await res.json();
        if (!res.ok) throw new Error(productData.error);
        setProduct(productData);
        const defaultVariant = productData.variants?.find((v: any) => v.is_default || v.is_enabled);
        if (defaultVariant) setSelectedVariant(defaultVariant.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex justify-center items-center py-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <Link href="/shop/catalog">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex justify-center items-center py-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <p className="text-slate-700 font-medium mb-4">Product not found</p>
          <Link href="/shop/catalog">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    </div>
  );

  const selectedVariantData = product?.variants?.find(v => v.id === selectedVariant);
  const selectedPrice = selectedVariantData?.price || product?.variants?.[0]?.price || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/shop/catalog" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Catalog
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="aspect-square overflow-hidden bg-slate-100 border border-slate-200 rounded-2xl">
              <img
                src={selectedImage || product?.images[0]?.src}
                alt={product?.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {product && product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image.src)}
                    className={`aspect-square overflow-hidden border-2 rounded-lg transition-all ${
                      selectedImage === image.src ? 'border-slate-900' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={`${product.title} ${image.position}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{product?.title}</h1>
              <p className="text-4xl font-bold text-slate-900 mb-6">
                ${(selectedPrice / 100).toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
              {product?.options?.map((option) => (
                <div key={option.name} className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900">
                    {option.name}
                  </label>
                  <Select onValueChange={(value) => {
                    const optionId = parseInt(value);
                    const availableVariants = product.variants?.filter(v => v.is_enabled && v.options.includes(optionId)) || [];
                    if (availableVariants.length > 0) setSelectedVariant(availableVariants[0].id);
                  }}>
                    <SelectTrigger className="h-12 rounded-lg border-slate-200">
                      <SelectValue placeholder={`Select ${option.name.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.values?.map((value) => (
                        <SelectItem key={value.id} value={value.id.toString()}>
                          {value.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">
                  Quantity
                </label>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200 w-fit">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="hover:bg-slate-200 rounded-lg h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-0 bg-transparent font-semibold"
                    min="1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="hover:bg-slate-200 rounded-lg h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => selectedVariant && addToCart({
                  id: parseInt(product.id, 10),
                  variantId: selectedVariant,
                  title: product.title,
                  price: selectedPrice,
                  quantity
                })}
                disabled={!selectedVariant}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 h-auto rounded-xl font-semibold text-lg"
              >
                Add to Cart
              </Button>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Description</h2>
              <div 
                className="text-slate-600 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product?.description || '' }}
              />
            </div>
          </div>
        </div>

        {/* Express Shipping Section */}
        <div className="max-w-6xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Shipping Options</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <ExpressShippingInfo productId={product?.id || ''} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Express Shipping Control</h3>
              <ExpressShippingToggle
                productId={product?.id || ''}
                initialEnabled={false}
                isEligible={false}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="max-w-6xl mx-auto mt-12 flex flex-col sm:flex-row gap-4">
          <Link href="/shop/catalog" className="flex-1">
            <Button className="w-full bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 px-8 py-3 h-auto rounded-xl font-medium">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/shop/cart" className="flex-1">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 h-auto rounded-xl font-medium">
              View Cart ({cart.length})
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
