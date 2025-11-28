'use client';

import { useState, useEffect } from 'react';

import { ContributionOption } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressIndicator } from '@/components/progress-indicator';
import { FormInputWithValidation } from '@/components/form-input-with-validation';
import { usePrintifyShipping, usePrintifyOrder } from '@/lib/printify-utils/hooks';

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: Array<{ src: string; position: string }>;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    sku: string;
    options: Record<string, string>;
  }>;
}

interface ContributionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contributionOption: ContributionOption | null;
  campaignTitle: string;
  rewardProduct: any;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  zip: string;
  country: string;
}

export function ContributionDialog({
  isOpen,
  onClose,
  contributionOption,
  campaignTitle,
  rewardProduct,
}: ContributionDialogProps) {
  const [step, setStep] = useState<'confirm' | 'shipping' | 'processing' | 'success' | 'error'>('confirm');
   const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
     firstName: '',
     lastName: '',
     email: '',
     phone: '',
     address1: '',
     address2: '',
     city: '',
     region: '',
     zip: '',
     country: 'US', // Default to US
   });
   const [error, setError] = useState<string>('');
   const [orderId, setOrderId] = useState<string | null>(null);

   // Printify hooks
   const {
     isCalculating,
     shippingOptions: hookShippingOptions,
     calculationError,
     calculateShipping,
     resetShippingCalculation
   } = usePrintifyShipping();

  const {
    isSubmitting,
    submissionError,
    submitOrder,
    resetOrderSubmission
  } = usePrintifyOrder();




  const resetDialog = () => {
    setStep('confirm');
    setShippingInfo({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      region: '',
      zip: '',
      country: 'US',
    });
    setError('');
    setOrderId(null);
    resetShippingCalculation();
    resetOrderSubmission();
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const handleConfirmContribution = () => {
    if (contributionOption?.includesMerch) {
      setStep('shipping');
    } else {
      handleProcessContribution();
    }
  };

  const handleProcessContribution = async () => {
    if (!contributionOption) return;

    setStep('processing');
    setError('');

    try {
      if (contributionOption.includesMerch && rewardProduct) {
        // Use the first variant of the reward product
        const firstVariant = rewardProduct.variants[0];

        // Create Printify order for merchandise
        const orderResponse = await submitOrder({
          line_items: [{ product_id: rewardProduct.id, variant_id: firstVariant.id, quantity: 1 }],
          shipping_method: 1, // Default shipping method
          address_to: {
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            email: shippingInfo.email,
            phone: shippingInfo.phone || '',
            country: shippingInfo.country,
            region: shippingInfo.region,
            address1: shippingInfo.address1,
            address2: shippingInfo.address2 || '',
            city: shippingInfo.city,
            zip: shippingInfo.zip,
          },
        });

        if (!orderResponse.success) {
          throw new Error(orderResponse.error || 'Failed to create order');
        }

        const order = orderResponse.data;

        if (order && order.id) {
          setOrderId(order.id);
          setStep('success');
        } else {
          throw new Error('Failed to create Printify order');
        }
      } else {
        // For non-merchandise contributions, just simulate success
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
        setStep('success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('error');
    }
  };

  const handleCalculateShipping = async () => {
    if (!contributionOption || !rewardProduct) return;

    // Use the first variant of the reward product
    const firstVariant = rewardProduct.variants[0];

    const shippingResponse = await calculateShipping(
      [{ product_id: rewardProduct.id, variant_id: firstVariant.id, quantity: 1 }],
      {
        first_name: shippingInfo.firstName,
        last_name: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: shippingInfo.phone || '',
        country: shippingInfo.country,
        region: shippingInfo.region,
        address1: shippingInfo.address1,
        address2: shippingInfo.address2 || '',
        city: shippingInfo.city,
        zip: shippingInfo.zip,
      }
    );

    if (shippingResponse.success) {
       // Proceed with order submission
       handleProcessContribution();
     } else {
       setError(shippingResponse.error || 'Failed to calculate shipping');
       setStep('error');
     }
  };

  const updateShippingInfo = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const isShippingValid = () => {
    return shippingInfo.firstName &&
      shippingInfo.lastName &&
      shippingInfo.email &&
      shippingInfo.address1 &&
      shippingInfo.city &&
      shippingInfo.region &&
      shippingInfo.zip &&
      shippingInfo.country;
  };

  const progressSteps = [
     { id: 'confirm', label: 'Confirm' },
     ...(contributionOption?.includesMerch ? [{ id: 'shipping', label: 'Shipping' }] : []),
     { id: 'processing', label: 'Processing' },
   ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 bg-white border-0 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {step === 'confirm' && (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirm Contribution</h2>
                <p className="text-slate-600 text-sm">Support <span className="font-semibold text-slate-900">{campaignTitle}</span></p>
              </div>
              <div className="">
                <ProgressIndicator steps={progressSteps} currentStep={step} />
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-6 overflow-y-auto flex-1">
              {/* Contribution Details */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{contributionOption?.title}</h3>
                  <p className="text-slate-600 text-sm">{contributionOption?.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-slate-900">
                      ${(contributionOption?.amount ? contributionOption.amount / 100 : 0).toFixed(2)}
                    </p>
                  </div>
                  {contributionOption?.includesMerch && (
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200">
                      Includes Merchandise
                    </div>
                  )}
                </div>
              </div>

              {/* Merchandise Preview */}
              {contributionOption?.includesMerch && (
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-4 text-center">Your Reward</h4>

                  {rewardProduct ? (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      {rewardProduct.images && rewardProduct.images.length > 0 && (
                        <div className="flex-shrink-0">
                          <img
                            src={rewardProduct.images[0].src}
                            alt={rewardProduct.title}
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-slate-900 text-sm mb-1 truncate">{rewardProduct.title}</h5>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">{rewardProduct.description}</p>
                        {rewardProduct.variants && rewardProduct.variants.length > 0 && (
                          <p className="text-xs text-slate-500">{rewardProduct.variants[0].title}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-red-600">Unable to load product details. Please try again.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmContribution}
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 'shipping' && (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Shipping Information</h2>
                <p className="text-slate-600 text-sm">We need your details to deliver your merchandise</p>
              </div>
              <ProgressIndicator steps={progressSteps} currentStep={step} />
            </div>

            {/* Content */}
            <div className="px-8 py-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInputWithValidation
                      id="firstName"
                      label="First Name"
                      placeholder="John"
                      value={shippingInfo.firstName}
                      onChange={(val) => updateShippingInfo('firstName', val)}
                      validation={{
                        required: true,
                        minLength: 2,
                        maxLength: 50,
                      }}
                    />
                    <FormInputWithValidation
                      id="lastName"
                      label="Last Name"
                      placeholder="Doe"
                      value={shippingInfo.lastName}
                      onChange={(val) => updateShippingInfo('lastName', val)}
                      validation={{
                        required: true,
                        minLength: 2,
                        maxLength: 50,
                      }}
                    />
                  </div>
                  <FormInputWithValidation
                    id="email"
                    label="Email Address"
                    placeholder="john@example.com"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(val) => updateShippingInfo('email', val)}
                    validation={{
                      required: true,
                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    }}
                  />
                  <FormInputWithValidation
                    id="phone"
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                    value={shippingInfo.phone}
                    onChange={(val) => updateShippingInfo('phone', val)}
                    optional
                  />
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Shipping Address</h3>
                  {calculationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{calculationError}</p>
                    </div>
                  )}
                  <FormInputWithValidation
                    id="address1"
                    label="Street Address"
                    placeholder="123 Main Street"
                    value={shippingInfo.address1}
                    onChange={(val) => updateShippingInfo('address1', val)}
                    validation={{
                      required: true,
                      minLength: 5,
                    }}
                  />
                  <FormInputWithValidation
                    id="address2"
                    label="Apartment, Suite, etc."
                    placeholder="Apartment 4B"
                    value={shippingInfo.address2}
                    onChange={(val) => updateShippingInfo('address2', val)}
                    optional
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInputWithValidation
                      id="city"
                      label="City"
                      placeholder="New York"
                      value={shippingInfo.city}
                      onChange={(val) => updateShippingInfo('city', val)}
                      validation={{
                        required: true,
                        minLength: 2,
                      }}
                    />
                    <FormInputWithValidation
                      id="region"
                      label="State/Province"
                      placeholder="NY"
                      value={shippingInfo.region}
                      onChange={(val) => updateShippingInfo('region', val)}
                      validation={{
                        required: true,
                        minLength: 2,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInputWithValidation
                      id="zip"
                      label="ZIP/Postal Code"
                      placeholder="10001"
                      value={shippingInfo.zip}
                      onChange={(val) => updateShippingInfo('zip', val)}
                      validation={{
                        required: true,
                        minLength: 3,
                      }}
                    />
                    <FormInputWithValidation
                      id="country"
                      label="Country"
                      placeholder="United States"
                      value={shippingInfo.country}
                      onChange={(val) => updateShippingInfo('country', val)}
                      validation={{
                        required: true,
                        minLength: 2,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setStep('confirm')}
                className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              >
                Back
              </Button>
              <Button
                onClick={handleProcessContribution}
                disabled={!isShippingValid()}
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing Contribution</h2>
                <p className="text-slate-600 text-sm">Please wait while we finalize your support</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-slate-900">
                    {isCalculating ? 'Calculating shipping costs...' : 'Processing your contribution...'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {isCalculating ? 'Please wait while we calculate shipping options' : 'This may take a few moments'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-emerald-50 to-green-50 border-b border-emerald-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
                <p className="text-slate-600 text-sm">Your contribution has been successfully processed</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-6">
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <div className="text-center space-y-3">
                  <p className="text-lg font-semibold text-slate-900">
                    🎉 Thank you for supporting <span className="text-emerald-700">{campaignTitle}</span>!
                  </p>
                  {contributionOption?.includesMerch ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-700">Your merchandise order has been created.</p>
                      <p className="text-sm text-slate-600">You'll receive shipping updates and tracking information via email.</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">Your digital rewards will be delivered to your email shortly.</p>
                  )}
                </div>
              </div>

              {/* Order ID Section */}
              {orderId && (
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold mb-2">Your Order ID</p>
                      <p className="text-2xl font-bold text-slate-900 font-mono break-all">{orderId}</p>
                      <p className="text-xs text-slate-500 mt-2">Save this ID to track your order</p>
                    </div>
                    {contributionOption?.includesMerch && (
                      <div className="pt-4 border-t border-slate-100">
                        <a
                          href={`/campaign/track`}
                          className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium text-sm"
                        >
                          Track Your Delivery
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex-shrink-0">
              <Button
                onClick={handleClose}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
              >
                Close
              </Button>
            </div>
          </>
        )}

        {step === 'error' && (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-red-50 to-rose-50 border-b border-red-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Something Went Wrong</h2>
                <p className="text-slate-600 text-sm">We encountered an error processing your contribution</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="text-center space-y-3">
                  <p className="font-semibold text-red-900">Error Details:</p>
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-sm text-slate-600">Please try again or contact support if the issue persists.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setStep(contributionOption?.includesMerch ? 'shipping' : 'confirm')}
                className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              >
                Try Again
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
