// Level 1 Tool: Get Product Stock Information
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ecommerceStore } from '../../../data/store';

export const getProductStock = createTool({
  id: 'getProductStock',
  description: 'Check inventory levels for specific products by ID, name, or SKU. Use this tool when users ask about stock levels, availability, or inventory status.',
  inputSchema: z.object({
    identifier: z.string().describe('Product ID, name, or SKU to check stock for'),
    identifierType: z.enum(['id', 'name', 'sku']).optional().default('name').describe('Type of identifier provided (id, name, or sku)'),
  }),
  outputSchema: z.object({
    productId: z.string(),
    productName: z.string(),
    currentStock: z.number(),
    stockStatus: z.enum(['in-stock', 'low-stock', 'out-of-stock']),
    sku: z.string().optional(),
    price: z.number(),
    category: z.string(),
  }),
  execute: async ({ context }) => {
    const { identifier, identifierType } = context;
    
    let product;
    
    switch (identifierType) {
      case 'id':
        product = ecommerceStore.getProduct(identifier);
        break;
      case 'sku':
        product = ecommerceStore.getProductBySku(identifier);
        break;
      case 'name':
      default:
        product = ecommerceStore.getProductByName(identifier);
        break;
    }
    
    if (!product) {
      throw new Error(`Product not found with ${identifierType}: ${identifier}`);
    }
    
    let stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
    if (product.stock === 0) {
      stockStatus = 'out-of-stock';
    } else if (product.stock <= 10) {
      stockStatus = 'low-stock';
    } else {
      stockStatus = 'in-stock';
    }
    
    return {
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      stockStatus,
      sku: product.sku,
      price: product.price,
      category: product.category,
    };
  },
});
