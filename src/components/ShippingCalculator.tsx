'use client';

import React, { useEffect, useState } from 'react';
import { Truck, DollarSign, Calendar, Loader } from 'lucide-react';

interface ShippingMethod {
  id: number;
  name: string;
  cost_first_item: number;
  cost_additional_items: number;
  currency: string;
  delivery_days_min: number;
  delivery_days_max: number;
  is_available: boolean;
}

interface ShippingCalculatorProps {
  productId: string;
  quantity?: number;
  onMethodSelect?: (method: string, cost: number) => void;
}

export function ShippingCalculator({
  productId,
  quantity = 1,
  onMethodSelect,
}: ShippingCalculatorProps) {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [destination, setDestination] = useState('US');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available shipping methods
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await fetch(
          `/api/shipping/methods?product_id=${productId}&destination=${destination}`
        );
        if (!response.ok) throw new Error('Failed to fetch shipping methods');
        const data = await response.json();
        setMethods(data.available_methods || []);
        if (data.available_methods?.length > 0) {
          setSelectedMethod(data.available_methods[0].name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading shipping');
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, [productId, destination]);

  const calculateCost = (method: ShippingMethod, qty: number) => {
    if (qty <= 0) return 0;
    const cost = method.cost_first_item + (qty - 1) * method.cost_additional_items;
    return Math.round(cost * 100) / 100;
  };

  if (loading) return <div className="p-4 text-gray-500">Loading shipping options...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Truck className="w-6 h-6" />
          Shipping Calculator
        </h2>
      </div>

      {/* Destination Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Delivery Destination
        </label>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="EU">European Union</option>
          <option value="AU">Australia</option>
        </select>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Quantity
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Shipping Methods */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Select Shipping Method
        </label>
        <div className="space-y-2">
          {methods.map((method) => {
            const cost = calculateCost(method, quantity);
            const isSelected = selectedMethod === method.name;

            return (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.name);
                  onMethodSelect?.(method.name, cost);
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{method.name} Shipping</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {method.delivery_days_min}-{method.delivery_days_max} business days
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${cost.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      ${method.cost_first_item.toFixed(2)} first
                      {quantity > 1 && (
                        <> + ${((quantity - 1) * method.cost_additional_items).toFixed(2)} additional</>
                      )}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">✓ Selected</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {methods.length > 1 && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Method</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Cost</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Days</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => {
                const cost = calculateCost(method, quantity);
                return (
                  <tr key={method.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 capitalize">
                      {method.name}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">${cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {method.delivery_days_min}-{method.delivery_days_max}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
        <p className="font-semibold">Shipping Information:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Delivery times are estimates and may vary</li>
          <li>International shipping may require customs clearance</li>
          <li>Prices shown in USD</li>
          <li>Regional adjustments apply for some destinations</li>
        </ul>
      </div>
    </div>
  );
}
