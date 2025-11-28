// Printify API Type Definitions
// Based on https://developers.printify.com/

export interface PrintifyShop {
  id: string;
  title: string;
  sales_channel: string;
  user_id: string;
  created_at: string;
}

export interface PrintifyBlueprint {
  id: number;
  title: string;
  brand: string;
  model: string;
  images: string[];
  description?: string;
}

export interface PrintifyPrintProvider {
  id: number;
  title: string;
  location?: {
    country: string;
    address1: string;
    address2?: string;
    city: string;
    region: string;
    zip: string;
  };
}

// V2 Catalog Types
export interface PrintifyCatalogItem {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
  tags: string[];
  specifications: {
    print_area_width: number;
    print_area_height: number;
    print_area_unit: string;
  };
  variants: PrintifyVariant[];
}

export interface PrintifyVariant {
  id: number;
  title: string;
  options: Record<string, string>;
  placeholders: Array<{
    position: string;
    images: Array<{
      id: string;
      name: string;
      type: string;
      height: number;
      width: number;
      x: number;
      y: number;
      scale: number;
      angle: number;
    }>;
  }>;
}

export interface PrintifyShippingInfo {
  variant_ids: number[];
  first_item: {
    currency: string;
    cost: number;
  };
  additional_items: {
    currency: string;
    cost: number;
  };
  countries: string[];
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  safety_information?: string;
  tags: string[];
  options: Array<{
    name: string;
    type: string;
    values: Array<{
      id: number;
      title: string;
      colors?: string[];
    }>;
  }>;
  variants: Array<{
    id: number;
    sku: string;
    cost: number;
    price: number;
    title: string;
    grams: number;
    is_enabled: boolean;
    is_default: boolean;
    is_available: boolean;
    is_printify_express_eligible: boolean;
    options: number[];
  }>;
  images: Array<{
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
    is_selected_for_publishing: boolean;
  }>;
  created_at: string;
  updated_at: string;
  visible: boolean;
  is_locked: boolean;
  is_printify_express_product: boolean;
  is_printify_express_eligible: boolean;
  is_printify_express_enabled: boolean;
  blueprint_id: number;
  print_provider_id: number;
  user_id: string;
  shop_id: string;
  print_areas: Array<{
    variant_ids: number[];
    placeholders: Array<{
      position: string;
      images: any[];
    }>;
  }>;
  print_details?: {
    print_on_side: string;
  };
  external?: Array<{
    id: string;
    handle: string;
    shipping_template_id?: string;
  }>;
  sales_channel_properties?: any;
}

// GPSR Information for products
export interface PrintifyGPSR {
  product_id: string;
  safety_information: string;
  manufacturer_details: {
    name: string;
    address: string;
    email: string;
  };
  product_details: {
    brand: string;
    model: string;
    warranty: string;
  };
  warnings: string;
  care_instructions: string;
}

// Order Creation Types
export interface PrintifyCreateOrder {
  external_id?: string;
  label?: string;
  line_items: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
  }>;
  shipping_method: number;
  is_printify_express?: boolean;
  send_shipping_notification?: boolean;
  address_to: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    country: string;
    region: string;
    address1: string;
    address2?: string;
    city: string;
    zip: string;
  };
}

export interface PrintifyOrder {
  id: string;
  address_to: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    country: string;
    region: string;
    address1: string;
    address2?: string;
    city: string;
    zip: string;
  };
  line_items: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
    print_provider_id: number;
    cost: number;
    shipping_cost: number;
    total_cost: number;
    status: string;
    metadata: {
      title: string;
      price: number;
      variant_label: string;
      sku: string;
      country: string;
    };
    sent_to_production_at?: string;
    fulfilled_at?: string;
  }>;
  metadata: {
    order_type: string;
    shop_order_id?: number;
    shop_order_label?: string;
    shop_fulfilled_at?: string;
  };
  total_price: number;
  total_shipping: number;
  total_tax: number;
  status: string;
  shipping_method: number;
  created_at: string;
  sent_to_production_at?: string;
  fulfilled_at?: string;
  printify_connect?: {
    url: string;
    id: string;
  };
  external_id?: string;
  label?: string;
}

export interface PrintifyUpload {
  id: string;
  file_name: string;
  height: number;
  width: number;
  size: number;
  mime_type: string;
  md5_hash: string;
  url: string;
  preview_url: string;
  visible: boolean;
  created_at: string;
}

// Webhook Types
export interface PrintifyCreateWebhook {
  topic: string;
  url: string;
  secret?: string;
}

export interface PrintifyWebhook {
  id: string;
  topic: string;
  url: string;
  shop_id: string;
  secret?: string;
  created_at: string;
}

// Publishing Types
export interface PrintifyPublishingStatus {
  id: string;
  status: 'pending' | 'in-progress' | 'succeeded' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface PrintifyPublishingSucceeded {
  external: {
    id: string;
    handle: string;
    shipping_template_id?: string;
  };
}

export interface PrintifyPublishingFailed {
  reason: string;
}

// API Response Types
export interface PrintifyApiResponse<T> {
  data: T;
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  from?: number;
  to?: number;
}

export interface PrintifyPaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
}

// Error Response
export interface PrintifyError {
  error: string;
  message?: string;
  request_id?: string;
}
