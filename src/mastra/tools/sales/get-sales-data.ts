// Level 1 Tool: Get Sales Data and Analytics
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { ecommerceStore } from '../../../data/store';

export const getSalesData = createTool({
  id: 'getSalesData',
  description: 'Retrieve sales data and analytics for specified time periods. Use this tool when users ask about sales performance, revenue, or order analytics.',
  inputSchema: z.object({
    period: z.enum(['today', 'yesterday', 'last-week', 'last-month', 'custom']).describe('Time period for sales data'),
    startDate: z.string().optional().describe('Start date for custom period (ISO format: YYYY-MM-DD)'),
    endDate: z.string().optional().describe('End date for custom period (ISO format: YYYY-MM-DD)'),
    includeMetrics: z.boolean().default(true).describe('Whether to include detailed analytics metrics'),
  }),
  outputSchema: z.object({
    period: z.string(),
    totalSales: z.number(),
    totalOrders: z.number(),
    avgOrderValue: z.number(),
    salesData: z.array(z.object({
      id: z.string(),
      productName: z.string(),
      quantity: z.number(),
      totalAmount: z.number(),
      customerEmail: z.string(),
      status: z.string(),
      timestamp: z.string(),
    })),
    metrics: z.object({
      topProducts: z.array(z.object({
        id: z.string(),
        name: z.string(),
        sales: z.number(),
      })),
      categoryPerformance: z.array(z.object({
        category: z.string(),
        revenue: z.number(),
        orders: z.number(),
      })),
    }).optional(),
  }),
  execute: async ({ context }) => {
    const { period, startDate, endDate, includeMetrics } = context;
    
    let start: Date;
    let end: Date;
    
    // Calculate date range based on period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        start = today;
        end = now;
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        start = yesterday;
        end = new Date(yesterday);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last-week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo;
        end = now;
        break;
      case 'last-month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo;
        end = now;
        break;
      case 'custom':
        if (!startDate || !endDate) {
          throw new Error('Start date and end date are required for custom period');
        }
        start = new Date(startDate);
        end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format. Use YYYY-MM-DD format.');
        }
        break;
      default:
        throw new Error(`Invalid period: ${period}`);
    }
    
    // Get sales data for the period
    const salesData = ecommerceStore.getSalesByDateRange(start, end);
    
    // Calculate basic metrics
    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalOrders = salesData.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Format sales data
    const formattedSalesData = salesData.map(sale => ({
      id: sale.id,
      productName: sale.productName,
      quantity: sale.quantity,
      totalAmount: sale.totalAmount,
      customerEmail: sale.customerEmail,
      status: sale.status,
      timestamp: sale.timestamp.toISOString(),
    }));
    
    let metrics;
    if (includeMetrics) {
      const analytics = ecommerceStore.getSalesAnalytics({ start, end });
      metrics = {
        topProducts: analytics.topProducts,
        categoryPerformance: analytics.categoryPerformance,
      };
    }
    
    return {
      period: period === 'custom' ? `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}` : period,
      totalSales,
      totalOrders,
      avgOrderValue,
      salesData: formattedSalesData,
      metrics,
    };
  },
});
