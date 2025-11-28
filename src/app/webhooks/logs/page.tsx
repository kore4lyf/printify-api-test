'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2, Clock, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface WebhookLog {
  id: string;
  webhook_id: string;
  topic: string;
  status: 'success' | 'failed' | 'pending';
  payload: Record<string, any>;
  response?: string;
  status_code?: number;
  created_at: string;
  delivered_at?: string;
  attempt?: number;
}

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    fetchLogs();
    // Poll for new logs every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Mock webhook logs
      const mockLogs: WebhookLog[] = [
        {
          id: '1',
          webhook_id: 'wh_1',
          topic: 'order.created',
          status: 'success',
          payload: { order_id: '12345', total: 9999 },
          response: 'OK',
          status_code: 200,
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          delivered_at: new Date(Date.now() - 4 * 60000).toISOString(),
          attempt: 1,
        },
        {
          id: '2',
          webhook_id: 'wh_1',
          topic: 'order.updated',
          status: 'failed',
          payload: { order_id: '12346', status: 'shipped' },
          response: 'Connection timeout',
          status_code: 0,
          created_at: new Date(Date.now() - 2 * 60000).toISOString(),
          attempt: 1,
        },
        {
          id: '3',
          webhook_id: 'wh_2',
          topic: 'product.updated',
          status: 'success',
          payload: { product_id: 'prod_1', title: 'Updated Product' },
          response: 'Received',
          status_code: 200,
          created_at: new Date(Date.now() - 1 * 60000).toISOString(),
          delivered_at: new Date(Date.now() - 1 * 60000).toISOString(),
          attempt: 1,
        },
      ];
      setLogs(mockLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Delete this log entry?')) return;

    setDeleting(logId);
    try {
      // In a real app, this would delete the log via API
      setLogs(logs.filter((l) => l.id !== logId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredLogs = logs.filter(
    (log) => filter === 'all' || log.status === filter
  );

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="text-slate-600">Loading webhook logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/webhooks" className="text-slate-600 hover:text-slate-900 mb-4 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Webhooks
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Webhook Event Logs</h1>
          <p className="text-slate-600">View and debug webhook deliveries</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2">
          {['all', 'success', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 text-sm">
                  ({logs.filter((l) => l.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600 text-lg font-medium">
                {filter === 'all' ? 'No webhook events yet' : `No ${filter} events`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-6">
                    {/* Left Side */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(log.status)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 capitalize">
                            {log.topic}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg text-sm">
                        <div>
                          <p className="text-slate-600 mb-1">Status Code</p>
                          <p className="font-mono font-semibold text-slate-900">
                            {log.status_code || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Response</p>
                          <p className="font-medium text-slate-900 truncate">
                            {log.response || 'Pending'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Attempts</p>
                          <p className="font-semibold text-slate-900">{log.attempt || 1}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Delivered</p>
                          <p className="font-medium text-slate-900">
                            {log.delivered_at
                              ? new Date(log.delivered_at).toLocaleTimeString()
                              : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${getStatusColor(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>

                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="h-5 w-5 text-slate-600" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-96 overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Event Details</DialogTitle>
                            <DialogDescription>
                              {log.topic} - {log.status.toUpperCase()}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 mb-2">
                                Payload
                              </p>
                              <pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-auto border border-slate-200">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </div>
                            {log.response && (
                              <div>
                                <p className="text-sm font-semibold text-slate-900 mb-2">
                                  Response
                                </p>
                                <pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-auto border border-slate-200">
                                  {log.response}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <button
                        onClick={() => handleDelete(log.id)}
                        disabled={deleting === log.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete log"
                      >
                        {deleting === log.id ? (
                          <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5 text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            Logs are automatically refreshed every 5 seconds. Failed deliveries will be retried up to 3 times.
          </p>
        </div>
      </div>
    </div>
  );
}
