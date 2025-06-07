import { z } from 'zod';

// Product validation schemas
export const productValidationSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  collection: z.string().min(1, 'Collection is required'),
  stockQuantity: z.number().min(0, 'Stock quantity cannot be negative'),
  isVisible: z.boolean().default(true),
  brand: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    stockQuantity: z.number().min(0),
    attributes: z.record(z.string()),
  })).optional(),
});

export const updateProductValidationSchema = productValidationSchema.partial().extend({
  id: z.string().min(1, 'Product ID is required'),
});

// Sale validation schemas
export const saleValidationSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  totalAmount: z.number().positive('Total amount must be positive'),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerEmail: z.string().email('Valid email is required'),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']),
  paymentMethod: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }).optional(),
});

// Inventory validation schemas
export const inventoryUpdateSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int('Quantity must be an integer'),
  operation: z.enum(['set', 'add', 'subtract']).default('set'),
  reason: z.string().optional(),
});

// Analytics validation schemas
export const analyticsDateRangeSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), 'Start date must be before end date');

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Content generation validation schemas
export const contentGenerationSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  tone: z.enum(['professional', 'casual', 'friendly', 'luxury', 'technical']).optional(),
  targetAudience: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

// Validation helper functions
export function validateProduct(data: unknown) {
  return productValidationSchema.parse(data);
}

export function validateSale(data: unknown) {
  return saleValidationSchema.parse(data);
}

export function validateInventoryUpdate(data: unknown) {
  return inventoryUpdateSchema.parse(data);
}

export function validateDateRange(data: unknown) {
  return analyticsDateRangeSchema.parse(data);
}

export function validatePagination(data: unknown) {
  return paginationSchema.parse(data);
}

export function validateContentGeneration(data: unknown) {
  return contentGenerationSchema.parse(data);
}

// Custom validation errors
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleValidationError(error: z.ZodError): ValidationError {
  const firstError = error.errors[0];
  return new ValidationError(
    `${firstError.path.join('.')}: ${firstError.message}`,
    firstError.path.join('.')
  );
}

// Additional validation utilities
export function isValidProductId(id: string): boolean {
  return typeof id === 'string' && id.length > 0;
}

export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price > 0 && isFinite(price);
}

export function isValidQuantity(quantity: number): boolean {
  return typeof quantity === 'number' && quantity >= 0 && Number.isInteger(quantity);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    throw new ValidationError('Search query must be a string');
  }
  const sanitized = sanitizeString(query);
  if (sanitized.length === 0) {
    throw new ValidationError('Search query cannot be empty');
  }
  if (sanitized.length > 100) {
    throw new ValidationError('Search query is too long (max 100 characters)');
  }
  return sanitized;
}
