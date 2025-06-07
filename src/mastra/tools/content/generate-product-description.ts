import { createTool } from '@mastra/core';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { ecommerceStore } from '../../../data/store';

const generateProductDescriptionSchema = z.object({
  productId: z.string().optional().describe('Product ID to generate description for (if provided, will use existing product data)'),
  productName: z.string().optional().describe('Product name (required if productId not provided)'),
  category: z.string().optional().describe('Product category'),
  features: z.array(z.string()).optional().describe('Key product features'),
  targetAudience: z.string().optional().describe('Target audience for the product'),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'technical', 'luxury']).default('professional').describe('Writing tone for the description'),
  length: z.enum(['short', 'medium', 'long']).default('medium').describe('Description length')
});

const generateProductDescriptionOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  content: z.object({
    shortDescription: z.string(),
    fullDescription: z.string(),
    bulletPoints: z.array(z.string()),
    specifications: z.string().optional()
  }).optional()
});

export const generateProductDescription = createTool({
  id: 'generateProductDescription',
  description: 'Generate compelling product descriptions with different formats and tones',
  inputSchema: generateProductDescriptionSchema,
  outputSchema: generateProductDescriptionOutputSchema,
  execute: async ({ context }) => {
    const { productId, productName, category, features, targetAudience, tone, length } = context;
    try {
      let product = null;
      let name = productName;
      let productCategory = category;
      let productFeatures = features || [];

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
        productFeatures = product.tags || [];
      }

      if (!name) {
        return {
          success: false,
          message: 'Product name is required (either provide productId or productName)'
        };
      }

      // Generate descriptions using AI
      const descriptions = await generateDescriptions(
        name, 
        productCategory || 'General', 
        productFeatures, 
        targetAudience || 'General consumers',
        tone,
        length
      );

      // Store the generated content if productId was provided
      if (productId && product) {
        const contentResult = {
          type: 'product_description' as const,
          content: descriptions.fullDescription,
          metadata: {
            tone,
            length,
            generatedAt: new Date().toISOString()
          }
        };
        
        // Update product with generated description if it doesn't have one
        if (!product.description || product.description.length < 50) {
          ecommerceStore.updateProduct(productId, {
            description: descriptions.fullDescription,
            updatedAt: new Date()
          });
        }
      }

      return {
        success: true,
        message: `Product description generated successfully for "${name}"`,
        content: descriptions
      };
    } catch (error) {
      console.error('Error generating product description:', error);
      return {
        success: false,
        message: `Error generating description: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
});

async function generateDescriptions(
  name: string, 
  category: string, 
  features: string[], 
  targetAudience: string, 
  tone: string, 
  length: string
) {
  try {
    // Generate short description
    const shortPrompt = `Generate a compelling short product description (1-2 sentences) for:\nProduct: ${name}\nCategory: ${category}\nTarget Audience: ${targetAudience}\nTone: ${tone}\nFeatures: ${features.join(', ')}\n\nFocus on the key benefit and appeal to the target audience.`;

    const shortResult = await generateText({
      model: openai('gpt-4.1-nano'),
      prompt: shortPrompt,
    });

    // Generate bullet points
    const bulletPrompt = `Generate 4-5 compelling bullet points for this product:\nProduct: ${name}\nCategory: ${category}\nFeatures: ${features.join(', ')}\nTone: ${tone}\n\nFormat as simple bullet points without bullets symbols, one per line.`;

    const bulletResult = await generateText({
      model: openai('gpt-4.1-nano'),
      prompt: bulletPrompt,
    });

    // Generate full description based on length
    const lengthMap = {
      short: '2-3 sentences',
      medium: '1 paragraph (4-6 sentences)',
      long: '2-3 paragraphs'
    };

    const fullPrompt = `Generate a ${lengthMap[length as keyof typeof lengthMap]} product description for:\nProduct: ${name}\nCategory: ${category}\nTarget Audience: ${targetAudience}\nTone: ${tone}\nFeatures: ${features.join(', ')}\n\nMake it engaging, informative, and persuasive. Include key benefits and appeal to the target audience.`;

    const fullResult = await generateText({
      model: openai('gpt-4.1-nano'),
      prompt: fullPrompt,
    });

    // Parse bullet points
    const bulletPoints = bulletResult.text
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.trim());

    return {
      shortDescription: shortResult.text.trim(),
      fullDescription: fullResult.text.trim(),
      bulletPoints,
      specifications: `Category: ${category}\nTarget Audience: ${targetAudience}\nTone: ${tone}\nGenerated: ${new Date().toLocaleDateString()}`
    };
  } catch (error) {
    // Fallback to template-based generation if AI fails
    console.warn('AI generation failed, using fallback template:', error);
    return generateFallbackDescriptions(name, category, features, targetAudience, tone, length);
  }
}

function generateFallbackDescriptions(
  name: string, 
  category: string, 
  features: string[], 
  targetAudience: string, 
  tone: string, 
  length: string
) {
  const toneStyles = {
    professional: {
      adjectives: ['premium', 'high-quality', 'reliable', 'innovative', 'professional-grade'],
      verbs: ['delivers', 'provides', 'ensures', 'offers', 'features']
    },
    casual: {
      adjectives: ['awesome', 'cool', 'great', 'amazing', 'perfect'],
      verbs: ['brings', 'gives you', 'makes', 'helps', 'lets you']
    },
    enthusiastic: {
      adjectives: ['incredible', 'outstanding', 'remarkable', 'exceptional', 'extraordinary'],
      verbs: ['transforms', 'revolutionizes', 'elevates', 'enhances', 'supercharges']
    },
    technical: {
      adjectives: ['advanced', 'engineered', 'precision-crafted', 'optimized', 'sophisticated'],
      verbs: ['incorporates', 'utilizes', 'implements', 'integrates', 'employs']
    },
    luxury: {
      adjectives: ['exquisite', 'premium', 'exclusive', 'sophisticated', 'elegant'],
      verbs: ['embodies', 'represents', 'showcases', 'epitomizes', 'delivers']
    }
  };

  const style = toneStyles[tone as keyof typeof toneStyles] || toneStyles.professional;
  
  // Generate short description
  const shortDescription = `${style.adjectives[0]} ${name} ${style.verbs[0]} ${category === 'General' ? 'exceptional value' : `superior ${category.toLowerCase()} performance`} for ${targetAudience.toLowerCase()}.`;

  // Generate bullet points
  const bulletPoints = [
    `${style.adjectives[1]} ${name} designed for ${targetAudience.toLowerCase()}`,
    `${style.verbs[1]} ${category === 'General' ? 'versatile functionality' : `specialized ${category.toLowerCase()} capabilities`}`,
    ...features.slice(0, 3).map((feature: string) => `${style.adjectives[Math.floor(Math.random() * style.adjectives.length)]} ${feature}`)
  ];

  if (bulletPoints.length < 4) {
    bulletPoints.push(`Built with ${style.adjectives[2]} materials and craftsmanship`);
    bulletPoints.push(`Perfect for ${targetAudience.toLowerCase()} seeking quality and reliability`);
  }

  // Generate full description based on length
  let fullDescription = '';
  
  if (length === 'short') {
    fullDescription = `${shortDescription} This ${name} ${style.verbs[2]} the perfect balance of quality and functionality.`;
  } else if (length === 'medium') {
    fullDescription = `${shortDescription}\n\nOur ${name} ${style.verbs[2]} ${style.adjectives[2]} performance with ${style.adjectives[3]} design. ${features.length > 0 ? `Key features include ${features.slice(0, 2).join(' and ')}.` : ''} \n\nWhether you're ${targetAudience.toLowerCase()}, this product ${style.verbs[3]} the reliability and quality you need. ${style.adjectives[4]} construction ensures long-lasting performance.`;
  } else {
    fullDescription = `${shortDescription}\n\nOur ${name} represents the pinnacle of ${category.toLowerCase()} innovation, specifically designed for ${targetAudience.toLowerCase()}. This ${style.adjectives[2]} product ${style.verbs[2]} ${style.adjectives[3]} performance with uncompromising quality.\n\n${features.length > 0 ? `Key Features:\n${features.map((feature: string) => `• ${feature}`).join('\n')}\n\n` : ''}Each ${name} ${style.verbs[4]} ${style.adjectives[4]} craftsmanship and attention to detail. Our commitment to excellence ensures that this product not only meets but exceeds expectations.\n\nPerfect for ${targetAudience.toLowerCase()} who demand the best, this ${name} ${style.verbs[0]} exceptional value and reliable performance that you can count on for years to come.`;
  }

  return {
    shortDescription: shortDescription.charAt(0).toUpperCase() + shortDescription.slice(1),
    fullDescription: fullDescription.charAt(0).toUpperCase() + fullDescription.slice(1),
    bulletPoints,
    specifications: `Category: ${category}\nTarget Audience: ${targetAudience}\nTone: ${tone}\nGenerated: ${new Date().toLocaleDateString()}`
  };
}
