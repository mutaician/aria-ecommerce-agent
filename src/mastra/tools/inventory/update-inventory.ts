// Level 2 Tool: Update Inventory
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ecommerceStore } from '../../../data/store';

export const updateInventory = createTool({
  id: 'updateInventory',
  description: 'Update inventory levels for products by adding, subtracting, or setting stock quantities. Use this tool when users want to adjust inventory, restock products, or correct stock levels.',
  inputSchema: z.object({
    productIdentifier: z.string().describe('Product ID, name, or SKU to update'),
    identifierType: z.enum(['id', 'name', 'sku']).optional().default('name').describe('Type of identifier provided'),
    operation: z.enum(['add', 'subtract', 'set']).describe('Stock operation: add (increase), subtract (decrease), or set (exact amount)'),
    quantity: z.number().min(0).describe('Quantity to add, subtract, or set'),
    reason: z.string().optional().describe('Reason for inventory adjustment (optional)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    productId: z.string(),
    productName: z.string(),
    previousStock: z.number(),
    newStock: z.number(),
    operation: z.string(),
    quantity: z.number(),
    reason: z.string().optional(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { productIdentifier, identifierType, operation, quantity, reason } = context;
    
    // Find the product
    let product;
    switch (identifierType) {
      case 'id':
        product = ecommerceStore.getProduct(productIdentifier);
        break;
      case 'sku':
        product = ecommerceStore.getProductBySku(productIdentifier);
        break;
      case 'name':
      default:
        product = ecommerceStore.getProductByName(productIdentifier);
        break;
    }
    
    if (!product) {
      throw new Error(`Product not found with ${identifierType}: ${productIdentifier}`);
    }
    
    const previousStock = product.stock;
    
    // Update the inventory
    const success = ecommerceStore.updateStock(product.id, {
      operation,
      quantity,
      reason,
    });
    
    if (!success) {
      throw new Error(`Failed to update inventory for product: ${product.name}`);
    }
    
    // Get updated product to confirm new stock level
    const updatedProduct = ecommerceStore.getProduct(product.id);
    const newStock = updatedProduct?.stock || 0;
    
    // Generate appropriate message
    let message = '';
    switch (operation) {
      case 'add':
        message = `Added ${quantity} units to ${product.name}. Stock increased from ${previousStock} to ${newStock}.`;
        break;
      case 'subtract':
        message = `Removed ${quantity} units from ${product.name}. Stock decreased from ${previousStock} to ${newStock}.`;
        break;
      case 'set':
        message = `Set stock level for ${product.name} to ${newStock} units. Previous stock was ${previousStock}.`;
        break;
    }
    
    if (newStock === 0) {
      message += ' ⚠️ Product is now out of stock.';
    } else if (newStock <= 10) {
      message += ' ⚠️ Product stock is now low.';
    }
    
    return {
      success,
      productId: product.id,
      productName: product.name,
      previousStock,
      newStock,
      operation,
      quantity,
      reason,
      message,
    };
  },
});
