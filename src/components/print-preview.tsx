'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';

interface PrintArea {
  position: string;
  width: number;
  height: number;
  x: number;
  y: number;
  unit: string;
}

interface PrintPreviewProps {
  productImage: string;
  productTitle: string;
  printAreas?: PrintArea[];
  selectedVariant?: string;
}

export function PrintPreview({
  productImage,
  productTitle,
  printAreas = [],
  selectedVariant,
}: PrintPreviewProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(printAreas[0]?.position || null);

  const mockPrintAreas: Record<string, PrintArea> = {
    front: {
      position: 'front',
      width: 150,
      height: 200,
      x: 100,
      y: 150,
      unit: 'mm',
    },
    back: {
      position: 'back',
      width: 150,
      height: 200,
      x: 100,
      y: 150,
      unit: 'mm',
    },
    left_sleeve: {
      position: 'left_sleeve',
      width: 80,
      height: 120,
      x: 20,
      y: 80,
      unit: 'mm',
    },
    right_sleeve: {
      position: 'right_sleeve',
      width: 80,
      height: 120,
      x: 280,
      y: 80,
      unit: 'mm',
    },
  };

  const getDisplayPrintAreas = () => {
    if (printAreas.length > 0) {
      return printAreas.reduce((acc, area) => {
        acc[area.position] = area;
        return acc;
      }, {} as Record<string, PrintArea>);
    }
    return mockPrintAreas;
  };

  const areas = getDisplayPrintAreas();
  const availablePositions = Object.keys(areas);

  if (availablePositions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Print Preview</CardTitle>
          <CardDescription>Mockup preview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              Print areas not available for this product
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Print Preview</CardTitle>
        <CardDescription>See where your design will print</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedArea || availablePositions[0]}
          onValueChange={setSelectedArea}
          className="w-full"
        >
          <TabsList className="grid w-full gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(availablePositions.length, 4)}, 1fr)` }}>
            {availablePositions.map((position) => (
              <TabsTrigger key={position} value={position} className="text-xs capitalize">
                {position.replace(/_/g, ' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {availablePositions.map((position) => {
            const area = areas[position];
            return (
              <TabsContent key={position} value={position} className="mt-6">
                <div className="space-y-4">
                  {/* Product Mockup */}
                  <div className="bg-gradient-to-b from-slate-100 to-slate-50 rounded-lg p-6 flex items-center justify-center min-h-80 border border-slate-200">
                    <div className="relative w-full max-w-sm aspect-square rounded-lg overflow-hidden bg-white shadow-lg">
                      {/* Product Image */}
                      <img
                        src={productImage}
                        alt={productTitle}
                        className="w-full h-full object-cover"
                      />

                      {/* Print Area Overlay */}
                      <div
                        className="absolute border-2 border-dashed border-blue-400 bg-blue-50/30 flex items-center justify-center"
                        style={{
                          left: `${(area.x / 400) * 100}%`,
                          top: `${(area.y / 400) * 100}%`,
                          width: `${(area.width / 400) * 100}%`,
                          height: `${(area.height / 400) * 100}%`,
                        }}
                      >
                        <div className="text-center pointer-events-none">
                          <p className="text-xs font-medium text-blue-700 bg-white/80 px-2 py-1 rounded whitespace-nowrap">
                            Print Area
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Print Area Details */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Width</p>
                      <p className="font-semibold text-slate-900">
                        {area.width} {area.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Height</p>
                      <p className="font-semibold text-slate-900">
                        {area.height} {area.unit}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-600 mb-1">Position</p>
                      <p className="font-semibold text-slate-900 capitalize">
                        {position.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Design Requirements */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 text-sm mb-2">
                      Design Requirements
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                      <li>Minimum dimensions: {area.width}x{area.height} {area.unit}</li>
                      <li>Use high-quality images (300+ DPI recommended)</li>
                      <li>Avoid text and important elements near edges</li>
                      <li>Accepted formats: PNG, JPEG, SVG</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
