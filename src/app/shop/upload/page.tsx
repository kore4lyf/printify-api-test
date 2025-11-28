'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Trash2, Download, Copy, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface Upload {
  id: string;
  file_name: string;
  width: number;
  height: number;
  size: number;
  mime_type: string;
  md5_hash: string;
  url: string;
  preview_url: string;
  created_at: string;
}

export default function UploadPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    setError(null);
    setSuccess(null);

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, WebP, or SVG.');
      return;
    }

    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUploads([data, ...uploads]);
      setSuccess(`Image "${file.name}" uploaded successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (uploadId: string) => {
    if (!confirm('Delete this image?')) return;

    setDeleting(uploadId);
    try {
      const res = await fetch(`/api/uploads/${uploadId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setUploads(uploads.filter((u) => u.id !== uploadId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('URL copied to clipboard');
    setTimeout(() => setSuccess(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/shop" className="text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shop
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Image Upload</h1>
          <p className="text-slate-600">Upload images for product designs and mockups</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Upload Design Image</CardTitle>
                <CardDescription>Add images to use as product designs</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Drag & Drop Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    disabled={uploading}
                  />

                  <div className="flex flex-col items-center gap-3">
                    {uploading ? (
                      <Loader2 className="h-12 w-12 text-slate-400 animate-spin" />
                    ) : (
                      <Upload className="h-12 w-12 text-slate-400" />
                    )}
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-1">
                        {uploading ? 'Uploading...' : 'Drop image here or click to select'}
                      </p>
                      <p className="text-sm text-slate-600">
                        Supports JPG, PNG, WebP, SVG. Max 10MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 text-sm mb-2">
                    Recommended Image Specifications
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Minimum dimensions: 600x600 pixels</li>
                    <li>Recommended: 2000x2000 pixels or higher</li>
                    <li>Resolution: 300 DPI for print quality</li>
                    <li>Format: PNG (transparent) or JPG (solid background)</li>
                    <li>File size: Under 10MB</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Upload History */}
            {uploads.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Uploads</CardTitle>
                  <CardDescription>{uploads.length} image(s) uploaded</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <img
                              src={upload.preview_url || upload.url}
                              alt={upload.file_name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 mb-1 truncate">
                              {upload.file_name}
                            </h4>
                            <div className="grid grid-cols-3 gap-4 text-xs text-slate-600 mb-3">
                              <div>
                                <p className="text-slate-500 mb-0.5">Dimensions</p>
                                <p className="font-medium text-slate-900">
                                  {upload.width}x{upload.height}px
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 mb-0.5">Size</p>
                                <p className="font-medium text-slate-900">
                                  {formatFileSize(upload.size)}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 mb-0.5">Type</p>
                                <p className="font-medium text-slate-900">
                                  {upload.mime_type.split('/')[1].toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">
                              Uploaded {new Date(upload.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => copyToClipboard(upload.url)}
                              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Copy URL"
                            >
                              <Copy className="h-5 w-5 text-slate-600" />
                            </button>
                            <a
                              href={upload.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="h-5 w-5 text-slate-600" />
                            </a>
                            <button
                              onClick={() => handleDelete(upload.id)}
                              disabled={deleting === upload.id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleting === upload.id ? (
                                <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5 text-red-600" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Total Uploads</p>
                  <p className="text-3xl font-bold text-slate-900">{uploads.length}</p>
                </div>
                {uploads.length > 0 && (
                  <>
                    <div className="border-t pt-4">
                      <p className="text-xs text-slate-600 mb-1">Total Size</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatFileSize(uploads.reduce((sum, u) => sum + u.size, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Latest Upload</p>
                      <p className="text-sm text-slate-900">
                        {new Date(uploads[0].created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/shop/create-product">
                  <Button variant="outline" className="w-full justify-start text-left">
                    Create Product
                  </Button>
                </Link>
                <Link href="/shop/products">
                  <Button variant="outline" className="w-full justify-start text-left">
                    My Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-base text-amber-900">Tip</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-amber-900">
                Upload high-quality images for best print results. Transparent PNG images work well for designs that will be placed on different product colors.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
