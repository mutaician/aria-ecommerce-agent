
import { Mastra } from '@mastra/core';
import { ariaAgent } from './agents/aria-agent';
import { PinoLogger } from '@mastra/loggers';

export const mastra = new Mastra({
  agents: { 
    aria: ariaAgent 
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info"
  })
});
