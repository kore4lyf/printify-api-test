'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader, Download, Share2, Trash2 } from 'lucide-react';

interface MockupGeneratorProps {
  productId: string;
  variantId: number;
  uploadId: string;
}

interface GeneratedMockup {
  id: string;
  product_id: string;
  variant_id: number;
  mockup_url: string;
  thumbnail_url: string;
  generated_at: string;
  position: string;
}

export function MockupGenerator({ productId, variantId, uploadId }: MockupGeneratorProps) {
  const [mockups, setMockups] = useState<GeneratedMockup[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<GeneratedMockup | null>(null);
  const [position, setPosition] = useState('front');

  // Fetch existing mockups
  useEffect(() => {
    const fetchMockups = async () => {
      try {
        const response = await fetch(
          `/api/mockups/list?product_id=${productId}&variant_id=${variantId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMockups(data.mockups || []);
          if (data.mockups?.length > 0) {
            setSelectedMockup(data.mockups[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch mockups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMockups();
  }, [productId, variantId]);

  const handleGenerateMockup = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/mockups/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
          upload_id: uploadId,
          position,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate mockup');
      }

      setMockups([result.mockup, ...mockups]);
      setSelectedMockup(result.mockup);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating mockup');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadMockup = (mockup: GeneratedMockup) => {
    const link = document.createElement('a');
    link.href = mockup.mockup_url;
    link.download = `mockup-${mockup.id}.png`;
    link.click();
  };

  const handleShareMockup = async (mockup: GeneratedMockup) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my mockup!',
          text: 'Look at this product mockup',
          url: mockup.mockup_url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(mockup.mockup_url);
      alert('Mockup URL copied to clipboard');
    }
  };

  const handleDeleteMockup = (mockupId: string) => {
    setMockups(mockups.filter((m) => m.id !== mockupId));
    if (selectedMockup?.id === mockupId) {
      setSelectedMockup(mockups.find((m) => m.id !== mockupId) || null);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading mockups...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          Mockup Generator
        </h2>
        <p className="text-sm text-gray-600 mt-1">Generate and preview product mockups</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          ✕ {error}
        </div>
      )}

      {/* Generation Controls */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Print Position
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="front">Front Print</option>
            <option value="back">Back Print</option>
            <option value="left_sleeve">Left Sleeve</option>
            <option value="right_sleeve">Right Sleeve</option>
            <option value="chest">Chest Print</option>
          </select>
        </div>

        <button
          onClick={handleGenerateMockup}
          disabled={generating}
          className={`w-full py-2 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
            generating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {generating && <Loader className="w-4 h-4 animate-spin" />}
          {generating ? 'Generating...' : 'Generate Mockup'}
        </button>
      </div>

      {/* Main Mockup Display */}
      {selectedMockup ? (
        <div className="space-y-4">
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={selectedMockup.mockup_url}
              alt="Product mockup"
              className="w-full aspect-square object-cover"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleDownloadMockup(selectedMockup)}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button
              onClick={() => handleShareMockup(selectedMockup)}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button
              onClick={() => handleDeleteMockup(selectedMockup.id)}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>

          {/* Details */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm">
            <p className="text-gray-600">
              <span className="font-semibold">Position:</span> {selectedMockup.position}
            </p>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Generated:</span>{' '}
              {new Date(selectedMockup.generated_at).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No mockups yet. Generate one to get started!</p>
        </div>
      )}

      {/* Mockup Gallery */}
      {mockups.length > 1 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Generated Mockups</h3>
          <div className="grid grid-cols-4 gap-3">
            {mockups.map((mockup) => (
              <button
                key={mockup.id}
                onClick={() => setSelectedMockup(mockup)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedMockup?.id === mockup.id
                    ? 'border-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img
                  src={mockup.thumbnail_url}
                  alt={`Mockup ${mockup.position}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">About Mockups:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Preview how designs look on your products</li>
          <li>Generate multiple position variants</li>
          <li>Download for marketing and sales pages</li>
          <li>Share with team members or customers</li>
          <li>Mockups expire after 30 days</li>
        </ul>
      </div>
    </div>
  );
}
