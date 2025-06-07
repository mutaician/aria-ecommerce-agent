// Level 3 Content Generation Tool: Social Media Content Generator
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getDataStore } from '../../../data/store';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const generateSocialMediaContent = createTool({
  id: 'generateSocialMediaContent',
  description: 'Create social media captions and content for various platforms',
  inputSchema: z.object({
    platform: z.enum(['instagram', 'facebook', 'twitter', 'tiktok', 'linkedin']).describe('Social media platform to create content for'),
    contentType: z.enum(['product-showcase', 'sale-announcement', 'behind-scenes', 'user-generated', 'educational']).describe('Type of social media content'),
    productIdentifier: z.string().optional().describe('Product ID or name to feature (if applicable)'),
    includeHashtags: z.boolean().default(true).describe('Whether to include relevant hashtags'),
    includeEmojis: z.boolean().default(true).describe('Whether to include emojis in the content'),
    callToAction: z.string().optional().describe('Specific call-to-action to include'),
    customMessage: z.string().optional().describe('Custom message or theme to incorporate'),
  }),
  outputSchema: z.object({
    caption: z.string(),
    hashtags: z.array(z.string()),
    suggestedEmojis: z.array(z.string()),
    callToAction: z.string(),
    characterCount: z.number(),
    platformOptimized: z.boolean(),
    contentSuggestions: z.object({
      imageIdeas: z.array(z.string()),
      videoIdeas: z.array(z.string()).optional(),
      postingTips: z.array(z.string()),
    }),
  }),
  execute: async ({ context }) => {
    const store = getDataStore();
    
    try {
      // Get product information if specified
      let product = null;
      if (context.productIdentifier) {
        product = store.getProduct(context.productIdentifier) || 
                 store.getProductByName(context.productIdentifier);
      }

      // Platform-specific character limits and best practices
      const platformSpecs = {
        instagram: { 
          maxChars: 2200, 
          bestLength: 125,
          hashtagCount: '20-30',
          features: ['Stories', 'Reels', 'IGTV', 'Shopping tags']
        },
        facebook: { 
          maxChars: 63206, 
          bestLength: 80,
          hashtagCount: '1-3',
          features: ['Link previews', 'Photo albums', 'Videos', 'Events']
        },
        twitter: { 
          maxChars: 280, 
          bestLength: 100,
          hashtagCount: '1-2',
          features: ['Threads', 'Polls', 'Spaces', 'Tweet scheduling']
        },
        tiktok: { 
          maxChars: 150, 
          bestLength: 100,
          hashtagCount: '3-5',
          features: ['Short videos', 'Trending sounds', 'Effects', 'Duets']
        },
        linkedin: { 
          maxChars: 3000, 
          bestLength: 150,
          hashtagCount: '3-5',
          features: ['Professional content', 'Industry insights', 'Company updates']
        },
      };

      const platformSpec = platformSpecs[context.platform];
      
      // Content type specific prompts
      const contentTypePrompts = {
        'product-showcase': 'Create content that highlights product features, benefits, and aesthetic appeal.',
        'sale-announcement': 'Create exciting content about sales, discounts, or special offers.',
        'behind-scenes': 'Create authentic, personal content showing the story behind the business.',
        'user-generated': 'Create content that encourages customer interaction and sharing.',
        'educational': 'Create informative content that provides value while showcasing expertise.',
      };

      // Build the prompt
      let prompt = `Create ${context.platform} content for ${context.contentType}.\n\n${contentTypePrompts[context.contentType]}\n\nPlatform: ${context.platform}\n- Character limit: ${platformSpec.maxChars}\n- Optimal length: ~${platformSpec.bestLength} characters\n- Recommended hashtags: ${platformSpec.hashtagCount}\n\n`;

      if (product) {
        prompt += `Featured Product:\n- Name: ${product.name}\n- Description: ${product.description}\n- Price: $${product.price}\n- Category: ${product.category}\n${product.collection ? `- Collection: ${product.collection}` : ''}\n\n`;
      }

      if (context.customMessage) {
        prompt += `Custom message to incorporate: ${context.customMessage}\n\n`;
      }

      prompt += `Requirements:\n- Include emojis: ${context.includeEmojis}\n- Include hashtags: ${context.includeHashtags}\n- Platform-optimized for ${context.platform}\n- Engaging and on-brand\n- Encourage interaction\n${context.callToAction ? `- Include this CTA: ${context.callToAction}` : '- Include a compelling call-to-action'}\n\nCreate content that matches ${context.platform}'s style and best practices.`;

      const result = await generateText({
        model: openai('gpt-4.1-nano'),
        prompt,
        temperature: 0.8, // Higher creativity for social media
      });

      // Generate hashtags specifically
      const hashtagPrompt = `Generate ${platformSpec.hashtagCount} relevant hashtags for ${context.platform} content about ${context.contentType}${product ? ` featuring ${product.name}` : ''}. \n\nInclude:\n- Industry-specific hashtags\n- Product/category hashtags\n- Brand/community hashtags\n- Trending/popular hashtags\n\nReturn as comma-separated values without the # symbol.`;
      const hashtagResult = await generateText({
        model: openai('gpt-4.1-nano'),
        prompt: hashtagPrompt,
        temperature: 0.6,
      });

      // Generate content suggestions
      const suggestionsPrompt = `Generate creative content suggestions for ${context.platform} ${context.contentType} post${product ? ` featuring ${product.name}` : ''}.\n\nProvide:\n- 3-4 image/photo ideas\n${context.platform === 'tiktok' || context.platform === 'instagram' ? '- 2-3 video content ideas' : ''}\n- 2-3 posting tips specific to ${context.platform}\n\nBe specific and actionable.`;

      const suggestionsResult = await generateText({
        model: openai('gpt-4.1-nano'),
        prompt: suggestionsPrompt,
        temperature: 0.7,
      });

      // Parse results
      const caption = result.text.trim();
      const characterCount = caption.length;
      const hashtags = hashtagResult.text.split(',').map(tag => tag.trim());
      
      // Extract emojis from caption
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const suggestedEmojis = [...new Set((caption.match(emojiRegex) || []))];

      // Parse content suggestions
      const suggestions = suggestionsResult.text;
      const imageIdeas = suggestions.match(/image|photo ideas?:?\s*\n?(.*?)(?=video|posting|$)/is)?.[1]
        ?.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(idea => idea.length > 0) || ['Product flat lay', 'Lifestyle shot', 'Detail close-up'];

      const videoIdeas = (context.platform === 'tiktok' || context.platform === 'instagram') ?
        suggestions.match(/video.*?ideas?:?\s*\n?(.*?)(?=posting|$)/is)?.[1]
          ?.split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
          .map(line => line.replace(/^[-•]\s*/, '').trim())
          .filter(idea => idea.length > 0) || ['Unboxing video', 'Tutorial/demo', 'Behind-the-scenes'] : undefined;

      const postingTips = suggestions.match(/posting tips?:?\s*\n?(.*?)$/is)?.[1]
        ?.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(tip => tip.length > 0) || ['Post during peak hours', 'Engage with comments quickly', 'Use platform-specific features'];

      // Extract or generate call to action
      const ctaMatch = caption.match(/(?:shop now|buy now|click link|visit|check out|get yours|order now|discover more|learn more)[^.!?]*/gi);
      const extractedCTA = ctaMatch ? ctaMatch[0] : context.callToAction || 'Shop now!';

      return {
        caption,
        hashtags,
        suggestedEmojis,
        callToAction: extractedCTA,
        characterCount,
        platformOptimized: characterCount <= platformSpec.maxChars,
        contentSuggestions: {
          imageIdeas,
          videoIdeas,
          postingTips,
        },
      };

    } catch (error) {
      throw new Error(`Failed to generate social media content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
