/**
 * Data seeding utilities for the Aria E-commerce Agent
 * Provides sample data generation and database initialization
 */

import { Product, Sale } from './models';
import { EcommerceDataStore } from './store';
import { logger } from '../utils/logger';

// Sample product categories and collections
const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Health & Beauty',
  'Toys & Games',
  'Automotive',
  'Office Supplies',
  'Kitchen & Dining',
];

const COLLECTIONS = [
  'Spring Collection 2025',
  'Summer Essentials',
  'Back to School',
  'Holiday Specials',
  'Premium Line',
  'Eco-Friendly',
  'Limited Edition',
  'Best Sellers',
];

const PRODUCT_NAMES = {
  Electronics: [
    'Wireless Bluetooth Headphones',
    'Smart Home Assistant',
    'Portable Charger',
    'Smartphone Case',
    'LED Desk Lamp',
    'Wireless Mouse',
    'USB-C Hub',
    'Bluetooth Speaker',
  ],
  Clothing: [
    'Cotton T-Shirt',
    'Denim Jeans',
    'Running Shoes',
    'Winter Jacket',
    'Casual Hoodie',
    'Professional Blazer',
    'Comfortable Sneakers',
    'Wool Sweater',
  ],
  'Home & Garden': [
    'Indoor Plant Pot',
    'Garden Tool Set',
    'Decorative Vase',
    'Outdoor Solar Lights',
    'Throw Pillow',
    'Wall Art Print',
    'Scented Candle',
    'Storage Basket',
  ],
  // Add more categories as needed
};

const BRANDS = [
  'TechPro',
  'ComfortWear',
  'GreenLife',
  'SportsMax',
  'HomeStyle',
  'UrbanTrend',
  'EcoChoice',
  'PremiumLine',
];

const CUSTOMER_NAMES = [
  'John Smith',
  'Emily Johnson',
  'Michael Brown',
  'Sarah Davis',
  'David Wilson',
  'Lisa Anderson',
  'James Taylor',
  'Jessica Moore',
  'Robert Jackson',
  'Amanda White',
];

/**
 * Generate a random product
 */
function generateRandomProduct(id: string): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const collection = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)];
  const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
  
  const productNames = PRODUCT_NAMES[category as keyof typeof PRODUCT_NAMES] || ['Generic Product'];
  const baseName = productNames[Math.floor(Math.random() * productNames.length)];
  const name = `${brand} ${baseName}`;
  
  const basePrice = Math.floor(Math.random() * 500) + 10; // $10 - $510
  const price = Math.round(basePrice * 100) / 100; // Round to 2 decimals
  
  const stockQuantity = Math.floor(Math.random() * 200) + 5; // 5 - 204 items
  
  const tags = [
    category.toLowerCase(),
    brand.toLowerCase(),
    Math.random() > 0.5 ? 'new-arrival' : 'popular',
    Math.random() > 0.7 ? 'sale' : 'regular',
  ];

  return {
    name,
    description: `High-quality ${baseName.toLowerCase()} from ${brand}. Perfect for everyday use with excellent durability and modern design.`,
    price,
    category,
    subcategory: Math.random() > 0.5 ? `${category} Accessories` : undefined,
    collection,
    stock: stockQuantity,
    isVisible: Math.random() > 0.1, // 90% visible
    tags: tags.filter(Boolean),
    sku: `${brand.toUpperCase()}-${id.padStart(6, '0')}`,
    images: [
      `https://example.com/images/${id}-1.jpg`,
      `https://example.com/images/${id}-2.jpg`,
    ],
    weight: Math.round((Math.random() * 5 + 0.1) * 100) / 100, // 0.1 - 5.1 kg
    dimensions: {
      length: Math.round((Math.random() * 50 + 5) * 10) / 10, // 5-55 cm
      width: Math.round((Math.random() * 30 + 3) * 10) / 10,  // 3-33 cm
      height: Math.round((Math.random() * 20 + 2) * 10) / 10, // 2-22 cm
    },
  };
}

/**
 * Generate a random sale
 */
function generateRandomSale(products: Product[]): Omit<Sale, 'id'> {
  const product = products[Math.floor(Math.random() * products.length)];
  const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 items
  const customerName = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
  
  // Generate sale within last 90 days
  const daysAgo = Math.floor(Math.random() * 90);
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);
  timestamp.setHours(Math.floor(Math.random() * 24));
  timestamp.setMinutes(Math.floor(Math.random() * 60));

  const statuses: Sale['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Apple Pay', 'Google Pay'];
  const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  return {
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    totalAmount: Math.round(product.price * quantity * 100) / 100,
    customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
    customerName,
    shippingAddress: {
      street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
      state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: 'USA',
    },
    status,
    paymentMethod,
    timestamp,
  };
}

/**
 * Seed the database with sample data
 */
export async function seedDatabase(options: {
  productCount?: number;
  salesCount?: number;
  clearExisting?: boolean;
} = {}): Promise<{
  productsCreated: number;
  salesCreated: number;
  errors: string[];
}> {
  const {
    productCount = 50,
    salesCount = 200,
    clearExisting = true,
  } = options;

  const store = EcommerceDataStore.getInstance();
  const errors: string[] = [];
  let productsCreated = 0;
  let salesCreated = 0;

  try {
    logger.info('SEED', 'Starting database seeding', { productCount, salesCount, clearExisting });

    // Clear existing data if requested
    if (clearExisting) {
      store.reset();
      logger.info('SEED', 'Cleared existing data');
    }

    // Generate products
    logger.info('SEED', `Generating ${productCount} products`);
    const products: Product[] = [];
    
    for (let i = 1; i <= productCount; i++) {
      try {
        const productData = generateRandomProduct(i.toString());
        const product = store.addProduct(productData);
        products.push(product);
        productsCreated++;
        
        if (i % 10 === 0) {
          logger.debug('SEED', `Generated ${i}/${productCount} products`);
        }
      } catch (error) {
        const errorMsg = `Failed to create product ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        logger.error('SEED', errorMsg);
      }
    }

    // Generate sales
    logger.info('SEED', `Generating ${salesCount} sales`);
    
    for (let i = 1; i <= salesCount; i++) {
      try {
        const saleData = generateRandomSale(products);
        store.addSale(saleData);
        salesCreated++;
        
        if (i % 50 === 0) {
          logger.debug('SEED', `Generated ${i}/${salesCount} sales`);
        }
      } catch (error) {
        const errorMsg = `Failed to create sale ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        logger.error('SEED', errorMsg);
      }
    }

    logger.info('SEED', 'Database seeding completed', {
      productsCreated,
      salesCreated,
      errorCount: errors.length,
    });

    return { productsCreated, salesCreated, errors };

  } catch (error) {
    const errorMsg = `Seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    logger.error('SEED', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Add specific demo products for testing
 */
export function addDemoProducts(): Product[] {
  const store = EcommerceDataStore.getInstance();
  const demoProducts = [
    {
      name: 'TechPro Wireless Headphones',
      description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
      price: 199.99,
      category: 'Electronics',
      collection: 'Premium Line',
      stock: 25,
      isVisible: true,
      tags: ['electronics', 'audio', 'wireless', 'premium'],
      sku: 'TECHPRO-001',
    },
    {
      name: 'ComfortWear Cotton T-Shirt',
      description: 'Soft, breathable cotton t-shirt perfect for everyday wear.',
      price: 24.99,
      category: 'Clothing',
      collection: 'Spring Collection 2025',
      stock: 100,
      isVisible: true,
      tags: ['clothing', 'cotton', 'casual', 'spring'],
      sku: 'COMFORT-001',
    },
    {
      name: 'GreenLife Eco-Friendly Water Bottle',
      description: 'Sustainable stainless steel water bottle that keeps drinks cold for 24 hours.',
      price: 34.99,
      category: 'Health & Beauty',
      collection: 'Eco-Friendly',
      stock: 5, // Low stock for testing alerts
      isVisible: true,
      tags: ['eco-friendly', 'sustainable', 'hydration', 'steel'],
      sku: 'GREEN-001',
    },
  ];

  return demoProducts.map(productData => store.addProduct(productData));
}

/**
 * Create sample sales for demo products
 */
export function addDemoSales(products: Product[]): Sale[] {
  const store = EcommerceDataStore.getInstance();
  const demoSales = [
    {
      productId: products[0].id,
      productName: products[0].name,
      quantity: 2,
      unitPrice: products[0].price,
      totalAmount: products[0].price * 2,
      customerEmail: 'demo.customer@example.com',
      customerName: 'Demo Customer',
      status: 'delivered' as const,
      paymentMethod: 'Credit Card',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      productId: products[1].id,
      productName: products[1].name,
      quantity: 3,
      unitPrice: products[1].price,
      totalAmount: products[1].price * 3,
      customerEmail: 'jane.doe@example.com',
      customerName: 'Jane Doe',
      status: 'shipped' as const,
      paymentMethod: 'PayPal',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  ];

  return demoSales.map(saleData => store.addSale(saleData));
}

/**
 * Quick setup for development and testing
 */
export async function quickSetup(): Promise<void> {
  logger.info('SEED', 'Running quick setup for development');
  
  // Add demo products and sales
  const products = addDemoProducts();
  addDemoSales(products);
  
  // Add additional random data
  await seedDatabase({
    productCount: 20,
    salesCount: 50,
    clearExisting: false, // Keep demo data
  });
  
  logger.info('SEED', 'Quick setup completed');
}
