'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, RefreshCw, Plus, Store, Package, Settings, Webhook, ShoppingCart, ImageIcon, Trash2, Upload } from 'lucide-react';

// Define types based on actual API responses
interface Shop {
  id: number;
  title: string;
  sales_channel: string;
}

interface Blueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

interface CatalogBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

interface Provider {
  id: number;
  title: string;
  location: {
    address1: string;
    city: string;
    country: string;
    region: string;
    zip: string;
  };
}

interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  options: any[];
  variants: any[];
  images: any[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  is_locked: boolean;
  blueprint_id: number;
  user_id: number;
  shop_id: number;
  print_provider_id: number;
  print_areas: any[];
  print_details: any[];
  sales_channel_properties: any[];
  is_printify_express_eligible: boolean;
  is_printify_express_enabled: boolean;
  is_economy_shipping_eligible: boolean;
  is_economy_shipping_enabled: boolean;
  is_deleted: boolean;
  original_product_id: string;
  views: any[];
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

interface Order {
  // Assuming similar to products, but empty in test
  [key: string]: any;
}

interface Webhook {
  topic: string;
  url: string;
  shop_id: number;
  id: string;
}

interface GPSRItem {
  title: string;
  text: string;
}

interface APISection {
  title: string;
  description: string;
  scope: string;
  icon: React.ReactNode;
  action: () => Promise<void>;
  data: any; // Keep as any for flexibility, or use union types
  loading: boolean;
  error: string | null;
}

export default function PrintifyAPIPage() {
   const [productId, setProductId] = useState('');
   const [orderId, setOrderId] = useState('');
   const [webhookId, setWebhookId] = useState('');
   const [productForm, setProductForm] = useState({ title: '', description: '', blueprint_id: '5', print_provider_id: '5' });
   const [orderForm, setOrderForm] = useState({ product_id: '', variant_id: '', quantity: '1', firstName: '', lastName: '', email: '', country: 'US', region: '', address1: '', city: '', zip: '' });
   const [webhookForm, setWebhookForm] = useState({ topic: 'order:created', url: '' });
  const [blueprintId, setBlueprintId] = useState('');

  const [sections, setSections] = useState<APISection[]>([
    {
      title: 'Merchant Shops',
      description: 'Get access to Merchant shops',
      scope: 'shops.read',
      icon: <Store className="h-5 w-5" />,
      action: async () => await handleAction('shops'),
      data: [],
      loading: false,
      error: null,
    },
    {
      title: 'Catalog Blueprints',
      description: 'Get access to Printify Product catalog',
      scope: 'catalog.read',
      icon: <Package className="h-5 w-5" />,
      action: async () => await handleAction('blueprints'),
      data: [],
      loading: false,
      error: null,
    },
    {
      title: 'Print Providers',
      description: 'Read available print providers',
      scope: 'print_providers.read',
      icon: <Settings className="h-5 w-5" />,
      action: async () => await handleAction('providers'),
      data: [],
      loading: false,
      error: null,
    },
    {
      title: 'Shop Products',
      description: 'Get access to Merchant shop products',
      scope: 'products.read',
      icon: <Package className="h-5 w-5" />,
      action: async () => await handleAction('products'),
      data: [],
      loading: false,
      error: null,
    },
    {
      title: 'Shop Orders',
      description: 'Get access to Printify orders',
      scope: 'orders.read',
      icon: <ShoppingCart className="h-5 w-5" />,
      action: async () => await handleAction('orders'),
      data: [],
      loading: false,
      error: null,
    },
    {
      title: 'Uploaded Files',
      description: 'Get access to Merchant uploaded files',
      scope: 'uploads.read',
      icon: <ImageIcon className="h-5 w-5" />,
      action: async () => await handleAction('uploads'),
      data: [],
      loading: false,
      error: null,
    },
    {
      title: 'Webhooks',
      description: 'Read installed Webhooks',
      scope: 'webhooks.read',
      icon: <Webhook className="h-5 w-5" />,
      action: async () => await handleAction('webhooks'),
      data: [],
      loading: false,
      error: null,
    },
    {
      title: 'Product GPSR',
      description: 'Get GPSR safety information for products',
      scope: 'products.read',
      icon: <Package className="h-5 w-5" />,
      action: async () => await handleAction('gpsr'),
      data: [],
      loading: false,
      error: null,
    },
    {
      title: 'Catalog V2',
      description: 'Access V2 catalog with enhanced product data',
      scope: 'catalog.read',
      icon: <Store className="h-5 w-5" />,
      action: async () => await handleAction('catalog-v2'),
      data: [],
      loading: false,
      error: null,
    },
    {
      title: 'Create Product',
      description: 'Create a new product in the shop',
      scope: 'products.write',
      icon: <Plus className="h-5 w-5" />,
      action: async () => await handleAction('create-product'),
      data: null,
      loading: false,
      error: null,
    },
    {
      title: 'Create Order',
      description: 'Submit a new order',
      scope: 'orders.write',
      icon: <ShoppingCart className="h-5 w-5" />,
      action: async () => await handleAction('create-order'),
      data: null,
      loading: false,
      error: null,
    },
    {
      title: 'Create Webhook',
      description: 'Install a new webhook',
      scope: 'webhooks.write',
      icon: <Webhook className="h-5 w-5" />,
      action: async () => await handleAction('create-webhook'),
      data: null,
      loading: false,
      error: null,
    },
    {
      title: 'Fetch Specific Product',
      description: 'Get details of a specific product by ID',
      scope: 'products.read',
      icon: <Package className="h-5 w-5" />,
      action: async () => {}, // Just open dialog, fetch happens via button inside
      data: null,
      loading: false,
      error: null,
    },
    {
      title: 'Unpublish Product',
      description: 'Unpublish a product from sales channels',
      scope: 'products.write',
      icon: <Plus className="h-5 w-5" />,
      action: async () => await handleUnpublishProduct(),
      data: null,
      loading: false,
      error: null,
    },
    {
      title: 'Publish Product',
      description: 'Publish a product to sales channels',
      scope: 'products.write',
      icon: <Plus className="h-5 w-5" />,
      action: async () => await handlePublishProduct(),
      data: null,
      loading: false,
      error: null,
    },
    {
      title: 'Fetch Specific Order',
      description: 'Get details of a specific order by ID',
      scope: 'orders.read',
      icon: <ShoppingCart className="h-5 w-5" />,
      action: async () => await handleSpecificOrder(),
      data: null,
      loading: false,
      error: null,
    },
    {
      title: 'Update Webhook',
      description: 'Update an existing webhook',
      scope: 'webhooks.write',
      icon: <Webhook className="h-5 w-5" />,
      action: async () => await handleUpdateWebhook(),
      data: null,
      loading: false,
      error: null,
    },
    {
      title: 'Publish Products Page',
      description: 'Go to the product publishing page',
      scope: 'products.publish',
      icon: <Upload className="h-5 w-5" />,
      action: () => { window.location.href = '/shop/publish-products'; return Promise.resolve(); },
      data: null,
      loading: false,
      error: null,
    },
  ]);

  const handleAction = async (type: string) => {
    setSections(prev => prev.map(section => {
      if (section.scope.startsWith(type.split('.')[0])) {
        return { ...section, loading: true, error: null };
      }
      return section;
    }));

    try {
      let endpoint = '';
      let data: any = null;

      switch (type) {
        case 'shops':
          endpoint = '/api/shops';
          const shopsRes = await fetch(endpoint);
          data = await shopsRes.json();
          if (!shopsRes.ok) throw new Error(data.error || `HTTP ${shopsRes.status}`);
          break;

        case 'blueprints':
          endpoint = '/api/blueprints';
          const blueprintsRes = await fetch(endpoint);
          data = await blueprintsRes.json();
          if (!blueprintsRes.ok) throw new Error(data.error || `HTTP ${blueprintsRes.status}`);
          break;

        case 'providers':
          endpoint = '/api/providers';
          const providersRes = await fetch(endpoint);
          data = await providersRes.json();
          if (!providersRes.ok) throw new Error(data.error || `HTTP ${providersRes.status}`);
          break;

        case 'products':
          endpoint = '/api/merchandise';
          const merchRes = await fetch(endpoint);
          data = await merchRes.json();
          if (!merchRes.ok) throw new Error(data.error || `HTTP ${merchRes.status}`);
          break;

        case 'orders':
          endpoint = '/api/orders';
          const ordersRes = await fetch(endpoint);
          data = await ordersRes.json();
          if (!ordersRes.ok) throw new Error(data.error || `HTTP ${ordersRes.status}`);
          break;

        case 'uploads':
          endpoint = '/api/uploads';
          const uploadsRes = await fetch(endpoint);
          data = await uploadsRes.json();
          if (!uploadsRes.ok) throw new Error(data.error || `HTTP ${uploadsRes.status}`);
          break;

        case 'webhooks':
          endpoint = '/api/webhooks';
          const webhooksRes = await fetch(endpoint);
          data = await webhooksRes.json();
          if (!webhooksRes.ok) throw new Error(data.error || `HTTP ${webhooksRes.status}`);
          break;

        case 'gpsr':
          // First get products to get a product ID
          const gpsrProductsRes = await fetch('/api/merchandise');
          const products = await gpsrProductsRes.json();
          if (!gpsrProductsRes.ok) throw new Error(products.error || `HTTP ${gpsrProductsRes.status}`);
          if (products.length === 0) {
            data = [];
          } else {
            const productId = products[0].id;
            const gpsrRes = await fetch(`/api/gpsr?product_id=${productId}`);
            data = await gpsrRes.json();
            if (!gpsrRes.ok) throw new Error(data.error || `HTTP ${gpsrRes.status}`);
            data = [data]; // Wrap in array for consistency
          }
          break;

        case 'catalog-v2':
          endpoint = '/api/blueprints-v2';
          const catalogV2Res = await fetch(endpoint);
          data = await catalogV2Res.json();
          if (!catalogV2Res.ok) throw new Error(data.error || `HTTP ${catalogV2Res.status}`);
          break;

        case 'create-product':
           if (!productForm.title) throw new Error('Product title is required');
           endpoint = '/api/merchandise';
           const productData = {
             title: productForm.title,
             description: productForm.description,
             blueprint_id: parseInt(productForm.blueprint_id),
             print_provider_id: parseInt(productForm.print_provider_id),
             variants: [{ id: 123, price: 1000 }],
             print_areas: [{ variant_ids: [123], placeholders: [{ position: 'front', images: [] }] }]
           };
           const createProductRes = await fetch(endpoint, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(productData),
           });
           data = await createProductRes.json();
           if (!createProductRes.ok) throw new Error(data.error || `HTTP ${createProductRes.status}`);
           data = [data]; // Wrap for consistency
           break;

        case 'create-order':
           if (!orderForm.product_id || !orderForm.firstName || !orderForm.lastName || !orderForm.email || !orderForm.address1 || !orderForm.city || !orderForm.zip) {
             throw new Error('Please fill in all required fields');
           }
           endpoint = '/api/orders';
           const orderData = {
             line_items: [{ product_id: orderForm.product_id, variant_id: parseInt(orderForm.variant_id), quantity: parseInt(orderForm.quantity) }],
             shipping_method: 1,
             address_to: {
               first_name: orderForm.firstName,
               last_name: orderForm.lastName,
               email: orderForm.email,
               country: orderForm.country,
               region: orderForm.region,
               address1: orderForm.address1,
               city: orderForm.city,
               zip: orderForm.zip
             }
           };
           const createOrderRes = await fetch(endpoint, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(orderData),
           });
           data = await createOrderRes.json();
           if (!createOrderRes.ok) throw new Error(data.error || `HTTP ${createOrderRes.status}`);
           data = [data];
           break;

        case 'create-webhook':
           if (!webhookForm.url) throw new Error('Webhook URL is required');
           endpoint = '/api/webhooks';
           const webhookData = {
             topic: webhookForm.topic,
             url: webhookForm.url
           };
           const createWebhookRes = await fetch(endpoint, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(webhookData),
           });
           data = await createWebhookRes.json();
           if (!createWebhookRes.ok) throw new Error(data.error || `HTTP ${createWebhookRes.status}`);
           data = [data];
           break;


      }

      setSections(prev => prev.map(section => {
        if (section.scope.startsWith(type.split('.')[0])) {
          return { ...section, data, loading: false };
        }
        return section;
      }));
    } catch (error) {
      setSections(prev => prev.map(section => {
        if (section.scope.startsWith(type.split('.')[0])) {
          return { ...section, loading: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
        return section;
      }));
    }
  };

  const handleSpecificProduct = async () => {
    console.log('handleSpecificProduct called with productId:', productId);
    if (!productId.trim()) {
      alert('Please enter a Product ID');
      return;
    }
    setSections(prev => prev.map(section =>
      section.title === 'Fetch Specific Product' ? { ...section, loading: true, error: null } : section
    ));
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      console.log('Fetch specific product response:', response.status, data);
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setSections(prev => prev.map(section =>
        section.title === 'Fetch Specific Product' ? { ...section, data, loading: false } : section
      ));
    } catch (error) {
      setSections(prev => prev.map(section =>
        section.title === 'Fetch Specific Product' ? { ...section, loading: false, error: error instanceof Error ? error.message : 'Unknown error' } : section
      ));
    }
  };

  const handleUnpublishProduct = async () => {
    if (!productId.trim()) {
      alert('Please enter a Product ID');
      return;
    }
    setSections(prev => prev.map(section =>
      section.title === 'Unpublish Product' ? { ...section, loading: true, error: null } : section
    ));
    try {
      const response = await fetch(`/api/products/${productId}/unpublish`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setSections(prev => prev.map(section =>
        section.title === 'Unpublish Product' ? { ...section, data, loading: false } : section
      ));
    } catch (error) {
      setSections(prev => prev.map(section =>
        section.title === 'Unpublish Product' ? { ...section, loading: false, error: error instanceof Error ? error.message : 'Unknown error' } : section
      ));
    }
  };

  const handlePublishProduct = async () => {
    if (!productId.trim()) {
      alert('Please enter a Product ID');
      return;
    }
    setSections(prev => prev.map(section =>
      section.title === 'Publish Product' ? { ...section, loading: true, error: null } : section
    ));
    try {
      const response = await fetch(`/api/products/${productId}/publish`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setSections(prev => prev.map(section =>
        section.title === 'Publish Product' ? { ...section, data, loading: false } : section
      ));
    } catch (error) {
      setSections(prev => prev.map(section =>
        section.title === 'Publish Product' ? { ...section, loading: false, error: error instanceof Error ? error.message : 'Unknown error' } : section
      ));
    }
  };

  const handleSpecificOrder = async () => {
    if (!orderId.trim()) {
      alert('Please enter an Order ID');
      return;
    }
    setSections(prev => prev.map(section =>
      section.title === 'Fetch Specific Order' ? { ...section, loading: true, error: null } : section
    ));
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setSections(prev => prev.map(section =>
        section.title === 'Fetch Specific Order' ? { ...section, data, loading: false } : section
      ));
    } catch (error) {
      setSections(prev => prev.map(section =>
        section.title === 'Fetch Specific Order' ? { ...section, loading: false, error: error instanceof Error ? error.message : 'Unknown error' } : section
      ));
    }
  };

  const handleUpdateWebhook = async () => {
    if (!webhookId.trim()) {
      alert('Please enter a Webhook ID');
      return;
    }
    setSections(prev => prev.map(section =>
      section.title === 'Update Webhook' ? { ...section, loading: true, error: null } : section
    ));
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'order:created', url: 'https://example.com/updated-webhook' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setSections(prev => prev.map(section =>
        section.title === 'Update Webhook' ? { ...section, data, loading: false } : section
      ));
    } catch (error) {
      setSections(prev => prev.map(section =>
        section.title === 'Update Webhook' ? { ...section, loading: false, error: error instanceof Error ? error.message : 'Unknown error' } : section
      ));
    }
  };

  const clearAllData = () => {
    setSections(prev => prev.map(section => ({
      ...section,
      data: null,
      loading: false,
      error: null,
    })));
  };

  const renderData = (section: APISection) => {
    if (section.loading) {
      return <p className="text-sm text-muted-foreground">Loading...</p>;
    }
    if (section.error) {
      return <p className="text-sm text-destructive">Error: {section.error}</p>;
    }
  };

  const renderDialogData = (section: APISection) => {
    if (section.loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (section.error) {
      return (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">Error: {section.error}</p>
        </div>
      );
    }

    if (!section.data) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No data available</p>
          <p className="text-xs text-gray-500 mt-2">Data: {JSON.stringify(section.data)}</p>
        </div>
      );
    }

    // Handle Catalog V2 data
    if (section.title === 'Catalog V2' && typeof section.data === 'object' && 'available_endpoints' in section.data) {
      return (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900"><strong>Note:</strong> {section.data.message}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Available Endpoints:</p>
            <div className="space-y-2">
              {Object.entries(section.data.available_endpoints).map(([key, endpoint]) => (
                <div key={key} className="p-2 bg-muted/50 rounded border border-border/50">
                  <div className="text-xs font-medium text-foreground capitalize">{key.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">{endpoint as string}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-slate-100 rounded-lg">
            <p className="text-xs font-medium text-foreground mb-1">Example:</p>
            <p className="text-xs text-slate-700 font-mono">{section.data.example}</p>
          </div>
        </div>
      );
    }

    // Handle GPSR data
    if (section.title === 'Product GPSR' && Array.isArray(section.data)) {
      const gpsrItems = section.data.slice(0, 3) as GPSRItem[];
      return (
        <div className="space-y-2">
          {gpsrItems.map((item, index) => (
            <div key={index}>
              <p><strong>{item.title}:</strong> {item.text}</p>
            </div>
          ))}
        </div>
      );
    }

    // Handle paginated data
    if (section.data && typeof section.data === 'object' && 'data' in section.data) {
      const paginated = section.data as PaginatedResponse<any>;
      const items = paginated.data.slice(0, 3);
      return (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground font-medium">
            Found {paginated.total} item{paginated.total !== 1 ? 's' : ''} (showing 3 samples)
          </div>
          <div className="space-y-2">
            {items.map((item: any, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                {renderItemDetails(item, section.scope)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Handle array data
    if (Array.isArray(section.data)) {
      const items = section.data.slice(0, 3);
      return (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground font-medium">
            Found {section.data.length} item{section.data.length !== 1 ? 's' : ''} (showing 3 samples)
          </div>
          <div className="space-y-2">
            {items.map((item: any, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                {renderItemDetails(item, section.scope)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Handle single object (e.g., create responses)
    try {
      return (
        <pre className="text-xs overflow-auto max-h-96">
          {JSON.stringify(section.data, null, 2)}
        </pre>
      );
    } catch (e) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Data received but could not display</p>
          <p className="text-xs text-gray-500 mt-2">Type: {typeof section.data}</p>
        </div>
      );
    }
  };

  const renderItemDetails = (item: any, scope: string) => {
    switch (scope) {
      case 'shops.read':
        return (
          <>
            <div className="font-medium text-sm text-foreground">{item.title || `Shop ${item.id}`}</div>
            <div className="text-xs text-muted-foreground">ID: {item.id}, Sales Channel: {item.sales_channel}</div>
          </>
        );
      case 'catalog.read':
        return (
          <>
            <div className="font-medium text-sm text-foreground">{item.title || `Blueprint ${item.id}`}</div>
            <div className="text-xs text-muted-foreground">{item.brand} - {item.model}</div>
            <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {item.description?.replace(/<[^>]*>/g, '') || 'No description'}
            </div>
            {item.images && item.images.length > 0 && (
              <img src={item.images[0]} alt={item.title} className="w-16 h-16 object-cover mt-2 rounded" />
            )}
          </>
        );
      case 'print_providers.read':
        return (
          <>
            <div className="font-medium text-sm text-foreground">{item.title || `Provider ${item.id}`}</div>
            <div className="text-xs text-muted-foreground mt-1 space-y-1">
              <div>{item.location?.address1}</div>
              <div>{item.location?.city}, {item.location?.region} {item.location?.zip}</div>
              <div className="text-gray-400">{item.location?.country}</div>
            </div>
          </>
        );
      case 'products.read':
        return (
          <>
            <div className="font-medium text-sm text-foreground">{item.title || `Product ${item.id}`}</div>
            <div className="text-xs text-muted-foreground">{item.variants?.length || 0} variants, Status: {item.visible ? 'Visible' : 'Hidden'}</div>
            {item.images && item.images.length > 0 && (
              <img src={item.images[0].src} alt={item.title} className="w-16 h-16 object-cover mt-2 rounded" />
            )}
          </>
        );
      case 'orders.read':
        return (
          <>
            <div className="font-medium text-sm text-foreground">Order {item.id || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Status: {item.status || 'Unknown'}</div>
          </>
        );
      case 'uploads.read':
        return (
          <>
            <div className="font-medium text-sm text-foreground">{item.file_name}</div>
            <div className="text-xs text-muted-foreground">{(item.size / 1024).toFixed(1)}KB, {item.mime_type}</div>
            {item.preview_url && (
              <img src={item.preview_url} alt={item.file_name} className="w-16 h-16 object-cover mt-2 rounded" />
            )}
          </>
        );
      case 'webhooks.read':
        return (
          <>
            <div className="font-medium text-sm text-foreground">{item.topic || `Webhook ${item.id}`}</div>
            <div className="text-xs text-muted-foreground">URL: {item.url}</div>
          </>
        );
      default:
        return (
          <pre className="text-xs">{JSON.stringify(item, null, 2)}</pre>
        );
    }
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

      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Printify API
            </h1>

            <Button
              onClick={clearAllData}
              className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-6 py-3 rounded-xl font-medium"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </div>
      </div>

      {/* API Sections */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {sections.map((section, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">{section.title}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {section.scope}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">{section.description}</p>

                  <div className="mb-6">
                    {renderData(section)}
                  </div>



                  {(section.title === 'Unpublish Product' || section.title === 'Publish Product') && (
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Enter Product ID"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      />
                      <Button
                        onClick={section.title === 'Unpublish Product' ? handleUnpublishProduct : handlePublishProduct}
                        disabled={section.loading}
                        size="sm"
                        className="px-4"
                      >
                        {section.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Go'}
                      </Button>
                    </div>
                  )}







                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={section.action}
                        disabled={section.loading}
                        className={`w-full h-12 font-medium rounded-xl transition-all duration-200 ${section.scope.includes('.write')
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50'
                          }`}
                      >
                        {section.loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </>
                        ) : (
                          <>
                            {section.scope.includes('.write') ? (
                              <Plus className="h-4 w-4 mr-2" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            {section.title === 'Fetch Specific Product' ? 'Open Dialog' : section.scope.includes('.write') ? 'Create Sample' : 'Fetch Data'}
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                       <DialogHeader>
                         <DialogTitle>{section.title}</DialogTitle>
                       </DialogHeader>
                       
                       {section.title === 'Fetch Specific Product' && (
                         <div className="space-y-4">
                           <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                             <p className="text-xs text-amber-900">Tip: Click "Fetch Data" on the "Shop Products" section first to see available product IDs</p>
                           </div>
                           <div className="flex gap-2">
                             <input
                               type="text"
                               placeholder="Enter Product ID"
                               value={productId}
                               onChange={(e) => setProductId(e.target.value)}
                               className="flex-1 p-2 border border-gray-300 rounded text-sm"
                             />
                             <Button
                               onClick={handleSpecificProduct}
                               disabled={section.loading}
                               className="bg-slate-900 hover:bg-slate-800 text-white"
                             >
                               {section.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                             </Button>
                           </div>
                           {renderDialogData(section)}
                         </div>
                       )}

                       {(section.title === 'Unpublish Product' || section.title === 'Publish Product') && (
                         <div className="space-y-4">
                           <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                             <p className="text-xs text-red-900"><strong>Important:</strong> Use Printify product IDs (numeric), NOT MongoDB IDs from your database.</p>
                             <p className="text-xs text-red-900 mt-1">Example: Use "104" not "6926d1099d09cfbad803e34b"</p>
                             <p className="text-xs text-red-900 mt-2">Get valid IDs by clicking "Fetch Data" on "Shop Products" section first.</p>
                           </div>
                           <div className="flex gap-2">
                             <input
                               type="text"
                               placeholder="Enter Printify Product ID (numeric)"
                               value={productId}
                               onChange={(e) => setProductId(e.target.value)}
                               className="flex-1 p-2 border border-gray-300 rounded text-sm"
                             />
                             <Button
                               onClick={section.title === 'Unpublish Product' ? handleUnpublishProduct : handlePublishProduct}
                               disabled={section.loading}
                               className="bg-slate-900 hover:bg-slate-800 text-white"
                             >
                               {section.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Execute'}
                             </Button>
                           </div>
                           {renderDialogData(section)}
                         </div>
                       )}

                       {section.title === 'Fetch Specific Order' && (
                         <div className="space-y-4">
                           <div className="flex gap-2">
                             <input
                               type="text"
                               placeholder="Enter Order ID"
                               value={orderId}
                               onChange={(e) => setOrderId(e.target.value)}
                               className="flex-1 p-2 border border-gray-300 rounded text-sm"
                             />
                             <Button
                               onClick={handleSpecificOrder}
                               disabled={section.loading}
                               className="bg-slate-900 hover:bg-slate-800 text-white"
                             >
                               {section.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                             </Button>
                           </div>
                           {renderDialogData(section)}
                         </div>
                       )}

                       {section.title === 'Update Webhook' && (
                         <div className="space-y-4">
                           <div className="flex gap-2">
                             <input
                               type="text"
                               placeholder="Enter Webhook ID"
                               value={webhookId}
                               onChange={(e) => setWebhookId(e.target.value)}
                               className="flex-1 p-2 border border-gray-300 rounded text-sm"
                             />
                             <Button
                               onClick={handleUpdateWebhook}
                               disabled={section.loading}
                               className="bg-slate-900 hover:bg-slate-800 text-white"
                             >
                               {section.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                             </Button>
                           </div>
                           {renderDialogData(section)}
                         </div>
                       )}

                       {section.title === 'Create Product' && (
                         <div className="space-y-4">
                           <div className="space-y-3">
                             <input
                               type="text"
                               placeholder="Product Title"
                               value={productForm.title}
                               onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                               className="w-full p-2 border border-gray-300 rounded text-sm"
                             />
                             <input
                               type="text"
                               placeholder="Description"
                               value={productForm.description}
                               onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                               className="w-full p-2 border border-gray-300 rounded text-sm"
                             />
                             <input
                               type="number"
                               placeholder="Blueprint ID"
                               value={productForm.blueprint_id}
                               onChange={(e) => setProductForm({ ...productForm, blueprint_id: e.target.value })}
                               className="w-full p-2 border border-gray-300 rounded text-sm"
                             />
                             <input
                               type="number"
                               placeholder="Print Provider ID"
                               value={productForm.print_provider_id}
                               onChange={(e) => setProductForm({ ...productForm, print_provider_id: e.target.value })}
                               className="w-full p-2 border border-gray-300 rounded text-sm"
                             />
                             <Button
                               onClick={() => handleAction('create-product')}
                               disabled={section.loading}
                               className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                             >
                               {section.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                               Create Product
                             </Button>
                           </div>
                           {renderDialogData(section)}
                         </div>
                       )}

                       {section.title === 'Create Order' && (
                         <div className="space-y-4">
                           <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
                             <input
                               type="text"
                               placeholder="Product ID"
                               value={orderForm.product_id}
                               onChange={(e) => setOrderForm({ ...orderForm, product_id: e.target.value })}
                               className="w-full p-2 border border-gray-300 rounded text-xs"
                             />
                             <div className="grid grid-cols-2 gap-2">
                               <input type="number" placeholder="Variant ID" value={orderForm.variant_id} onChange={(e) => setOrderForm({ ...orderForm, variant_id: e.target.value })} className="p-2 border border-gray-300 rounded text-xs" />
                               <input type="number" placeholder="Qty" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} className="p-2 border border-gray-300 rounded text-xs" />
                             </div>
                             <input type="text" placeholder="First Name" value={orderForm.firstName} onChange={(e) => setOrderForm({ ...orderForm, firstName: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-xs" />
                             <input type="text" placeholder="Last Name" value={orderForm.lastName} onChange={(e) => setOrderForm({ ...orderForm, lastName: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-xs" />
                             <input type="email" placeholder="Email" value={orderForm.email} onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-xs" />
                             <input type="text" placeholder="Address" value={orderForm.address1} onChange={(e) => setOrderForm({ ...orderForm, address1: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-xs" />
                             <input type="text" placeholder="City" value={orderForm.city} onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-xs" />
                             <input type="text" placeholder="Region" value={orderForm.region} onChange={(e) => setOrderForm({ ...orderForm, region: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-xs" />
                             <input type="text" placeholder="ZIP" value={orderForm.zip} onChange={(e) => setOrderForm({ ...orderForm, zip: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-xs" />
                             <select value={orderForm.country} onChange={(e) => setOrderForm({ ...orderForm, country: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-xs">
                               <option value="US">United States</option>
                               <option value="CA">Canada</option>
                               <option value="UK">United Kingdom</option>
                               <option value="AU">Australia</option>
                             </select>
                           </div>
                           <Button
                             onClick={() => handleAction('create-order')}
                             disabled={section.loading}
                             className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                           >
                             {section.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                             Create Order
                           </Button>
                           {renderDialogData(section)}
                         </div>
                       )}

                       {section.title === 'Create Webhook' && (
                         <div className="space-y-4">
                           <div className="space-y-3">
                             <select value={webhookForm.topic} onChange={(e) => setWebhookForm({ ...webhookForm, topic: e.target.value })} className="w-full p-2 border border-gray-300 rounded text-sm">
                               <option value="order:created">order:created</option>
                               <option value="order:updated">order:updated</option>
                               <option value="order:shipped">order:shipped</option>
                               <option value="order:cancelled">order:cancelled</option>
                             </select>
                             <input
                               type="url"
                               placeholder="Webhook URL"
                               value={webhookForm.url}
                               onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                               className="w-full p-2 border border-gray-300 rounded text-sm"
                             />
                             <Button
                               onClick={() => handleAction('create-webhook')}
                               disabled={section.loading}
                               className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                             >
                               {section.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                               Create Webhook
                             </Button>
                           </div>
                           {renderDialogData(section)}
                         </div>
                       )}

                       {!['Fetch Specific Product', 'Unpublish Product', 'Publish Product', 'Fetch Specific Order', 'Update Webhook', 'Create Product', 'Create Order', 'Create Webhook'].includes(section.title) && (
                         renderDialogData(section)
                       )}
                     </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
