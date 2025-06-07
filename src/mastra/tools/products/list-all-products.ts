import { createTool } from '@mastra/core';
import { z } from 'zod';
import { EcommerceDataStore } from '../../../data/store';

export const getAllProducts = createTool({
  id: 'getAllProducts',
  description: 'Retrieve all products in the store',
  inputSchema: z.object({}),
  outputSchema: z.object({
    products: z.array(z.object({
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
      dimensions: z.object({ length: z.number(), width: z.number(), height: z.number() }).optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })),
  }),
  execute: async () => {
    const store = EcommerceDataStore.getInstance ? EcommerceDataStore.getInstance() : new EcommerceDataStore();
    const products = store.getAllProducts();
    return { products };
  },
}); 