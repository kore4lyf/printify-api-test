'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Package, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';

interface TrackingEvent {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
  details?: Record<string, any>;
}

interface TrackingData {
  order_id: string;
  current_status: string;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  events: TrackingEvent[];
  estimated_delivery: string | null;
  carrier: string | null;
  tracking_number: string | null;
  last_updated: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5 text-gray-500" />,
  confirmed: <CheckCircle className="w-5 h-5 text-blue-500" />,
  printed: <Package className="w-5 h-5 text-blue-600" />,
  quality_check: <AlertCircle className="w-5 h-5 text-amber-500" />,
  packaged: <Package className="w-5 h-5 text-green-500" />,
  shipped: <Truck className="w-5 h-5 text-green-600" />,
  in_transit: <Truck className="w-5 h-5 text-green-600" />,
  out_for_delivery: <Truck className="w-5 h-5 text-blue-600" />,
  delivered: <CheckCircle className="w-5 h-5 text-green-700" />,
  failed: <AlertCircle className="w-5 h-5 text-red-500" />,
  cancelled: <AlertCircle className="w-5 h-5 text-red-600" />,
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  printed: 'Printed',
  quality_check: 'Quality Check',
  packaged: 'Packaged',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

interface FulfillmentTrackingViewerProps {
  orderId: string;
}

export function FulfillmentTrackingViewer({ orderId }: FulfillmentTrackingViewerProps) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const response = await fetch(`/api/fulfillment/tracking?order_id=${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch tracking info');
        const data = await response.json();
        setTracking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading tracking');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();

    // Auto-refresh every 60 seconds if enabled (fallback until webhooks integrated)
    // TODO: Remove auto-refresh once Printify webhooks are integrated for real-time updates
    const interval = autoRefresh ? setInterval(fetchTracking, 60000) : undefined;
    return () => interval && clearInterval(interval);
  }, [orderId, autoRefresh]);

  if (loading) return <div className="p-4 text-gray-500">Loading tracking info...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!tracking) return <div className="p-4 text-gray-500">No tracking data available</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>
          <p className="text-sm text-gray-600 mt-1">Order ID: {tracking.order_id}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4"
          />
          Auto-refresh
        </label>
      </div>

      {/* Status Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-blue-700 uppercase font-semibold tracking-wide">Current Status</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {statusLabels[tracking.current_status]}
            </p>
          </div>
          <div className="text-5xl">{statusIcons[tracking.current_status]}</div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-200">
          <div>
            <p className="text-xs text-blue-600 uppercase font-semibold">Progress</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{tracking.progress_percentage.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 uppercase font-semibold">Step</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {tracking.current_step} of {tracking.total_steps}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-600 uppercase font-semibold">Last Updated</p>
            <p className="text-sm text-blue-800 mt-1">
              {new Date(tracking.last_updated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      {(tracking.carrier || tracking.tracking_number) && (
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Shipping Information</h3>
          <div className="space-y-2">
            {tracking.carrier && (
              <div className="flex justify-between">
                <span className="text-gray-600">Carrier</span>
                <span className="font-medium text-gray-900">{tracking.carrier}</span>
              </div>
            )}
            {tracking.tracking_number && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking Number</span>
                <span className="font-mono font-medium text-gray-900">{tracking.tracking_number}</span>
              </div>
            )}
            {tracking.estimated_delivery && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery</span>
                <span className="font-medium text-gray-900">
                  {new Date(tracking.estimated_delivery).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-700">Fulfillment Progress</p>
          <p className="text-sm text-gray-600">{tracking.progress_percentage.toFixed(0)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${tracking.progress_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
        <div className="space-y-4">
          {tracking.events.map((event, index) => (
            <div key={index} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center">{statusIcons[event.status]}</div>
                {index < tracking.events.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                )}
              </div>

              {/* Event details */}
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {statusLabels[event.status]}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-2">📍 {event.location}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">Fulfillment Status Guide</p>
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">●</span> Pending: Order awaiting production start
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">●</span> Printed: Design printed on product
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500">●</span> Quality Check: Product being inspected
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">●</span> Shipped: Package picked up by carrier
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">●</span> In Transit: On the way to destination
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">●</span> Out for Delivery: Final mile delivery
          </div>
        </div>
      </div>
    </div>
  );
}
