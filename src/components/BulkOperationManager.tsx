'use client';

import React, { useState } from 'react';
import { Loader, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface BulkOperationManagerProps {
  selectedProductIds: string[];
  onOperationComplete?: () => void;
}

export function BulkOperationManager({
  selectedProductIds,
  onOperationComplete,
}: BulkOperationManagerProps) {
  const [operation, setOperation] = useState('publish');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleExecute = async () => {
    if (selectedProductIds.length === 0) {
      setError('No products selected');
      return;
    }

    setExecuting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/bulk/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          product_ids: selectedProductIds,
          data: Object.keys(formData).length > 0 ? formData : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      setResult(data.operation_result);
      onOperationComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
        <p className="text-sm text-gray-600 mt-1">
          {selectedProductIds.length} product(s) selected
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          ✕ {error}
        </div>
      )}

      {/* Operation Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-800 font-semibold">
            <CheckCircle className="w-5 h-5" />
            Operation Completed
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>Successful: {result.successful_items}/{result.total_items}</p>
            {result.failed_items > 0 && (
              <p className="text-red-600">Failed: {result.failed_items}</p>
            )}
          </div>
          {result.errors?.length > 0 && (
            <div className="bg-white rounded p-3 text-xs space-y-1">
              {result.errors.slice(0, 5).map((err: any, i: number) => (
                <p key={i} className="text-red-600">
                  {err.product_id}: {err.error}
                </p>
              ))}
              {result.errors.length > 5 && (
                <p className="text-gray-600">...and {result.errors.length - 5} more</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Operation Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Select Operation
        </label>
        <select
          value={operation}
          onChange={(e) => {
            setOperation(e.target.value);
            setFormData({});
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="publish">Publish Products</option>
          <option value="unpublish">Unpublish Products</option>
          <option value="delete">Delete Products</option>
          <option value="update_price">Update Price</option>
          <option value="update_sku">Update SKU</option>
          <option value="disable_variants">Disable Variants</option>
          <option value="enable_variants">Enable Variants</option>
        </select>
        <p className="text-xs text-gray-600 mt-1">
          {operation === 'publish' && 'Make products visible in your store'}
          {operation === 'unpublish' && 'Hide products from your store'}
          {operation === 'delete' && 'Permanently delete products (cannot be undone)'}
          {operation === 'update_price' && 'Update prices for all selected products'}
          {operation === 'update_sku' && 'Update SKU for all variants'}
          {operation === 'disable_variants' &&
            'Disable specific variants from being ordered'}
          {operation === 'enable_variants' && 'Enable previously disabled variants'}
        </p>
      </div>

      {/* Conditional Fields */}
      {operation === 'update_price' && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            New Price (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="29.99"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {operation === 'update_sku' && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            New SKU Prefix
          </label>
          <input
            type="text"
            placeholder="e.g., PROD-2024"
            value={formData.sku || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-600 mt-1">
            Variants will be numbered: PROD-2024-01, PROD-2024-02, etc.
          </p>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={executing || selectedProductIds.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
          executing || selectedProductIds.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {executing && <Loader className="w-4 h-4 animate-spin" />}
        {executing ? 'Processing...' : (
          <>
            <Play className="w-4 h-4" />
            Execute Operation
          </>
        )}
      </button>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
        <p className="font-semibold">Summary:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Operation will be applied to {selectedProductIds.length} product(s)</li>
          <li>Processing time depends on operation type and product count</li>
          {operation === 'delete' && (
            <li className="text-red-600">⚠️ This action cannot be undone</li>
          )}
          <li>You will see results immediately after completion</li>
        </ul>
      </div>
    </div>
  );
}
