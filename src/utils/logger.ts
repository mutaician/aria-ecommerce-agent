/**
 * Custom logging utilities for the Aria E-commerce Agent
 * Provides structured logging for operations, errors, and analytics
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

class AriaLogger {
  private static instance: AriaLogger;
  private logs: LogEntry[] = [];
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  static getInstance(): AriaLogger {
    if (!AriaLogger.instance) {
      AriaLogger.instance = new AriaLogger();
    }
    return AriaLogger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private log(level: LogLevel, category: string, message: string, metadata?: Record<string, any>): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
    };

    this.logs.push(entry);

    // Console output with colors
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    const levelName = LogLevel[level];
    
    console.log(
      `${colors[level]}[${entry.timestamp}] ${levelName} [${category}]${reset} ${message}`,
      metadata ? JSON.stringify(metadata, null, 2) : ''
    );
  }

  debug(category: string, message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, category, message, metadata);
  }

  info(category: string, message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, category, message, metadata);
  }

  warn(category: string, message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, category, message, metadata);
  }

  error(category: string, message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, category, message, metadata);
  }

  // Specialized logging methods for different operations

  /**
   * Log inventory operations
   */
  logInventoryOperation(operation: 'update' | 'check' | 'alert', productId: string, details: Record<string, any>): void {
    this.info('INVENTORY', `${operation.toUpperCase()} operation for product ${productId}`, {
      productId,
      operation,
      ...details,
    });
  }

  /**
   * Log product operations
   */
  logProductOperation(operation: 'create' | 'update' | 'delete' | 'toggle', productId: string, details: Record<string, any>): void {
    this.info('PRODUCT', `${operation.toUpperCase()} operation for product ${productId}`, {
      productId,
      operation,
      ...details,
    });
  }

  /**
   * Log sales operations and analytics
   */
  logSalesOperation(operation: 'query' | 'analytics' | 'report', details: Record<string, any>): void {
    this.info('SALES', `${operation.toUpperCase()} operation`, {
      operation,
      ...details,
    });
  }

  /**
   * Log content generation operations
   */
  logContentGeneration(type: 'description' | 'seo' | 'blog' | 'social', productId?: string, details?: Record<string, any>): void {
    this.info('CONTENT', `Generated ${type} content${productId ? ` for product ${productId}` : ''}`, {
      type,
      productId,
      ...details,
    });
  }

  /**
   * Log agent interactions
   */
  logAgentInteraction(userId: string, query: string, toolsUsed: string[], response?: string): void {
    this.info('AGENT', `User interaction`, {
      userId,
      query,
      toolsUsed,
      responseLength: response?.length,
    });
  }

  /**
   * Log errors with context
   */
  logError(category: string, error: Error, context?: Record<string, any>): void {
    this.error(category, error.message, {
      errorName: error.name,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    this.debug('PERFORMANCE', `${operation} completed in ${duration}ms`, {
      operation,
      duration,
      ...metadata,
    });
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: string, limit: number = 50): LogEntry[] {
    return this.logs
      .filter(log => log.category === category)
      .slice(-limit);
  }

  /**
   * Get error logs
   */
  getErrorLogs(limit: number = 20): LogEntry[] {
    return this.logs
      .filter(log => log.level === LogLevel.ERROR)
      .slice(-limit);
  }

  /**
   * Clear old logs to prevent memory issues
   */
  clearOldLogs(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoff);
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get statistics about logging
   */
  getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    oldestEntry?: string;
    newestEntry?: string;
  } {
    const byLevel: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    this.logs.forEach(log => {
      const levelName = LogLevel[log.level];
      byLevel[levelName] = (byLevel[levelName] || 0) + 1;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    });

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      oldestEntry: this.logs[0]?.timestamp,
      newestEntry: this.logs[this.logs.length - 1]?.timestamp,
    };
  }
}

// Export singleton instance
export const logger = AriaLogger.getInstance();

// Export convenience functions
export const logInventory = logger.logInventoryOperation.bind(logger);
export const logProduct = logger.logProductOperation.bind(logger);
export const logSales = logger.logSalesOperation.bind(logger);
export const logContent = logger.logContentGeneration.bind(logger);
export const logAgent = logger.logAgentInteraction.bind(logger);
export const logError = logger.logError.bind(logger);
export const logPerformance = logger.logPerformance.bind(logger);

export default logger;
