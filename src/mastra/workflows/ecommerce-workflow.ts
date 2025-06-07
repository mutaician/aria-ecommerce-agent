import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const ecommerceWorkflow = createWorkflow({
  id: 'ecommerce-management',
  inputSchema: z.object({}),
  outputSchema: z.object({
    message: z.string(),
    timestamp: z.string(),
  }),
})
  .then(
    createStep({
      id: 'analyze-request',
      inputSchema: z.object({}),
      outputSchema: z.object({
        message: z.string(),
        timestamp: z.string(),
      }),
      execute: async ({ inputData }) => {
        return {
          message: 'E-commerce workflow initialized',
          timestamp: new Date().toISOString(),
        };
      },
    })
  );
