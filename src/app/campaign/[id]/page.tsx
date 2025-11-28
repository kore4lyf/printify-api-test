'use client';

import Link from "next/link";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCampaignById, getDummyCampaign } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContributionDialog } from "@/components/contribution-dialog";
import { useCart } from "@/app/shop/cart-context";

interface CampaignPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { id } = use(params);
  const campaign = getCampaignById(id) || getDummyCampaign(id);
  const router = useRouter();
  const { addToCart } = useCart();
  const [rewardProduct, setRewardProduct] = useState<any>(null);
  const [contributionDialog, setContributionDialog] = useState<{
    isOpen: boolean;
    option: any;
  }>({
    isOpen: false,
    option: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/merchandise');
        const data = await res.json();
        if (res.ok && data.data && data.data.length > 0) {
          const randomProduct = data.data[Math.floor(Math.random() * data.data.length)];
          setRewardProduct(randomProduct);
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    };
    fetchProducts();
  }, []);



  const handleContribute = (contributionOptionId: string) => {
    const option = campaign.contributionOptions.find(opt => opt.id === contributionOptionId);
    if (option) {
      setContributionDialog({
        isOpen: true,
        option,
      });
    }
  };

  const handleCloseDialog = () => {
    setContributionDialog({
      isOpen: false,
      option: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Campaigns
          </Link>
        </div>
      </div>

      {/* Campaign Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content Side */}
              <div className="text-white space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    {campaign.title}
                  </h1>

                  <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-xl">
                    {campaign.description}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <button
                    onClick={() => {
                      const contributionSection = document.getElementById('contribution-options');
                      contributionSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Choose Your Contribution
                    <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Image Side */}
              <div className="relative">
                <div className="relative z-10">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <img
                      src={campaign.image}
                      alt={`${campaign.title} campaign image`}
                      className="w-full h-full object-cover"
                      loading="lazy"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Options */}
      <div id="contribution-options" className="bg-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Contribution</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Select the level that best supports this campaign and get exclusive rewards.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {campaign.contributionOptions.map((option, index) => (
                <div
                  key={option.id}
                  className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${index === campaign.contributionOptions.length - 1
                      ? 'border-slate-900 shadow-lg scale-105 relative'
                      : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  {index === campaign.contributionOptions.length - 1 && (
                    <div className="bg-slate-900 text-white text-center py-2 px-4 text-sm font-medium">
                      Most Popular
                    </div>
                  )}

                  <div className="p-6 md:p-8">
                    {/* Title and Description */}
                    <div className="text-center mb-6">
                      <h3 className={`text-lg md:text-xl font-bold mb-2 ${index === campaign.contributionOptions.length - 1 ? 'text-slate-900' : 'text-slate-900'
                        }`}>
                        {option.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{option.description}</p>
                    </div>

                    {/* Price */}
                    <div className={`text-center mb-6 ${index === campaign.contributionOptions.length - 1 ? 'text-slate-900' : 'text-slate-900'
                      }`}>
                      <div className="text-3xl md:text-4xl font-bold">
                        ${(option.amount / 100).toFixed(2)}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {option.includesMerch ? (
                        <>
                          <div className="flex items-center gap-3 p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">Merchandise Included</p>
                              <p className="text-slate-600 text-xs">Exclusive Printify merchandise</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">Digital Access</p>
                              <p className="text-slate-600 text-xs">Early streaming and downloads</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">Digital Access</p>
                            <p className="text-slate-600 text-xs">Downloads and personal referral batch</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full h-10 md:h-12 font-medium text-base md:text-lg rounded-xl transition-all duration-200 ${index === campaign.contributionOptions.length - 1
                          ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg'
                          : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50'
                        }`}
                      onClick={() => handleContribute(option.id)}
                    >
                      Contribute ${(option.amount / 100).toFixed(2)}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* Trust Section */}
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">Secure & Transparent</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mb-4">Your Support Makes a Difference</h3>

              <p className="text-slate-600 mb-6 leading-relaxed">
                All contributions directly fund music production and artist development. Digital rewards are delivered instantly via email,
                and physical merchandise is professionally printed and shipped through our trusted Printify partner.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-900">Instant Delivery</p>
                  <p className="text-xs text-slate-600">Digital rewards delivered immediately</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-900">Quality Merchandise</p>
                  <p className="text-xs text-slate-600">Premium Printify products</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-900">Artist Support</p>
                  <p className="text-xs text-slate-600">100% of funds go to music</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Dialog */}
      <ContributionDialog
        isOpen={contributionDialog.isOpen}
        onClose={handleCloseDialog}
        contributionOption={contributionDialog.option}
        campaignTitle={campaign.title}
        rewardProduct={rewardProduct}
      />
    </div>
  );
}
