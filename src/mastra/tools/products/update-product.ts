import { createTool } from '@mastra/core';
import { z } from 'zod';
import { ecommerceStore } from '../../../data/store';

const updateProductSchema = z.object({
  id: z.string().describe('The unique identifier of the product to update'),
  updates: z.object({
    name: z.string().optional().describe('The product name'),
    description: z.string().optional().describe('The product description'),
    price: z.number().positive().optional().describe('The product price'),
    category: z.string().optional().describe('The product category'),
    tags: z.array(z.string()).optional().describe('Array of tags for the product'),
    image: z.string().optional().describe('Product image URL'),
    dimensions: z.object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
      unit: z.enum(['cm', 'in']).default('cm')
    }).optional().describe('Product dimensions'),
    weight: z.object({
      value: z.number().positive(),
      unit: z.enum(['kg', 'lb']).default('kg')
    }).optional().describe('Product weight'),
    isVisible: z.boolean().optional().describe('Whether the product is visible in the store'),
    lowStockThreshold: z.number().int().min(0).optional().describe('Low stock alert threshold')
  }).describe('Object containing the fields to update')
});

const updateProductOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  product: z.any().optional()
});

export const updateProduct = createTool({
  id: 'updateProduct',
  description: 'Update an existing product in the store catalog with new information',
  inputSchema: updateProductSchema,
  outputSchema: updateProductOutputSchema,
  execute: async (context: any) => {
    const { id, updates } = context.context || context;
    try {
      // Get current product to validate it exists
      const currentProduct = ecommerceStore.getProduct(id);
      if (!currentProduct) {
        return {
          success: false,
          message: `Product with ID ${id} not found`
        };
      }

      // Prepare the update data
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      // Update the product
      const success = ecommerceStore.updateProduct(id, updateData);
      
      if (success) {
        const updatedProduct = ecommerceStore.getProduct(id);
        return {
          success: true,
          message: `Product "${updatedProduct?.name}" updated successfully`,
          product: updatedProduct
        };
      } else {
        return {
          success: false,
          message: `Failed to update product with ID ${id}`
        };
      }
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        message: `Error updating product: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
});
