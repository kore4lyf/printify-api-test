'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface Webhook {
  id: string;
  topic: string;
  address: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    topic: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const webhookTopics = [
    'order.created',
    'order.updated',
    'order.fulfilled',
    'order.failed',
    'order.cancelled',
    'product.created',
    'product.updated',
    'product.deleted',
    'sku.updated',
  ];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/webhooks');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWebhooks(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.topic) errors.topic = 'Topic is required';
    if (!formData.address) errors.address = 'URL is required';
    else if (!isValidUrl(formData.address)) errors.address = 'Invalid URL format';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topic,
          address: formData.address,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setWebhooks([...webhooks, data]);
      setFormData({ topic: '', address: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create webhook');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setWebhooks(webhooks.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete webhook');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/printify-test" className="text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to API Test
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Webhook Management</h1>
          <p className="text-slate-600">Configure and monitor Printify webhook events</p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">How webhooks work:</p>
                <p>When events occur (orders created, products updated, etc.), Printify will send POST requests to your webhook URL with event data. Test events are sent as JSON.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Create Webhook Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Event Topic *</Label>
                  <Select value={formData.topic} onValueChange={(value) => setFormData({ ...formData, topic: value })}>
                    <SelectTrigger id="topic" className="mt-1">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {webhookTopics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.topic && <p className="text-red-500 text-sm mt-1">{formErrors.topic}</p>}
                </div>

                <div>
                  <Label htmlFor="address">Webhook URL *</Label>
                  <Input
                    id="address"
                    type="url"
                    placeholder="https://example.com/webhook"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1"
                  />
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white">
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create Webhook
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false);
                    setFormData({ topic: '', address: '' });
                    setFormErrors({});
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        {!showForm && (
          <div className="mb-8 flex gap-2">
            <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Webhook
            </Button>
            <Link href="/webhooks/logs">
              <Button variant="outline">
                View Logs
              </Button>
            </Link>
          </div>
        )}

        {/* Webhooks List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </div>
        ) : webhooks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600 text-lg font-medium mb-6">No webhooks configured</p>
              <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {webhook.active ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        <h3 className="font-semibold text-slate-900">
                          {webhook.topic}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          webhook.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {webhook.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 break-all mb-2">
                        {webhook.address}
                      </p>
                      {webhook.created_at && (
                        <p className="text-xs text-slate-500">
                          Created {new Date(webhook.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg transition-colors ml-4"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
