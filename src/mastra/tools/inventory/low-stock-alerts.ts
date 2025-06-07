// Level 1 Tool: Get Low Stock Alerts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ecommerceStore } from '../../../data/store';

export const getLowStockAlerts = createTool({
  id: 'getLowStockAlerts',
  description: 'Get alerts for products with low or zero inventory levels. Use this tool when users ask about inventory warnings, stock alerts, or products that need restocking.',
  inputSchema: z.object({
    threshold: z.number().optional().default(10).describe('Stock level threshold for low stock alerts (default: 10)'),
    includeOutOfStock: z.boolean().optional().default(true).describe('Whether to include out-of-stock products'),
  }),
  outputSchema: z.object({
    lowStockProducts: z.array(z.object({
      id: z.string(),
      name: z.string(),
      currentStock: z.number(),
      category: z.string(),
      sku: z.string().optional(),
      price: z.number(),
      alertLevel: z.enum(['low-stock', 'out-of-stock']),
    })),
    summary: z.object({
      totalLowStock: z.number(),
      totalOutOfStock: z.number(),
      criticalItems: z.number(),
      totalValue: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    const { threshold, includeOutOfStock } = context;
    
    // Get low stock and out of stock products
    const lowStockProducts = ecommerceStore.getLowStockProducts(threshold);
    const outOfStockProducts = includeOutOfStock ? ecommerceStore.getOutOfStockProducts() : [];
    
    // Combine and format the results
    const allProducts = [
      ...lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        currentStock: product.stock,
        category: product.category,
        sku: product.sku,
        price: product.price,
        alertLevel: 'low-stock' as const,
      })),
      ...(includeOutOfStock ? outOfStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        currentStock: product.stock,
        category: product.category,
        sku: product.sku,
        price: product.price,
        alertLevel: 'out-of-stock' as const,
      })) : []),
    ];
    
    // Calculate summary metrics
    const totalLowStock = lowStockProducts.length;
    const totalOutOfStock = outOfStockProducts.length;
    const criticalItems = allProducts.filter(p => p.currentStock <= 3).length;
    const totalValue = allProducts.reduce((sum, product) => sum + (product.price * product.currentStock), 0);
    
    return {
      lowStockProducts: allProducts,
      summary: {
        totalLowStock,
        totalOutOfStock,
        criticalItems,
        totalValue,
      },
    };
  },
});
