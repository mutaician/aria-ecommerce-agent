// Enhanced data models for Aria e-commerce agent
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  collection?: string;
  stock: number;
  isVisible: boolean;
  tags: string[];
  sku?: string;
  images?: string[];
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerEmail: string;
  customerName?: string;
  shippingAddress?: Address;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  timestamp: Date;
}

export interface StoreMetrics {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: Array<{ id: string; name: string; sales: number }>;
  lowStockAlerts: Array<{ id: string; name: string; stock: number }>;
  revenueByPeriod: { daily: number; weekly: number; monthly: number };
  categoryPerformance: Array<{ category: string; revenue: number; orders: number }>;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ProductFilters {
  category?: string;
  collection?: string;
  tag?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  visible?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface StockOperation {
  operation: 'add' | 'subtract' | 'set';
  quantity: number;
  reason?: string;
}

export interface ContentGenerationResult {
  content: string;
  metadata?: {
    keywords?: string[];
    readingTime?: number;
    seoScore?: number;
  };
}
