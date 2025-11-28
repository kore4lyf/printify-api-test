'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FulfillmentTrackingViewer } from '@/components/FulfillmentTrackingViewer';

export default function TrackCampaignOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [searchedOrderId, setSearchedOrderId] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setSearchedOrderId(orderId.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Track Your Campaign Order
            </h1>
            <p className="text-xl text-slate-300">
              Enter your order ID to view real-time delivery tracking and fulfillment status
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl">Enter Order ID</CardTitle>
              <CardDescription>
                You received this ID when you completed your campaign contribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="order-id" className="text-sm font-medium text-slate-900">
                    Order ID *
                  </label>
                  <Input
                    id="order-id"
                    placeholder="e.g., 5a9c1d2e3f4g5h6i7j8k9l0m"
                    value={orderId}
                    onChange={(e) => {
                      setOrderId(e.target.value);
                      setError('');
                    }}
                    className="text-base"
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium text-base rounded-xl"
                >
                  Track Order
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </Button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> After completing your campaign contribution, you'll receive an
                  email with your order ID. You can use it here to track your merchandise delivery.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tracking Results */}
      {searchedOrderId && (
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => {
                  setSearchedOrderId('');
                  setOrderId('');
                }}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Search Another Order
              </button>
            </div>

            <Card className="border-0 shadow-lg p-8">
              <FulfillmentTrackingViewer orderId={searchedOrderId} />
            </Card>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="bg-white border-t border-slate-200 mt-12">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Where's my Order ID?</h3>
                <p className="text-slate-600">
                  Your Order ID was provided when you completed your campaign contribution. Check your
                  email for a confirmation message with your order details.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">How often is tracking updated?</h3>
                <p className="text-slate-600">
                  Tracking information updates automatically as your order progresses through fulfillment.
                  You can enable auto-refresh to see the latest status.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">What do the statuses mean?</h3>
                <p className="text-slate-600">
                  From pending through delivery, each status shows where your merchandise is in the
                  production and shipping process. See the status guide below your tracking info.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">How long does shipping take?</h3>
                <p className="text-slate-600">
                  Shipping times vary by location and method. Your estimated delivery date will be shown
                  in the tracking information once your order ships.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Can I track by email?</h3>
                <p className="text-slate-600">
                  We'll send you automatic email updates as your order progresses. You can also come back
                  here anytime with your Order ID to check status.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Need help?</h3>
                <p className="text-slate-600">
                  If you can't find your Order ID or have issues tracking, please check the confirmation
                  email from your campaign contribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Support More Campaigns</h2>
            <p className="text-slate-300 mb-6">
              Discover new music releases and contribute to more campaigns
            </p>
            <Link href="/">
              <Button className="bg-white text-slate-900 hover:bg-slate-50 font-medium px-8 py-3 h-auto rounded-xl">
                Browse All Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
