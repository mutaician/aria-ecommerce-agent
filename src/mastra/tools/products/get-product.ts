// Level 1 Tool: Get Product Information
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ecommerceStore } from '../../../data/store';

export const getProduct = createTool({
  id: 'getProduct',
  description: 'Retrieve detailed information about a specific product by ID, name, or SKU. Use this tool when users ask about product details, specifications, or general product information.',
  inputSchema: z.object({
    identifier: z.string().describe('Product ID, name, or SKU to search for'),
    identifierType: z.enum(['id', 'name', 'sku']).optional().default('name').describe('Type of identifier provided'),
  }),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    collection: z.string().optional(),
    stock: z.number(),
    isVisible: z.boolean(),
    tags: z.array(z.string()),
    sku: z.string().optional(),
    images: z.array(z.string()).optional(),
    weight: z.number().optional(),
    dimensions: z.object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    }).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
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
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      collection: product.collection,
      stock: product.stock,
      isVisible: product.isVisible,
      tags: product.tags,
      sku: product.sku,
      images: product.images,
      weight: product.weight,
      dimensions: product.dimensions,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  },
});
