'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';

interface UploadedFile {
  id: string;
  file_name: string;
  url: string;
}

export default function CreateProductPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    blueprint_id: '',
    print_provider_id: '',
    variant_ids: [] as number[],
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploadedFiles(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData = {
        title: form.title,
        description: form.description,
        tags: form.tags.split(',').map(tag => tag.trim()),
        blueprint_id: parseInt(form.blueprint_id),
        print_provider_id: parseInt(form.print_provider_id),
        variants: form.variant_ids.map(id => ({ id, price: 2000 })), // Default price
        print_areas: [{
          variant_ids: form.variant_ids,
          placeholders: [{
            position: 'front',
            images: uploadedFiles.map(file => ({ id: file.id, name: file.file_name, type: 'image/png', height: 1000, width: 1000, x: 0.5, y: 0.5, scale: 1, angle: 0 })),
          }],
        }],
      };

      const res = await fetch('/api/merchandise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Create New Product</h1>
            <p className="text-slate-600">Upload images and configure your product details</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blueprint_id">Blueprint ID</Label>
                  <Input
                    id="blueprint_id"
                    type="number"
                    value={form.blueprint_id}
                    onChange={(e) => setForm({ ...form, blueprint_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="print_provider_id">Print Provider ID</Label>
                  <Input
                    id="print_provider_id"
                    type="number"
                    value={form.print_provider_id}
                    onChange={(e) => setForm({ ...form, print_provider_id: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="variant_ids">Variant IDs (comma separated)</Label>
                <Input
                  id="variant_ids"
                  value={form.variant_ids.join(', ')}
                  onChange={(e) => setForm({ ...form, variant_ids: e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) })}
                  required
                />
              </div>

              <div>
                <Label>Upload Images</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(handleFileUpload);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div className="mt-2 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-2">
                      <span className="text-sm">{file.file_name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 h-auto rounded-xl font-medium">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
                Create Product
              </Button>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            {result && (
              <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <h3 className="font-semibold text-emerald-900 mb-2">Product Created Successfully!</h3>
                <p className="text-emerald-700 mb-4">ID: {result.id}</p>
                <Link href={`/shop/product/${result.id}`}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">View Product</Button>
                </Link>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
