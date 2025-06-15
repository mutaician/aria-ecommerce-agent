// Inventory Management Tools
import { getProductStock, getLowStockAlerts, updateInventory } from './inventory';
// Product Management Tools
import { getProduct, addNewProduct, updateProduct, toggleVisibility, getProductsByCollectionTool, getAllProducts } from './products';
// Sales and Analytics Tools
import { getSalesData, salesAnalytics, revenueReports } from './sales';
// Content Generation Tools
import { generateProductDescription, generateSEO, generateBlogPost, generateSocialMediaContent } from './content';

// All tools array for easy agent configuration
export const allAriaTools = [
  // Inventory Management
  getProductStock,
  getLowStockAlerts,
  updateInventory,
  
  // Product Management
  getProduct,
  addNewProduct,
  updateProduct,
  toggleVisibility,
  getProductsByCollectionTool,
  
  // Sales and Analytics
  getSalesData,
  salesAnalytics,
  revenueReports,
  
  // Content Generation
  generateProductDescription,
  generateSEO,
  generateBlogPost,
  generateSocialMediaContent,
];

// Tools object for Mastra agent configuration
export const ariaToolsRecord = {
  // Inventory Management
  getProductStock,
  getLowStockAlerts,
  updateInventory,
  
  // Product Management
  getAllProducts,
  getProduct,
  addNewProduct,
  updateProduct,
  toggleVisibility,
  getProductsByCollectionTool,
  
  // Sales and Analytics
  getSalesData,
  salesAnalytics,
  revenueReports,
  
  // Content Generation
  generateProductDescription,
  generateSEO,
  generateBlogPost,
  generateSocialMediaContent,
};
