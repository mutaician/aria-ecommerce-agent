import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDataStore } from '../../../data/store';
import { isAfter, isBefore, subDays, startOfDay, endOfDay, format } from 'date-fns';

export const salesAnalytics = createTool({
  id: 'salesAnalytics',
  description: 'Generate comprehensive sales analytics and insights with trends, comparisons, and forecasting',
  inputSchema: z.object({
    dateRange: z.object({
      startDate: z.string().describe('Start date in YYYY-MM-DD format'),
      endDate: z.string().describe('End date in YYYY-MM-DD format'),
    }),
    compareWithPrevious: z.boolean().default(true).describe('Compare with previous period'),
    groupBy: z.enum(['day', 'week', 'month']).default('day').describe('How to group the analytics data'),
    includeProductBreakdown: z.boolean().default(true).describe('Include product-level performance breakdown'),
    includeCategoryAnalysis: z.boolean().default(true).describe('Include category performance analysis'),
    includeCustomerInsights: z.boolean().default(false).describe('Include customer behavior insights'),
  }),
  outputSchema: z.object({
    summary: z.object({
      totalRevenue: z.number(),
      totalOrders: z.number(),
      averageOrderValue: z.number(),
      totalUnits: z.number(),
      conversionRate: z.number().optional(),
    }),
    trends: z.object({
      revenueGrowth: z.number(),
      orderGrowth: z.number(),
      aovGrowth: z.number(),
      trend: z.enum(['increasing', 'decreasing', 'stable']),
    }),
    comparison: z.object({
      previousPeriod: z.object({
        revenue: z.number(),
        orders: z.number(),
        aov: z.number(),
      }),
      percentageChange: z.object({
        revenue: z.number(),
        orders: z.number(),
        aov: z.number(),
      }),
    }).optional(),
    topProducts: z.array(z.object({
      productId: z.string(),
      productName: z.string(),
      revenue: z.number(),
      unitsSold: z.number(),
      averagePrice: z.number(),
    })),
    categoryPerformance: z.array(z.object({
      category: z.string(),
      revenue: z.number(),
      orders: z.number(),
      averageOrderValue: z.number(),
      percentageOfTotal: z.number(),
    })).optional(),
    timeSeriesData: z.array(z.object({
      period: z.string(),
      revenue: z.number(),
      orders: z.number(),
      averageOrderValue: z.number(),
    })),
    insights: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const store = getDataStore();
    
    try {
      const startDate = new Date(context.dateRange.startDate);
      const endDate = new Date(context.dateRange.endDate);
      
      // Get sales data for the specified period
      const sales = store.getSalesByDateRange(startDate, endDate);
      
      // Calculate basic metrics
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalOrders = sales.length;
      const totalUnits = sales.reduce((sum, sale) => sum + sale.quantity, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Get product performance
      const productPerformance = new Map<string, {
        id: string;
        name: string;
        revenue: number;
        units: number;
        orders: number;
      }>();
      
      sales.forEach(sale => {
        const existing = productPerformance.get(sale.productId) || {
          id: sale.productId,
          name: sale.productName,
          revenue: 0,
          units: 0,
          orders: 0,
        };
        
        existing.revenue += sale.totalAmount;
        existing.units += sale.quantity;
        existing.orders += 1;
        
        productPerformance.set(sale.productId, existing);
      });
      
      // Get top products
      const topProducts = Array.from(productPerformance.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(product => ({
          productId: product.id,
          productName: product.name,
          revenue: product.revenue,
          unitsSold: product.units,
          averagePrice: product.revenue / product.units,
        }));
      
      // Category performance analysis
      let categoryPerformance: any[] | undefined;
      if (context.includeCategoryAnalysis) {
        const categoryStats = new Map<string, {
          revenue: number;
          orders: number;
          units: number;
        }>();
        
        sales.forEach(sale => {
          const product = store.getProduct(sale.productId);
          if (product) {
            const existing = categoryStats.get(product.category) || {
              revenue: 0,
              orders: 0,
              units: 0,
            };
            
            existing.revenue += sale.totalAmount;
            existing.orders += 1;
            existing.units += sale.quantity;
            
            categoryStats.set(product.category, existing);
          }
        });
        
        categoryPerformance = Array.from(categoryStats.entries()).map(([category, stats]) => ({
          category,
          revenue: stats.revenue,
          orders: stats.orders,
          averageOrderValue: stats.revenue / stats.orders,
          percentageOfTotal: (stats.revenue / totalRevenue) * 100,
        })).sort((a, b) => b.revenue - a.revenue);
      }
      
      // Time series data
      const timeSeriesData = [];
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (context.groupBy === 'day') {
        for (let i = 0; i <= daysDiff; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          
          const dayStart = startOfDay(currentDate);
          const dayEnd = endOfDay(currentDate);
          
          const daySales = sales.filter(sale => 
            isAfter(sale.timestamp, dayStart) && isBefore(sale.timestamp, dayEnd)
          );
          
          const dayRevenue = daySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
          const dayOrders = daySales.length;
          
          timeSeriesData.push({
            period: format(currentDate, 'yyyy-MM-dd'),
            revenue: dayRevenue,
            orders: dayOrders,
            averageOrderValue: dayOrders > 0 ? dayRevenue / dayOrders : 0,
          });
        }
      }
      
      // Comparison with previous period
      let comparison;
      if (context.compareWithPrevious) {
        const periodDuration = endDate.getTime() - startDate.getTime();
        const prevEndDate = new Date(startDate.getTime() - 1);
        const prevStartDate = new Date(prevEndDate.getTime() - periodDuration);
        
        const prevSales = store.getSalesByDateRange(prevStartDate, prevEndDate);
        const prevRevenue = prevSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const prevOrders = prevSales.length;
        const prevAOV = prevOrders > 0 ? prevRevenue / prevOrders : 0;
        
        comparison = {
          previousPeriod: {
            revenue: prevRevenue,
            orders: prevOrders,
            aov: prevAOV,
          },
          percentageChange: {
            revenue: prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0,
            orders: prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0,
            aov: prevAOV > 0 ? ((averageOrderValue - prevAOV) / prevAOV) * 100 : 0,
          },
        };
      }
      
      // Generate insights
      const insights = [];
      
      if (comparison) {
        if (comparison.percentageChange.revenue > 10) {
          insights.push(`Strong revenue growth of ${comparison.percentageChange.revenue.toFixed(1)}% compared to previous period`);
        } else if (comparison.percentageChange.revenue < -10) {
          insights.push(`Revenue declined by ${Math.abs(comparison.percentageChange.revenue).toFixed(1)}% - consider promotional strategies`);
        }
        
        if (comparison.percentageChange.aov > 5) {
          insights.push(`Average order value increased by ${comparison.percentageChange.aov.toFixed(1)}% - customers buying higher-value items`);
        }
      }
      
      if (topProducts.length > 0) {
        const topProduct = topProducts[0];
        const topProductShare = (topProduct.revenue / totalRevenue) * 100;
        if (topProductShare > 30) {
          insights.push(`${topProduct.productName} dominates sales with ${topProductShare.toFixed(1)}% of revenue`);
        }
      }
      
      if (averageOrderValue > 0) {
        if (averageOrderValue > 100) {
          insights.push('High average order value suggests premium positioning is working well');
        } else if (averageOrderValue < 25) {
          insights.push('Low average order value - consider bundling or upselling strategies');
        }
      }
      
      // Determine trend
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (comparison) {
        if (comparison.percentageChange.revenue > 5) trend = 'increasing';
        else if (comparison.percentageChange.revenue < -5) trend = 'decreasing';
      }
      
      return {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          totalUnits,
        },
        trends: {
          revenueGrowth: comparison?.percentageChange.revenue || 0,
          orderGrowth: comparison?.percentageChange.orders || 0,
          aovGrowth: comparison?.percentageChange.aov || 0,
          trend,
        },
        comparison,
        topProducts,
        categoryPerformance,
        timeSeriesData,
        insights,
      };
      
    } catch (error) {
      throw new Error(`Failed to generate sales analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
