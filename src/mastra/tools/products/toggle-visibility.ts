import { createTool } from '@mastra/core';
import { z } from 'zod';
import { ecommerceStore } from '../../../data/store';

const toggleVisibilitySchema = z.object({
  id: z.string().describe('The unique identifier of the product'),
  visible: z.boolean().optional().describe('Set visibility state (if not provided, toggles current state)')
});

const toggleVisibilityOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    isVisible: z.boolean()
  }).optional()
});

export const toggleVisibility = createTool({
  id: 'toggleVisibility',
  description: 'Toggle or set the visibility status of a product in the store catalog',
  inputSchema: toggleVisibilitySchema,
  outputSchema: toggleVisibilityOutputSchema,
  execute: async (context: any) => {
    const { id, visible } = context.context || context;
    try {
      // Get current product to validate it exists
      const currentProduct = ecommerceStore.getProduct(id);
      if (!currentProduct) {
        return {
          success: false,
          message: `Product with ID ${id} not found`
        };
      }

      // Determine the new visibility state
      const newVisibility = visible !== undefined ? visible : !currentProduct.isVisible;

      // Update the product visibility
      const success = ecommerceStore.updateProduct(id, { 
        isVisible: newVisibility,
        updatedAt: new Date()
      });
      
      if (success) {
        const updatedProduct = ecommerceStore.getProduct(id);
        const action = newVisibility ? 'shown' : 'hidden';
        
        return {
          success: true,
          message: `Product "${updatedProduct?.name}" is now ${action} in the store`,
          product: {
            id: updatedProduct!.id,
            name: updatedProduct!.name,
            isVisible: updatedProduct!.isVisible
          }
        };
      } else {
        return {
          success: false,
          message: `Failed to update visibility for product with ID ${id}`
        };
      }
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      return {
        success: false,
        message: `Error toggling visibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
});
