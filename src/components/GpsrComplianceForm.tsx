'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react';

interface GpsrFormProps {
  productId: string;
  onSubmitSuccess?: () => void;
}

interface GpsrData {
  safety_information: string;
  manufacturer_details: {
    name: string;
    address: string;
    email: string;
  };
  product_details: {
    brand: string;
    model: string;
    warranty: string;
  };
  warnings: string;
  care_instructions: string;
}

export function GpsrComplianceForm({ productId, onSubmitSuccess }: GpsrFormProps) {
  const [formData, setFormData] = useState<GpsrData>({
    safety_information: '',
    manufacturer_details: {
      name: '',
      address: '',
      email: '',
    },
    product_details: {
      brand: '',
      model: '',
      warranty: '',
    },
    warnings: '',
    care_instructions: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingData, setExistingData] = useState<any | null>(null);

  // Fetch existing GPSR data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/compliance/gpsr?product_id=${productId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.compliance_status === 'COMPLETE') {
            setExistingData(data);
            setFormData({
              safety_information: data.safety_information || '',
              manufacturer_details: data.manufacturer_details || formData.manufacturer_details,
              product_details: data.product_details || formData.product_details,
              warnings: data.warnings || '',
              care_instructions: data.care_instructions || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch GPSR data:', err);
      }
    };

    fetchData();
  }, [productId]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/compliance/gpsr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save GPSR data');
      }

      setSubmitted(true);
      setExistingData(result.data);
      onSubmitSuccess?.();

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving GPSR data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-blue-900">GPSR Compliance (EU Market)</h2>
          <p className="text-sm text-blue-800 mt-1">
            General Product Safety Regulation (GPSR) requires manufacturers to provide safety information
            for products sold in the EU market.
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 p-3 rounded border">
        {existingData?.compliance_status === 'COMPLETE' ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">✓ GPSR information is complete</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">⚠ GPSR information needs to be completed</span>
          </>
        )}
      </div>

      {/* Error Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          ✕ {error}
        </div>
      )}

      {/* Success Message */}
      {submitted && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          ✓ GPSR compliance information saved successfully
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Safety Information */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Safety Information *
          </label>
          <textarea
            value={formData.safety_information}
            onChange={(e) => handleInputChange('safety_information', e.target.value)}
            placeholder="E.g., Contains no known hazards. For intended use only. Keep away from children under 3 years."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-600 mt-1">
            Describe any safety considerations, hazards, or precautions
          </p>
        </div>

        {/* Manufacturer Details */}
        <fieldset className="border border-gray-300 rounded-lg p-4">
          <legend className="text-sm font-semibold text-gray-900 px-2">
            Manufacturer Details *
          </legend>
          <div className="space-y-3 mt-3">
            <input
              type="text"
              placeholder="Company Name"
              value={formData.manufacturer_details.name}
              onChange={(e) => handleInputChange('manufacturer_details.name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Street Address, City, Postal Code, Country"
              value={formData.manufacturer_details.address}
              onChange={(e) => handleInputChange('manufacturer_details.address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="contact@manufacturer.com"
              value={formData.manufacturer_details.email}
              onChange={(e) => handleInputChange('manufacturer_details.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </fieldset>

        {/* Product Details */}
        <fieldset className="border border-gray-300 rounded-lg p-4">
          <legend className="text-sm font-semibold text-gray-900 px-2">
            Product Details *
          </legend>
          <div className="space-y-3 mt-3">
            <input
              type="text"
              placeholder="Brand (e.g., Printify)"
              value={formData.product_details.brand}
              onChange={(e) => handleInputChange('product_details.brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Model/SKU (e.g., T-Shirt-3001)"
              value={formData.product_details.model}
              onChange={(e) => handleInputChange('product_details.model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Warranty (e.g., 1 year manufacturer warranty)"
              value={formData.product_details.warranty}
              onChange={(e) => handleInputChange('product_details.warranty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </fieldset>

        {/* Warnings */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Warnings & Precautions *
          </label>
          <textarea
            value={formData.warnings}
            onChange={(e) => handleInputChange('warnings', e.target.value)}
            placeholder="E.g., Do not use if damaged. Not suitable for children under 3 years. Keep away from heat."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Care Instructions */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Care & Maintenance Instructions *
          </label>
          <textarea
            value={formData.care_instructions}
            onChange={(e) => handleInputChange('care_instructions', e.target.value)}
            placeholder="E.g., Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron on reverse side if needed."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Saving...' : 'Save GPSR Compliance Information'}
        </button>
      </form>

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-sm text-gray-700 space-y-2">
        <p className="font-semibold text-gray-900">Required for EU Market Compliance:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Product safety information and technical documentation</li>
          <li>Manufacturer/Importer identification with full contact details</li>
          <li>Product warnings and usage instructions</li>
          <li>Care and maintenance guidance</li>
          <li>Compliance with EU product standards</li>
        </ul>
        <p className="mt-3 italic">
          This information will be available to EU customers and may be required for customs/regulatory purposes.
        </p>
      </div>
    </div>
  );
}
