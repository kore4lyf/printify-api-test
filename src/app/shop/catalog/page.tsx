'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Package, Search } from 'lucide-react';

interface Blueprint {
  id: number;
  title: string;
  brand: string;
  images: string[];
}

export default function CatalogPage() {
  const [items, setItems] = useState<Blueprint[]>([]);
  const [filtered, setFiltered] = useState<Blueprint[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/blueprints');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Handle array or paginated response
        let itemsArray: Blueprint[] = [];
        if (Array.isArray(data)) {
          itemsArray = data;
        } else if (data && typeof data === 'object' && 'data' in data) {
          itemsArray = data.data;
        }

        setItems(itemsArray);
        setTotalItems(itemsArray.length);
        setTotalPages(Math.ceil(itemsArray.length / itemsPerPage));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
        setItems([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filteredItems = items.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredItems);
    setTotalItems(filteredItems.length);
    setTotalPages(Math.ceil(filteredItems.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when search changes
  }, [search, items, itemsPerPage]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
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
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Product Catalog</h1>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">Browse our complete collection of professional printing products</p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 text-base pl-10 rounded-xl border-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="container mx-auto px-6 py-20">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </div>
        </div>
      ) : error ? (
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
              <h3 className="font-semibold text-red-900">Error Loading Catalog</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {getCurrentPageItems().map((item) => (
                <Link key={item.id} href={`/shop/product/${item.id}`}>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    <div className="aspect-square bg-slate-100 overflow-hidden">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-slate-600 text-sm">{item.brand || 'Unknown Brand'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing {getCurrentPageItems().length} of {totalItems} blueprints
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 rounded-xl"
                    size="sm"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 p-0 rounded-lg ${
                            pageNum === currentPage
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                          }`}
                          size="sm"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 rounded-xl"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
