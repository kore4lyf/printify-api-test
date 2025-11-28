'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Zap, Truck, DollarSign } from 'lucide-react';

interface ExpressShippingProps {
  productId: string;
}

interface ExpressData {
  is_printify_express_eligible: boolean;
  is_printify_express_enabled: boolean;
  express_variants: Array<{
    id: number;
    title: string;
    sku: string;
    price: number;
    is_printify_express_eligible: boolean;
  }>;
  eligible_count: number;
}

export function ExpressShippingInfo({ productId }: ExpressShippingProps) {
  const [data, setData] = useState<ExpressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/shipping/express?product_id=${productId}`);
        if (!response.ok) throw new Error('Failed to fetch Express shipping info');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  if (loading) return <div className="p-4 text-gray-500">Loading shipping info...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data?.is_printify_express_eligible) {
    return (
      <div className="p-4 bg-gray-100 rounded border border-gray-300">
        <p className="text-gray-700">
          ℹ️ This product is not eligible for Printify Express shipping.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Express is available for select Bella+Canvas 3001 and Gildan 5000 t-shirts in popular colors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Eligibility Badge */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded">
        <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900">Printify Express Available</h3>
          <p className="text-sm text-blue-800 mt-1">
            {data.eligible_count} of {data.eligible_count} variants qualify for faster delivery
          </p>
          <p className="text-sm text-blue-700 mt-2">
            📦 Delivery in 2-3 business days (including production)
          </p>
        </div>
      </div>

      {/* Eligible Variants */}
      <div className="border rounded p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Express-Eligible Variants</h4>
        <div className="space-y-2">
          {data.express_variants.map((variant) => (
            <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium text-gray-900">{variant.title}</p>
                <p className="text-xs text-gray-600">SKU: {variant.sku}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">${variant.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Info */}
      <div className="border rounded p-4 bg-amber-50">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Shipping Cost Comparison
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Standard Shipping</p>
            <p className="text-lg font-bold text-gray-900">$4.75</p>
            <p className="text-xs text-gray-600">first item</p>
            <p className="text-xs text-gray-600 mt-2">+$2.19 each additional</p>
            <p className="text-xs text-gray-500 mt-2">2-5 business days</p>
          </div>
          <div className="border-l border-gray-300 pl-4">
            <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold mb-2">Express Shipping</p>
            <p className="text-lg font-bold text-blue-600">$7.99</p>
            <p className="text-xs text-gray-600">first item</p>
            <p className="text-xs text-gray-600 mt-2">+$2.40 each additional</p>
            <p className="text-xs text-blue-600 font-semibold mt-2">2-3 business days*</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 italic">
          * Plus production time. Not guaranteed but orders given dedicated production line.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
        {data.is_printify_express_enabled ? (
          <>
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            <span className="text-sm font-medium text-green-800">✓ Express shipping is ENABLED for this product</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
            <span className="text-sm font-medium text-orange-800">
              ⚠ Express shipping is DISABLED (eligible but not active)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
