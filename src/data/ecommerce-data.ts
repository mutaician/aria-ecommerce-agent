// E-commerce simulated data for Aria Agent
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  collection?: string;
  stock: number;
  isVisible: boolean;
  tags: string[];
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
  timestamp: Date;
}

// Simulated product database
export const products: Product[] = [
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
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-05-15"),
  },
  {
    id: "12347",
    name: "Summer Sandals",
    description: "Lightweight and comfortable sandals perfect for summer",
    price: 49.99,
    category: "Footwear",
    collection: "Summer Collection",
    stock: 15,
    isVisible: true,
    tags: ["sandals", "summer", "comfortable", "casual"],
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-05-20"),
  },
  {
    id: "12348",
    name: "Running Shoes",
    description: "High-performance running shoes with advanced cushioning",
    price: 129.99,
    category: "Footwear",
    collection: "Sport Collection",
    stock: 30,
    isVisible: true,
    tags: ["running", "shoes", "sport", "performance"],
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-05-25"),
  },
  {
    id: "12349",
    name: "Winter Scarf",
    description: "Warm wool scarf available in multiple colors",
    price: 34.99,
    category: "Accessories",
    collection: "Winter Collection",
    stock: 20,
    isVisible: true,
    tags: ["scarf", "wool", "winter", "warm"],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-05-10"),
  },
  {
    id: "12350",
    name: "Denim Jeans",
    description: "Classic straight-fit denim jeans in dark wash",
    price: 79.99,
    category: "Clothing",
    collection: "Essentials",
    stock: 40,
    isVisible: true,
    tags: ["jeans", "denim", "classic", "essentials"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-05-30"),
  },
];

// Simulated sales data
export const sales: Sale[] = [
  // Yesterday's sales
  {
    id: "sale-001",
    productId: "12345",
    productName: "Blue T-Shirt",
    quantity: 3,
    unitPrice: 19.99,
    totalAmount: 59.97,
    customerEmail: "john@example.com",
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
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  // Today's sales
  {
    id: "sale-004",
    productId: "12346",
    productName: "Leather Jacket",
    quantity: 1,
    unitPrice: 249.99,
    totalAmount: 249.99,
    customerEmail: "emma@example.com",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  // Last week's sales
  {
    id: "sale-005",
    productId: "12345",
    productName: "Blue T-Shirt",
    quantity: 5,
    unitPrice: 19.99,
    totalAmount: 99.95,
    customerEmail: "alex@example.com",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
  },
];

// Helper functions for data operations
export class EcommerceDatabase {
  static getProducts(): Product[] {
    return [...products];
  }

  static getProductById(id: string): Product | undefined {
    return products.find(p => p.id === id);
  }

  static getProductByName(name: string): Product | undefined {
    return products.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
  }

  static getProductsByCollection(collection: string): Product[] {
    return products.filter(p => 
      p.collection?.toLowerCase().includes(collection.toLowerCase())
    );
  }

  static getProductsByCategory(category: string): Product[] {
    return products.filter(p => 
      p.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  static updateProductStock(productId: string, newStock: number): boolean {
    const product = products.find(p => p.id === productId);
    if (product) {
      product.stock = newStock;
      product.updatedAt = new Date();
      return true;
    }
    return false;
  }

  static updateProductPrice(productId: string, newPrice: number): boolean {
    const product = products.find(p => p.id === productId);
    if (product) {
      product.price = newPrice;
      product.updatedAt = new Date();
      return true;
    }
    return false;
  }

  static toggleProductVisibility(productId: string, isVisible?: boolean): boolean {
    const product = products.find(p => p.id === productId);
    if (product) {
      product.isVisible = isVisible !== undefined ? isVisible : !product.isVisible;
      product.updatedAt = new Date();
      return true;
    }
    return false;
  }

  static addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    products.push(newProduct);
    return newProduct;
  }

  static getSales(): Sale[] {
    return [...sales];
  }

  static getSalesByDateRange(startDate: Date, endDate: Date): Sale[] {
    return sales.filter(sale => 
      sale.timestamp >= startDate && sale.timestamp <= endDate
    );
  }

  static getSalesForYesterday(): Sale[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);
    
    return this.getSalesByDateRange(yesterday, endOfYesterday);
  }

  static getTotalSalesAmount(salesData: Sale[]): number {
    return salesData.reduce((total, sale) => total + sale.totalAmount, 0);
  }

  static addSale(saleData: Omit<Sale, 'id'>): Sale {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
    };
    sales.push(newSale);
    return newSale;
  }
}
