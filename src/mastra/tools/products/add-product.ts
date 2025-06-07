// Level 2 Tool: Add New Product
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ecommerceStore } from '../../../data/store';

export const addNewProduct = createTool({
  id: 'addNewProduct',
  description: 'Add a new product to the store inventory. Use this tool when users want to create new products, add items to the catalog, or expand the product line.',
  inputSchema: z.object({
    name: z.string().min(1).describe('Product name'),
    description: z.string().min(1).describe('Product description'),
    price: z.number().min(0).describe('Product price'),
    category: z.string().min(1).describe('Product category'),
    collection: z.string().optional().describe('Product collection (optional)'),
    stock: z.number().min(0).default(0).describe('Initial stock quantity'),
    tags: z.array(z.string()).default([]).describe('Product tags for search and categorization'),
    sku: z.string().optional().describe('Stock Keeping Unit (SKU)'),
    images: z.array(z.string()).optional().describe('Product image URLs'),
    weight: z.number().optional().describe('Product weight in kg'),
    dimensions: z.object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    }).optional().describe('Product dimensions in cm'),
    isVisible: z.boolean().default(true).describe('Whether product is visible in store'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    productId: z.string(),
    product: z.object({
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
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const productData = context;
    
    // Validate SKU uniqueness if provided
    if (productData.sku) {
      const existingProduct = ecommerceStore.getProductBySku(productData.sku);
      if (existingProduct) {
        throw new Error(`A product with SKU '${productData.sku}' already exists: ${existingProduct.name}`);
      }
    }
    
    // Check if product with same name already exists
    const existingByName = ecommerceStore.getProductByName(productData.name);
    if (existingByName) {
      throw new Error(`A product with the name '${productData.name}' already exists. Please use a different name or update the existing product.`);
    }
    
    try {
      // Add the product
      const newProduct = ecommerceStore.addProduct(productData);
      
      // Format the response
      const formattedProduct = {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        category: newProduct.category,
        collection: newProduct.collection,
        stock: newProduct.stock,
        isVisible: newProduct.isVisible,
        tags: newProduct.tags,
        sku: newProduct.sku,
        images: newProduct.images,
        weight: newProduct.weight,
        dimensions: newProduct.dimensions,
        createdAt: newProduct.createdAt.toISOString(),
        updatedAt: newProduct.updatedAt.toISOString(),
      };
      
      const message = `Successfully added new product '${newProduct.name}' to the store. Product ID: ${newProduct.id}${newProduct.sku ? `, SKU: ${newProduct.sku}` : ''}. Initial stock: ${newProduct.stock} units.`;
      
      return {
        success: true,
        productId: newProduct.id,
        product: formattedProduct,
        message,
      };
    } catch (error) {
      throw new Error(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
