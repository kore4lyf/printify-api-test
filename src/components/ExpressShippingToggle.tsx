'use client';

import React, { useState } from 'react';
import { Zap, Loader } from 'lucide-react';

interface ExpressToggleProps {
  productId: string;
  initialEnabled: boolean;
  isEligible: boolean;
  onToggleSuccess?: (enabled: boolean) => void;
}

export function ExpressShippingToggle({
  productId,
  initialEnabled,
  isEligible,
  onToggleSuccess,
}: ExpressToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggle = async () => {
    if (!isEligible) {
      setMessage({
        type: 'error',
        text: 'This product is not eligible for Express shipping',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/shipping/express/${productId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: !enabled }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to toggle Express shipping');
      }

      setEnabled(result.is_printify_express_enabled);
      setMessage({
        type: 'success',
        text: result.message,
      });

      onToggleSuccess?.(result.is_printify_express_enabled);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error toggling Express shipping',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isEligible) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Enable Printify Express</h3>
            <p className="text-sm text-gray-600">
              {enabled ? 'Express shipping is active' : 'Enable fast 2-3 day delivery'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            enabled
              ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400'
              : 'bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
          {loading && (
            <Loader className="absolute w-4 h-4 animate-spin text-gray-600 left-4" />
          )}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? '✓ ' : '✕ '}
          {message.text}
        </div>
      )}

      <p className="text-xs text-gray-500 px-4">
        When enabled, eligible customers will see a 2-3 business day delivery option at checkout.
        Orders automatically route to the best-positioned print provider.
      </p>
    </div>
  );
}
