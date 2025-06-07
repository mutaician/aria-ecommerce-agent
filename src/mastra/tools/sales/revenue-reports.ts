import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDataStore } from '../../../data/store';

export const revenueReports = createTool({
  id: 'revenueReports',
  description: 'Generate comprehensive revenue reports with breakdowns by time periods, categories, and payment methods',
  inputSchema: z.object({
    reportType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']).describe('Type of revenue report to generate'),
    startDate: z.string().optional().describe('Start date in YYYY-MM-DD format (required for custom reports)'),
    endDate: z.string().optional().describe('End date in YYYY-MM-DD format (required for custom reports)'),
    includeCategoryBreakdown: z.boolean().default(true).describe('Include revenue breakdown by product categories'),
    includePaymentMethods: z.boolean().default(true).describe('Include breakdown by payment methods'),
    includeCustomerInsights: z.boolean().default(false).describe('Include customer purchase behavior insights'),
    compareWithPrevious: z.boolean().default(true).describe('Compare with previous period'),
  }),
  outputSchema: z.object({
    reportPeriod: z.object({
      start: z.string(),
      end: z.string(),
      type: z.string(),
    }),
    totalRevenue: z.number(),
    totalOrders: z.number(),
    averageOrderValue: z.number(),
    growthRate: z.number().optional(),
    categoryBreakdown: z.array(z.object({
      category: z.string(),
      revenue: z.number(),
      orders: z.number(),
      percentage: z.number(),
    })).optional(),
    paymentMethodBreakdown: z.array(z.object({
      method: z.string(),
      revenue: z.number(),
      orders: z.number(),
      percentage: z.number(),
    })).optional(),
    topProducts: z.array(z.object({
      productId: z.string(),
      productName: z.string(),
      revenue: z.number(),
      unitsSold: z.number(),
    })),
    customerInsights: z.object({
      newCustomers: z.number(),
      returningCustomers: z.number(),
      averageCustomerValue: z.number(),
    }).optional(),
    dailyBreakdown: z.array(z.object({
      date: z.string(),
      revenue: z.number(),
      orders: z.number(),
    })).optional(),
    previousPeriodComparison: z.object({
      revenue: z.object({
        current: z.number(),
        previous: z.number(),
        change: z.number(),
        changePercentage: z.number(),
      }),
      orders: z.object({
        current: z.number(),
        previous: z.number(),
        change: z.number(),
        changePercentage: z.number(),
      }),
    }).optional(),
  }),
  execute: async ({ context }) => {
    const store = getDataStore();
    const { 
      reportType, 
      startDate, 
      endDate, 
      includeCategoryBreakdown,
      includePaymentMethods,
      includeCustomerInsights,
      compareWithPrevious 
    } = context;

    // Calculate date range based on report type
    let reportStart: Date;
    let reportEnd: Date;
    const now = new Date();

    switch (reportType) {
      case 'daily':
        reportStart = new Date(now);
        reportStart.setHours(0, 0, 0, 0);
        reportEnd = new Date(now);
        reportEnd.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        reportStart = new Date(now);
        reportStart.setDate(now.getDate() - 7);
        reportEnd = new Date(now);
        break;
      case 'monthly':
        reportStart = new Date(now.getFullYear(), now.getMonth(), 1);
        reportEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        reportStart = new Date(now.getFullYear(), quarter * 3, 1);
        reportEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'yearly':
        reportStart = new Date(now.getFullYear(), 0, 1);
        reportEnd = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        if (!startDate || !endDate) {
          throw new Error('Start date and end date are required for custom reports');
        }
        reportStart = new Date(startDate);
        reportEnd = new Date(endDate);
        break;
      default:
        throw new Error(`Invalid report type: ${reportType}`);
    }

    // Get sales data for the period
    const salesData = store.getSalesByDateRange(reportStart, reportEnd);
    
    // Calculate basic metrics
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalOrders = salesData.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate category breakdown if requested
    let categoryBreakdown;
    if (includeCategoryBreakdown) {
      const categoryMap = new Map<string, { revenue: number; orders: number }>();
      
      for (const sale of salesData) {
        const product = store.getProduct(sale.productId);
        const category = product?.category || 'Unknown';
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { revenue: 0, orders: 0 });
        }
        
        const categoryData = categoryMap.get(category)!;
        categoryData.revenue += sale.totalAmount;
        categoryData.orders += 1;
      }

      categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        revenue: data.revenue,
        orders: data.orders,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }));
    }

    // Calculate payment method breakdown if requested
    let paymentMethodBreakdown;
    if (includePaymentMethods) {
      const paymentMap = new Map<string, { revenue: number; orders: number }>();
      
      for (const sale of salesData) {
        const method = sale.paymentMethod || 'Unknown';
        
        if (!paymentMap.has(method)) {
          paymentMap.set(method, { revenue: 0, orders: 0 });
        }
        
        const methodData = paymentMap.get(method)!;
        methodData.revenue += sale.totalAmount;
        methodData.orders += 1;
      }

      paymentMethodBreakdown = Array.from(paymentMap.entries()).map(([method, data]) => ({
        method,
        revenue: data.revenue,
        orders: data.orders,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }));
    }

    // Calculate top products
    const productMap = new Map<string, { name: string; revenue: number; unitsSold: number }>();
    
    for (const sale of salesData) {
      const product = store.getProduct(sale.productId);
      const productName = product?.name || 'Unknown Product';
      
      if (!productMap.has(sale.productId)) {
        productMap.set(sale.productId, { name: productName, revenue: 0, unitsSold: 0 });
      }
      
      const productData = productMap.get(sale.productId)!;
      productData.revenue += sale.totalAmount;
      productData.unitsSold += sale.quantity;
    }

    const topProducts = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        revenue: data.revenue,
        unitsSold: data.unitsSold,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate customer insights if requested
    let customerInsights;
    if (includeCustomerInsights) {
      const customerEmails = new Set(salesData.map(sale => sale.customerEmail));
      const customerPurchases = new Map<string, number>();
      
      for (const sale of salesData) {
        const email = sale.customerEmail;
        customerPurchases.set(email, (customerPurchases.get(email) || 0) + sale.totalAmount);
      }

      const averageCustomerValue = Array.from(customerPurchases.values())
        .reduce((sum, value) => sum + value, 0) / customerPurchases.size;

      customerInsights = {
        newCustomers: customerEmails.size, // Simplified - in real app, would check if customer exists before this period
        returningCustomers: 0, // Simplified - would need historical data
        averageCustomerValue,
      };
    }

    // Calculate daily breakdown for trend analysis
    const dailyBreakdown = [];
    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    
    for (const sale of salesData) {
      const dateKey = sale.timestamp.toISOString().split('T')[0];
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { revenue: 0, orders: 0 });
      }
      
      const dayData = dailyMap.get(dateKey)!;
      dayData.revenue += sale.totalAmount;
      dayData.orders += 1;
    }

    for (const [date, data] of dailyMap.entries()) {
      dailyBreakdown.push({
        date,
        revenue: data.revenue,
        orders: data.orders,
      });
    }

    dailyBreakdown.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate previous period comparison if requested
    let previousPeriodComparison;
    let growthRate;
    
    if (compareWithPrevious) {
      const periodLength = reportEnd.getTime() - reportStart.getTime();
      const prevStart = new Date(reportStart.getTime() - periodLength);
      const prevEnd = new Date(reportEnd.getTime() - periodLength);
      
      const prevSalesData = store.getSalesByDateRange(prevStart, prevEnd);
      const prevRevenue = prevSalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const prevOrders = prevSalesData.length;

      const revenueChange = totalRevenue - prevRevenue;
      const revenueChangePercentage = prevRevenue > 0 ? (revenueChange / prevRevenue) * 100 : 0;
      
      const ordersChange = totalOrders - prevOrders;
      const ordersChangePercentage = prevOrders > 0 ? (ordersChange / prevOrders) * 100 : 0;

      growthRate = revenueChangePercentage;

      previousPeriodComparison = {
        revenue: {
          current: totalRevenue,
          previous: prevRevenue,
          change: revenueChange,
          changePercentage: revenueChangePercentage,
        },
        orders: {
          current: totalOrders,
          previous: prevOrders,
          change: ordersChange,
          changePercentage: ordersChangePercentage,
        },
      };
    }

    return {
      reportPeriod: {
        start: reportStart.toISOString().split('T')[0],
        end: reportEnd.toISOString().split('T')[0],
        type: reportType,
      },
      totalRevenue,
      totalOrders,
      averageOrderValue,
      growthRate,
      categoryBreakdown,
      paymentMethodBreakdown,
      topProducts,
      customerInsights,
      dailyBreakdown: dailyBreakdown.length > 0 ? dailyBreakdown : undefined,
      previousPeriodComparison,
    };
  },
});
