/**
 * Output formatting utilities for the Aria E-commerce Agent
 * Provides consistent formatting for various data types and responses
 */

/**
 * Format currency values with proper locale support
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format numbers with thousand separators
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format dates in a user-friendly way
 */
export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'long', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };

  return dateObj.toLocaleDateString('en-US', options[format]);
}

/**
 * Format time ranges for analytics
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return `${formatDate(start, 'short')} - ${formatDate(end, 'short')}`;
}

/**
 * Format stock status with appropriate styling hints
 */
export function formatStockStatus(quantity: number, lowStockThreshold: number = 10): {
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  message: string;
  color: 'green' | 'yellow' | 'red';
} {
  if (quantity === 0) {
    return {
      status: 'out-of-stock',
      message: 'Out of Stock',
      color: 'red',
    };
  } else if (quantity <= lowStockThreshold) {
    return {
      status: 'low-stock',
      message: `Low Stock (${quantity} remaining)`,
      color: 'yellow',
    };
  } else {
    return {
      status: 'in-stock',
      message: `In Stock (${quantity} available)`,
      color: 'green',
    };
  }
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format product dimensions
 */
export function formatDimensions(dimensions: { length: number; width: number; height: number }, unit: string = 'cm'): string {
  return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} ${unit}`;
}

/**
 * Format weight with appropriate units
 */
export function formatWeight(weight: number, unit: string = 'kg'): string {
  if (weight < 1 && unit === 'kg') {
    return `${(weight * 1000).toFixed(0)}g`;
  }
  return `${weight.toFixed(2)} ${unit}`;
}

/**
 * Format product tags as a readable list
 */
export function formatTags(tags: string[]): string {
  if (tags.length === 0) return 'No tags';
  if (tags.length === 1) return tags[0];
  if (tags.length === 2) return `${tags[0]} and ${tags[1]}`;
  
  const lastTag = tags[tags.length - 1];
  const otherTags = tags.slice(0, -1).join(', ');
  return `${otherTags}, and ${lastTag}`;
}

/**
 * Format analytics trends with arrows and colors
 */
export function formatTrend(current: number, previous: number): {
  direction: 'up' | 'down' | 'flat';
  percentage: string;
  arrow: string;
  color: 'green' | 'red' | 'gray';
} {
  if (previous === 0) {
    return {
      direction: 'flat',
      percentage: 'N/A',
      arrow: '→',
      color: 'gray',
    };
  }

  const change = ((current - previous) / previous) * 100;
  
  if (Math.abs(change) < 0.1) {
    return {
      direction: 'flat',
      percentage: '0.0%',
      arrow: '→',
      color: 'gray',
    };
  }

  return {
    direction: change > 0 ? 'up' : 'down',
    percentage: `${Math.abs(change).toFixed(1)}%`,
    arrow: change > 0 ? '↗' : '↘',
    color: change > 0 ? 'green' : 'red',
  };
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format order status with appropriate styling
 */
export function formatOrderStatus(status: string): {
  label: string;
  color: 'blue' | 'yellow' | 'green' | 'red' | 'gray';
} {
  const statusMap = {
    pending: { label: 'Pending', color: 'yellow' as const },
    processing: { label: 'Processing', color: 'blue' as const },
    shipped: { label: 'Shipped', color: 'blue' as const },
    delivered: { label: 'Delivered', color: 'green' as const },
    cancelled: { label: 'Cancelled', color: 'red' as const },
  };

  return statusMap[status as keyof typeof statusMap] || { label: status, color: 'gray' };
}

/**
 * Format product list for display
 */
export function formatProductList(products: Array<{ name: string; price: number; stock: number }>): string {
  return products
    .map(product => `• ${product.name} - ${formatCurrency(product.price)} (${product.stock} in stock)`)
    .join('\n');
}

/**
 * Format sales summary for reports
 */
export function formatSalesSummary(data: {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  period: string;
}): string {
  return `📊 Sales Summary (${data.period})
💰 Total Revenue: ${formatCurrency(data.totalSales)}
📦 Total Orders: ${formatNumber(data.totalOrders)}
💳 Average Order Value: ${formatCurrency(data.avgOrderValue)}`;
}
