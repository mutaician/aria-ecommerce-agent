// Level 3 Content Generation Tool: Generate Blog Posts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDataStore } from '../../../data/store';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const generateBlogPost = createTool({
  id: 'generateBlogPost',
  description: 'Write marketing blog posts about products, collections, or store announcements',
  inputSchema: z.object({
    topic: z.string().describe('Blog post topic or theme'),
    postType: z.enum(['product-feature', 'collection-announce', 'how-to', 'news']).describe('Type of blog post to create'),
    targetWordCount: z.number().min(100).max(2000).default(500).describe('Target word count for the blog post'),
    includeProducts: z.array(z.string()).optional().describe('Product IDs or names to feature in the blog post'),
    tone: z.enum(['casual', 'professional', 'friendly', 'authoritative']).default('friendly').describe('Writing tone for the blog post'),
    includeSEO: z.boolean().default(true).describe('Whether to include SEO-optimized elements'),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    metaDescription: z.string(),
    suggestedTags: z.array(z.string()),
    estimatedReadTime: z.string(),
    seoKeywords: z.array(z.string()).optional(),
    callToAction: z.string(),
  }),
  execute: async ({ context }) => {
    const store = getDataStore();
    
    try {
      // Gather product information if specified
      let productContext = '';
      if (context.includeProducts && context.includeProducts.length > 0) {
        const products = [];
        for (const productId of context.includeProducts) {
          const product = store.getProduct(productId) || store.getProductByName(productId);
          if (product) {
            products.push(product);
          }
        }
        
        if (products.length > 0) {
          productContext = `\n\nFeatured Products:\n${products.map(p => 
            `- ${p.name}: ${p.description} (Price: $${p.price}, Category: ${p.category})`
          ).join('\n')}`;
        }
      }

      // Create blog post type specific prompts
      const typePrompts = {
        'product-feature': 'Write a blog post featuring and highlighting specific products, their benefits, and how they solve customer problems.',
        'collection-announce': 'Write a blog post announcing a new product collection, highlighting the theme and key pieces.',
        'how-to': 'Write an educational how-to guide that provides value to customers while naturally incorporating relevant products.',
        'news': 'Write a news-style blog post about store updates, industry trends, or company announcements.'
      };

      const prompt = `Write a ${context.tone} blog post about "${context.topic}".\n\nBlog Post Type: ${context.postType}\n${typePrompts[context.postType]}\n\nRequirements:\n- Target word count: ${context.targetWordCount} words\n- Tone: ${context.tone}\n- Include SEO optimization: ${context.includeSEO}\n${productContext}\n\nStructure the blog post with:\n1. Compelling headline\n2. Engaging introduction\n3. Well-organized body content with subheadings\n4. Strong conclusion with call-to-action\n5. Meta description (150-160 characters)\n6. Suggested tags for categorization\n7. SEO keywords if requested\n\nMake the content engaging, informative, and valuable to readers while maintaining brand consistency.`;

      const result = await generateText({
        model: google('models/gemini-2.0-flash-lite'),
        prompt,
        temperature: 0.7,
      });

      // Parse the generated content to extract components
      const content = result.text;
      
      // Extract title (first line or markdown heading)
      const titleMatch = content.match(/^#\s*(.+)$/m) || content.match(/^(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : context.topic;
      
      // Generate meta description
      const metaDescResult = await generateText({
        model: google('models/gemini-2.0-flash-lite'),
        prompt: `Create a compelling meta description (150-160 characters) for this blog post titled "${title}" about ${context.topic}. Make it engaging and SEO-friendly.`,
        temperature: 0.5,
      });

      // Generate tags
      const tagsResult = await generateText({
        model: google('models/gemini-2.0-flash-lite'),
        prompt: `Generate 5-8 relevant tags for a blog post about "${context.topic}" in the ${context.postType} category. Return as comma-separated values.`,
        temperature: 0.5,
      });

      // Generate call to action
      const ctaResult = await generateText({
        model: google('models/gemini-2.0-flash-lite'),
        prompt: `Create a compelling call-to-action for a blog post about "${context.topic}". Make it encourage engagement or purchase. Keep it under 100 characters.`,
        temperature: 0.6,
      });

      // Generate SEO keywords if requested
      let seoKeywords: string[] | undefined;
      if (context.includeSEO) {
        const seoResult = await generateText({
          model: google('models/gemini-2.0-flash-lite'),
          prompt: `Generate 8-12 SEO keywords for a blog post about "${context.topic}" in the e-commerce space. Return as comma-separated values.`,
          temperature: 0.3,
        });
        seoKeywords = seoResult.text.split(',').map(k => k.trim());
      }

      // Estimate read time (average 200 words per minute)
      const wordCount = content.split(/\s+/).length;
      const readTimeMinutes = Math.ceil(wordCount / 200);
      const estimatedReadTime = `${readTimeMinutes} min read`;

      return {
        title: title,
        content: content,
        metaDescription: metaDescResult.text.trim(),
        suggestedTags: tagsResult.text.split(',').map(tag => tag.trim()),
        estimatedReadTime,
        seoKeywords,
        callToAction: ctaResult.text.trim(),
      };

    } catch (error) {
      throw new Error(`Failed to generate blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
