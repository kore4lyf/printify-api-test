import Link from "next/link";
import { campaigns } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Support Music Releases
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Help independent artists bring their music to life. Support album launches, EP releases, and singles collections
              and get exclusive merchandise from our Printify shop.
            </p>
            <div className="mt-8">
              <Link href="/shop">
                <Button className="px-8 py-3 h-auto bg-slate-900 hover:bg-slate-800 text-white font-medium text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  Visit Our Shop
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Active Campaigns</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Choose a campaign to support and get exclusive rewards for your contribution.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              {campaigns.map((campaign, index) => (
                <div
                  key={campaign.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Campaign Image */}
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img
                      src={campaign.image}
                      alt={`${campaign.title} campaign image`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Campaign Content */}
                  <div className="p-4 md:p-6 lg:p-8">
                    <div className="text-left mb-4">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{campaign.title}</h3>
                      <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl">{campaign.description}</p>
                    </div>


                    {/* CTA */}
                    <div className="text-center">
                      <Link href={`/campaign/${campaign.id}`}>
                        <Button className="px-8 py-3 h-auto bg-slate-900 hover:bg-slate-800 text-white font-medium text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                          Join Campaign
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tracking & API Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-t border-slate-700">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Track Your Order or Test the API</h2>
              <p className="text-slate-300">View real-time delivery tracking or explore Printify integration</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Track Order Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Track Your Order</h3>
                </div>
                <p className="text-slate-300 mb-6">Enter your order ID to view real-time delivery tracking and fulfillment status of your campaign merchandise.</p>
                <Link href="/campaign/track">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl h-auto px-6 py-3">
                    Track Delivery
                  </Button>
                </Link>
              </div>

              {/* Test API Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Test Printify API</h3>
                </div>
                <p className="text-slate-300 mb-6">Explore our Printify integration and see how the order fulfillment and API endpoints work with real test data.</p>
                <Link href="/printify-test">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl h-auto px-6 py-3">
                    Test API
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
