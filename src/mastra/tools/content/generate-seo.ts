import { createTool } from '@mastra/core';
import { z } from 'zod';
import { ecommerceStore } from '../../../data/store';

const generateSEOSchema = z.object({
  productId: z.string().optional().describe('Product ID to generate SEO content for'),
  productName: z.string().optional().describe('Product name (required if productId not provided)'),
  category: z.string().optional().describe('Product category'),
  primaryKeywords: z.array(z.string()).optional().describe('Primary keywords to target'),
  secondaryKeywords: z.array(z.string()).optional().describe('Secondary keywords to include'),
  location: z.string().optional().describe('Target location for local SEO'),
  contentType: z.enum(['product_page', 'category_page', 'blog_post']).default('product_page').describe('Type of content for SEO optimization')
});

const generateSEOOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  content: z.object({
    title: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()),
    headings: z.object({
      h1: z.string(),
      h2: z.array(z.string()),
      h3: z.array(z.string())
    }),
    altText: z.string(),
    structuredData: z.object({
      type: z.string(),
      properties: z.record(z.any())
    }),
    urlSlug: z.string()
  }).optional()
});

export const generateSEO = createTool({
  id: 'generateSEO',
  description: 'Generate SEO-optimized content including titles, meta descriptions, keywords, and structured data',
  inputSchema: generateSEOSchema,
  outputSchema: generateSEOOutputSchema,
  execute: async ({ context }) => {
    const { productId, productName, category, primaryKeywords, secondaryKeywords, location, contentType } = context;
    try {
      let product = null;
      let name = productName;
      let productCategory = category;
      let price = 0;

      // If productId is provided, get product data from store
      if (productId) {
        product = ecommerceStore.getProduct(productId);
        if (!product) {
          return {
            success: false,
            message: `Product with ID ${productId} not found`
          };
        }
        name = product.name;
        productCategory = product.category;
        price = product.price;
      }

      if (!name) {
        return {
          success: false,
          message: 'Product name is required (either provide productId or productName)'
        };
      }

      // Generate keywords if not provided
      const keywords = generateKeywords(name, productCategory || '', primaryKeywords, secondaryKeywords, location);
      
      // Generate SEO content
      const seoContent = generateSEOContent(
        name, 
        productCategory || 'General', 
        keywords, 
        location,
        contentType,
        price
      );

      return {
        success: true,
        message: `SEO content generated successfully for "${name}"`,
        content: seoContent
      };
    } catch (error) {
      console.error('Error generating SEO content:', error);
      return {
        success: false,
        message: `Error generating SEO content: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
});

function generateKeywords(
  name: string, 
  category: string, 
  primaryKeywords?: string[], 
  secondaryKeywords?: string[], 
  location?: string
): string[] {
  const baseKeywords = [
    name.toLowerCase(),
    category.toLowerCase(),
    `${name.toLowerCase()} ${category.toLowerCase()}`,
    `buy ${name.toLowerCase()}`,
    `${name.toLowerCase()} for sale`,
    `best ${name.toLowerCase()}`,
    `${category.toLowerCase()} online`
  ];

  if (location) {
    baseKeywords.push(
      `${name.toLowerCase()} ${location.toLowerCase()}`,
      `${category.toLowerCase()} ${location.toLowerCase()}`,
      `buy ${name.toLowerCase()} ${location.toLowerCase()}`
    );
  }

  const allKeywords = [
    ...baseKeywords,
    ...(primaryKeywords || []),
    ...(secondaryKeywords || [])
  ];

  // Remove duplicates and return
  return Array.from(new Set(allKeywords));
}

function generateSEOContent(
  name: string, 
  category: string, 
  keywords: string[], 
  location?: string, 
  contentType: string = 'product_page',
  price: number = 0
) {
  const locationSuffix = location ? ` in ${location}` : '';
  const primaryKeyword = keywords[0] || name.toLowerCase();

  // Generate title
  let title = '';
  if (contentType === 'product_page') {
    title = `${name} - Premium ${category}${locationSuffix} | Shop Now`;
  } else if (contentType === 'category_page') {
    title = `${category} Collection${locationSuffix} | Quality Products Online`;
  } else {
    title = `${name}: Complete Guide & Reviews${locationSuffix}`;
  }

  // Generate meta description
  const metaDescription = contentType === 'product_page' 
    ? `Discover our premium ${name} in the ${category.toLowerCase()} category. ${location ? `Available in ${location}. ` : ''}Shop now for quality, reliability, and great value. Free shipping available.`
    : `Explore our comprehensive ${category.toLowerCase()} collection${locationSuffix}. Find the perfect products with expert reviews, detailed guides, and competitive prices.`;

  // Generate headings
  const headings = {
    h1: contentType === 'product_page' ? name : `${category} - Premium Quality Products`,
    h2: contentType === 'product_page' 
      ? [`About ${name}`, `Key Features`, `Specifications`, `Customer Reviews`]
      : [`Best ${category} Products`, `Buying Guide`, `Customer Favorites`, `Expert Recommendations`],
    h3: contentType === 'product_page'
      ? [`Why Choose ${name}`, 'Product Details', 'Care Instructions', 'Warranty Information']
      : [`Top Rated ${category}`, 'Budget-Friendly Options', 'Premium Selection', 'Customer Support']
  };

  // Generate alt text
  const altText = `${name} - Premium ${category.toLowerCase()} product image showing quality and design`;

  // Generate URL slug
  const urlSlug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Generate structured data
  const structuredData = {
    type: 'Product',
    properties: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: name,
      description: metaDescription,
      category: category,
      ...(price > 0 && {
        offers: {
          '@type': 'Offer',
          price: price.toString(),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        }
      }),
      brand: {
        '@type': 'Brand',
        name: 'Aria Store'
      }
    }
  };

  return {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    metaDescription: metaDescription.length > 160 ? metaDescription.substring(0, 157) + '...' : metaDescription,
    keywords,
    headings,
    altText,
    structuredData,
    urlSlug
  };
}
