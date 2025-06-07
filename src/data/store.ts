// Enhanced data store implementation for Aria e-commerce agent
import { 
  Product, 
  Sale, 
  StoreMetrics, 
  ProductFilters, 
  DateRange, 
  StockOperation,
  Address 
} from './models';

// Sample data for initial store state
const sampleProducts: Product[] = [
  {
    id: "12345",
    name: "Blue T-Shirt",
    description: "Comfortable cotton t-shirt in vibrant blue color",
    price: 19.99,
    category: "Clothing",
    collection: "Summer Collection",
    stock: 25,
    isVisible: true,
    tags: ["casual", "cotton", "blue", "t-shirt"],
    sku: "BTS-001",
    images: ["blue-tshirt-1.jpg", "blue-tshirt-2.jpg"],
    weight: 0.2,
    dimensions: { length: 70, width: 50, height: 1 },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    id: "12346",
    name: "Leather Jacket",
    description: "Premium genuine leather jacket with modern fit",
    price: 249.99,
    category: "Clothing",
    collection: "Winter Collection",
    stock: 8,
    isVisible: true,
    tags: ["leather", "jacket", "premium", "winter"],
    sku: "LJ-002",
    images: ["leather-jacket-1.jpg"],
    weight: 1.5,
    dimensions: { length: 65, width: 55, height: 3 },
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-05-15"),
  },
  {
    id: "12347",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    category: "Electronics",
    collection: "Tech Essentials",
    stock: 0,
    isVisible: true,
    tags: ["wireless", "headphones", "audio", "noise-cancellation"],
    sku: "WH-003",
    images: ["wireless-headphones-1.jpg", "wireless-headphones-2.jpg"],
    weight: 0.3,
    dimensions: { length: 20, width: 18, height: 8 },
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-06-05"),
  },
  {
    id: "12348",
    name: "Running Shoes",
    description: "Lightweight running shoes with superior comfort",
    price: 129.99,
    category: "Footwear",
    collection: "Athletic Collection",
    stock: 30,
    isVisible: true,
    tags: ["running", "shoes", "athletic", "comfortable"],
    sku: "RS-004",
    images: ["running-shoes-1.jpg"],
    weight: 0.8,
    dimensions: { length: 30, width: 15, height: 12 },
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-05-20"),
  },
  {
    id: "12349",
    name: "Winter Scarf",
    description: "Warm wool scarf perfect for cold weather",
    price: 34.99,
    category: "Accessories",
    collection: "Winter Collection",
    stock: 5, // Low stock item
    isVisible: true,
    tags: ["scarf", "wool", "winter", "warm"],
    sku: "WS-005",
    images: ["winter-scarf-1.jpg"],
    weight: 0.15,
    dimensions: { length: 180, width: 30, height: 1 },
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-05-25"),
  },
  {
    id: "12350",
    name: "Classic Jeans",
    description: "Timeless denim jeans with perfect fit",
    price: 79.99,
    category: "Clothing",
    collection: "Essentials",
    stock: 40,
    isVisible: true,
    tags: ["jeans", "denim", "classic", "essentials"],
    sku: "CJ-006",
    images: ["classic-jeans-1.jpg"],
    weight: 0.6,
    dimensions: { length: 110, width: 40, height: 2 },
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-05-30"),
  }
];

const sampleSales: Sale[] = [
  {
    id: "sale-001",
    productId: "12345",
    productName: "Blue T-Shirt",
    quantity: 3,
    unitPrice: 19.99,
    totalAmount: 59.97,
    customerEmail: "john@example.com",
    customerName: "John Doe",
    status: "delivered",
    paymentMethod: "credit_card",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: "sale-002",
    productId: "12348",
    productName: "Running Shoes",
    quantity: 1,
    unitPrice: 129.99,
    totalAmount: 129.99,
    customerEmail: "sarah@example.com",
    customerName: "Sarah Johnson",
    status: "shipped",
    paymentMethod: "paypal",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: "sale-003",
    productId: "12349",
    productName: "Winter Scarf",
    quantity: 2,
    unitPrice: 34.99,
    totalAmount: 69.98,
    customerEmail: "mike@example.com",
    customerName: "Mike Wilson",
    status: "processing",
    paymentMethod: "credit_card",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: "sale-004",
    productId: "12346",
    productName: "Leather Jacket",
    quantity: 1,
    unitPrice: 249.99,
    totalAmount: 249.99,
    customerEmail: "emma@example.com",
    customerName: "Emma Brown",
    status: "pending",
    paymentMethod: "credit_card",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "sale-005",
    productId: "12345",
    productName: "Blue T-Shirt",
    quantity: 5,
    unitPrice: 19.99,
    totalAmount: 99.95,
    customerEmail: "alex@example.com",
    customerName: "Alex Garcia",
    status: "delivered",
    paymentMethod: "debit_card",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
  }
];

export class EcommerceDataStore {
  private static instance: EcommerceDataStore;
  private products: Map<string, Product> = new Map();
  private sales: Sale[] = [];
  private categories: Set<string> = new Set();
  private collections: Set<string> = new Set();

  constructor() {
    this.initializeWithSampleData();
  }

  public static getInstance(): EcommerceDataStore {
    if (!EcommerceDataStore.instance) {
      EcommerceDataStore.instance = new EcommerceDataStore();
    }
    return EcommerceDataStore.instance;
  }

  private initializeWithSampleData(): void {
    // Load sample products
    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
      this.categories.add(product.category);
      if (product.collection) {
        this.collections.add(product.collection);
      }
    });

    // Load sample sales
    this.sales = [...sampleSales];
  }

  // Product CRUD Operations
  getProduct(id: string): Product | undefined {
    return this.products.get(id);
  }

  getProductByName(name: string): Product | undefined {
    for (const product of this.products.values()) {
      if (product.name.toLowerCase().includes(name.toLowerCase())) {
        return product;
      }
    }
    return undefined;
  }

  getProductBySku(sku: string): Product | undefined {
    for (const product of this.products.values()) {
      if (product.sku === sku) {
        return product;
      }
    }
    return undefined;
  }

  addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.products.set(newProduct.id, newProduct);
    this.categories.add(newProduct.category);
    if (newProduct.collection) {
      this.collections.add(newProduct.collection);
    }
    
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
    const product = this.products.get(id);
    if (!product) return null;

    const updatedProduct: Product = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    };

    this.products.set(id, updatedProduct);
    
    // Update categories and collections
    this.categories.add(updatedProduct.category);
    if (updatedProduct.collection) {
      this.collections.add(updatedProduct.collection);
    }

    return updatedProduct;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  getAllProducts(filters?: ProductFilters): Product[] {
    let products = Array.from(this.products.values());

    if (filters) {
      if (filters.category) {
        products = products.filter(p => 
          p.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }
      if (filters.collection) {
        products = products.filter(p => 
          p.collection?.toLowerCase().includes(filters.collection!.toLowerCase())
        );
      }
      if (filters.tag) {
        products = products.filter(p => 
          p.tags.some(tag => tag.toLowerCase().includes(filters.tag!.toLowerCase()))
        );
      }
      if (filters.priceMin !== undefined) {
        products = products.filter(p => p.price >= filters.priceMin!);
      }
      if (filters.priceMax !== undefined) {
        products = products.filter(p => p.price <= filters.priceMax!);
      }
      if (filters.inStock !== undefined) {
        products = products.filter(p => filters.inStock ? p.stock > 0 : p.stock === 0);
      }
      if (filters.visible !== undefined) {
        products = products.filter(p => p.isVisible === filters.visible);
      }
    }

    return products;
  }

  // Inventory Management
  updateStock(productId: string, stockOperation: StockOperation): boolean {
    const product = this.products.get(productId);
    if (!product) return false;

    let newStock: number;
    switch (stockOperation.operation) {
      case 'add':
        newStock = product.stock + stockOperation.quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, product.stock - stockOperation.quantity);
        break;
      case 'set':
        newStock = Math.max(0, stockOperation.quantity);
        break;
      default:
        return false;
    }

    product.stock = newStock;
    product.updatedAt = new Date();
    return true;
  }

  getLowStockProducts(threshold: number = 10): Product[] {
    return Array.from(this.products.values()).filter(p => p.stock <= threshold && p.stock > 0);
  }

  getOutOfStockProducts(): Product[] {
    return Array.from(this.products.values()).filter(p => p.stock === 0);
  }

  getStockLevel(productId: string): number {
    const product = this.products.get(productId);
    return product ? product.stock : -1;
  }

  // Sales Operations
  addSale(saleData: Omit<Sale, 'id'>): Sale {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    this.sales.push(newSale);
    
    // Update product stock
    this.updateStock(saleData.productId, {
      operation: 'subtract',
      quantity: saleData.quantity,
      reason: `Sale: ${newSale.id}`
    });
    
    return newSale;
  }

  getSalesByDateRange(start: Date, end: Date): Sale[] {
    return this.sales.filter(sale => 
      sale.timestamp >= start && sale.timestamp <= end
    );
  }

  getSalesAnalytics(dateRange?: DateRange): StoreMetrics {
    const salesData = dateRange 
      ? this.getSalesByDateRange(dateRange.start, dateRange.end)
      : this.sales;

    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalOrders = salesData.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate top products
    const productSales = new Map<string, { name: string; sales: number }>();
    salesData.forEach(sale => {
      const existing = productSales.get(sale.productId);
      if (existing) {
        existing.sales += sale.totalAmount;
      } else {
        productSales.set(sale.productId, {
          name: sale.productName,
          sales: sale.totalAmount
        });
      }
    });

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, name: data.name, sales: data.sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Calculate revenue by period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailySales = this.getSalesByDateRange(today, now);
    const weeklySales = this.getSalesByDateRange(thisWeekStart, now);
    const monthlySales = this.getSalesByDateRange(thisMonthStart, now);

    const revenueByPeriod = {
      daily: dailySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      weekly: weeklySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      monthly: monthlySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    };

    // Calculate category performance
    const categoryStats = new Map<string, { revenue: number; orders: number }>();
    salesData.forEach(sale => {
      const product = this.getProduct(sale.productId);
      if (product) {
        const existing = categoryStats.get(product.category);
        if (existing) {
          existing.revenue += sale.totalAmount;
          existing.orders += 1;
        } else {
          categoryStats.set(product.category, {
            revenue: sale.totalAmount,
            orders: 1
          });
        }
      }
    });

    const categoryPerformance = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      topProducts,
      lowStockAlerts: this.getLowStockProducts().map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock
      })),
      revenueByPeriod,
      categoryPerformance,
    };
  }

  getTopSellingProducts(limit: number = 5, period?: DateRange): Product[] {
    const salesData = period 
      ? this.getSalesByDateRange(period.start, period.end)
      : this.sales;

    const productSales = new Map<string, number>();
    salesData.forEach(sale => {
      const existing = productSales.get(sale.productId) || 0;
      productSales.set(sale.productId, existing + sale.quantity);
    });

    const sortedProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => this.getProduct(productId))
      .filter((product): product is Product => product !== undefined);

    return sortedProducts;
  }

  // Search & Filter Operations
  searchProducts(query: string): Product[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm))
    );
  }

  getProductsByCategory(category: string): Product[] {
    return Array.from(this.products.values()).filter(p => 
      p.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  getProductsByCollection(collection: string): Product[] {
    return Array.from(this.products.values()).filter(p => 
      p.collection?.toLowerCase().includes(collection.toLowerCase())
    );
  }

  getProductsByTag(tag: string): Product[] {
    return Array.from(this.products.values()).filter(p => 
      p.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  // Data Management
  exportData(): { products: Product[]; sales: Sale[] } {
    return {
      products: Array.from(this.products.values()),
      sales: [...this.sales]
    };
  }

  importData(data: { products: Product[]; sales: Sale[] }): void {
    this.products.clear();
    this.sales = [];
    this.categories.clear();
    this.collections.clear();

    data.products.forEach(product => {
      this.products.set(product.id, product);
      this.categories.add(product.category);
      if (product.collection) {
        this.collections.add(product.collection);
      }
    });

    this.sales = [...data.sales];
  }

  reset(): void {
    this.products.clear();
    this.sales = [];
    this.categories.clear();
    this.collections.clear();
    this.initializeWithSampleData();
  }

  // Utility methods
  getCategories(): string[] {
    return Array.from(this.categories);
  }

  getCollections(): string[] {
    return Array.from(this.collections);
  }

  getProductCount(): number {
    return this.products.size;
  }

  getTotalInventoryValue(): number {
    return Array.from(this.products.values())
      .reduce((total, product) => total + (product.price * product.stock), 0);
  }
}

// Global store instance
export const ecommerceStore = new EcommerceDataStore();

// Export function for compatibility
export const getDataStore = () => ecommerceStore;
