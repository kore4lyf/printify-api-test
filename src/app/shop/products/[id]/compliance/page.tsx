'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface GpsrData {
  product_id: string;
  product_title: string;
  safety_information: string;
  manufacturer_name: string;
  manufacturer_address: string;
  manufacturer_email: string;
  manufacturer_phone?: string;
  brand: string;
  model: string;
  warranty: string;
  product_warnings: string;
  care_instructions: string;
  last_updated?: string;
}

export default function CompliancePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<GpsrData>({
    product_id: id as string,
    product_title: '',
    safety_information: '',
    manufacturer_name: '',
    manufacturer_address: '',
    manufacturer_email: '',
    manufacturer_phone: '',
    brand: '',
    model: '',
    warranty: '',
    product_warnings: '',
    care_instructions: '',
  });

  // Fetch existing GPSR data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/compliance/gpsr?product_id=${id}`);
        if (res.ok) {
          const gpsr = await res.json();
          setData(gpsr);
        }
        // Even if compliance data doesn't exist, we continue to allow creation
        setError(null);
      } catch (err) {
        // Don't show error for missing data - user can create new
        console.error('Error loading GPSR data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/compliance/gpsr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save GPSR data');
      }

      setSuccess('GPSR compliance information saved successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="text-slate-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <Link href={`/shop/product/${id}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Product
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">EU GPSR Compliance</h1>
            <p className="text-slate-600">
              Manage General Product Safety Regulation (GPSR) information for EU market compliance
            </p>
          </div>

          {/* Info Banner */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Info className="w-5 h-5" />
                GPSR Compliance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800">
              <p>
                The General Product Safety Regulation (GPSR) requires all products placed on the EU market to have safety documentation 
                and clear identification of the manufacturer. This information is required for selling in the EU.
              </p>
            </CardContent>
          </Card>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Brand</label>
                    <Input
                      value={data.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Product brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Model</label>
                    <Input
                      value={data.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="Product model"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Warranty</label>
                  <Input
                    value={data.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.value)}
                    placeholder="Warranty period (e.g., 2 years)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Manufacturer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Manufacturer Information</CardTitle>
                <CardDescription>Required for EU market compliance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Manufacturer Name *</label>
                  <Input
                    value={data.manufacturer_name}
                    onChange={(e) => handleInputChange('manufacturer_name', e.target.value)}
                    placeholder="Full manufacturer name"
                    className="border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Address *</label>
                  <Input
                    value={data.manufacturer_address}
                    onChange={(e) => handleInputChange('manufacturer_address', e.target.value)}
                    placeholder="Full address (street, city, country)"
                    className="border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Email *</label>
                    <Input
                      type="email"
                      value={data.manufacturer_email}
                      onChange={(e) => handleInputChange('manufacturer_email', e.target.value)}
                      placeholder="contact@manufacturer.com"
                      className="border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Phone</label>
                    <Input
                      type="tel"
                      value={data.manufacturer_phone || ''}
                      onChange={(e) => handleInputChange('manufacturer_phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety & Care Information */}
            <Card>
              <CardHeader>
                <CardTitle>Safety & Care Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Safety Information</label>
                  <Textarea
                    value={data.safety_information}
                    onChange={(e) => handleInputChange('safety_information', e.target.value)}
                    placeholder="Describe any safety information relevant to this product"
                    rows={4}
                    className="border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Product Warnings</label>
                  <Textarea
                    value={data.product_warnings}
                    onChange={(e) => handleInputChange('product_warnings', e.target.value)}
                    placeholder="List any warnings or hazards associated with this product"
                    rows={4}
                    className="border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Care Instructions</label>
                  <Textarea
                    value={data.care_instructions}
                    onChange={(e) => handleInputChange('care_instructions', e.target.value)}
                    placeholder="Provide care and maintenance instructions (e.g., washing, storage)"
                    rows={4}
                    className="border-slate-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-auto py-3"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save GPSR Information'
                )}
              </Button>
              <Link href={`/shop/product/${id}`} className="flex-1">
                <Button variant="outline" className="w-full h-auto py-3">
                  Cancel
                </Button>
              </Link>
            </div>

            {/* Compliance Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className={`${data.manufacturer_name ? 'text-green-600' : 'text-gray-400'} font-bold`}>✓</span>
                  <span>Manufacturer name provided</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`${data.manufacturer_address ? 'text-green-600' : 'text-gray-400'} font-bold`}>✓</span>
                  <span>Manufacturer address provided</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`${data.manufacturer_email ? 'text-green-600' : 'text-gray-400'} font-bold`}>✓</span>
                  <span>Contact email provided</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`${data.safety_information ? 'text-green-600' : 'text-gray-400'} font-bold`}>✓</span>
                  <span>Safety information documented</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`${data.care_instructions ? 'text-green-600' : 'text-gray-400'} font-bold`}>✓</span>
                  <span>Care instructions provided</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
