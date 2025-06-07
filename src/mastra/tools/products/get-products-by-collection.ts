import { createTool } from '@mastra/core';
import { z } from 'zod';
import { EcommerceDataStore } from '../../../data/store';

const inputSchema = z.object({
  collection: z.string().describe('Collection name to filter products by'),
  limit: z.number().optional().default(50).describe('Maximum number of products to return'),
  offset: z.number().optional().default(0).describe('Number of products to skip'),
});

const outputSchema = z.object({
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    category: z.string(),
    subcategory: z.string().optional(),
    collection: z.string().optional(),
    stock: z.number(),
    isVisible: z.boolean(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })),
  total: z.number(),
  collection: z.string(),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
    hasNext: z.boolean(),
  }),
});

export const getProductsByCollectionTool = createTool({
  id: 'getProductsByCollection',
  description: 'Retrieve products from a specific collection with pagination support',
  inputSchema,
  outputSchema,
  execute: async (context: any) => {
    const store = EcommerceDataStore.getInstance();
    
    try {
      const { collection, limit, offset } = context.context || context;
      
      // Get all products and filter by collection
      const allProducts = await store.getAllProducts();
      const filteredProducts = allProducts.filter(product => 
        product.collection && product.collection.toLowerCase() === collection.toLowerCase()
      );
      
      // Apply pagination
      const paginatedProducts = filteredProducts.slice(offset, offset + limit);
      
      return {
        products: paginatedProducts,
        total: filteredProducts.length,
        collection,
        pagination: {
          limit,
          offset,
          hasNext: offset + limit < filteredProducts.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get products by collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
