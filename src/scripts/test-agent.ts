#!/usr/bin/env node
/**
 * Agent testing script for Aria E-commerce Agent
 * Usage: npm run test-agent [query]
 */

import { mastra } from '../mastra';
import { quickSetup } from '../data/seed';
import { logger, logAgent } from '../utils/logger';

interface TestScenario {
  name: string;
  query: string;
  expectedTools?: string[];
  description: string;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: 'Stock Check',
    query: 'Check the stock level for TechPro Wireless Headphones',
    expectedTools: ['getProductStock', 'getProductDetails'],
    description: 'Test inventory checking functionality',
  },
  {
    name: 'Low Stock Alerts',
    query: 'Show me products that are running low on stock',
    expectedTools: ['lowStockAlerts'],
    description: 'Test low stock alert system',
  },
  {
    name: 'Sales Analytics',
    query: 'Generate a sales report for the last 30 days',
    expectedTools: ['getSalesData', 'salesAnalytics'],
    description: 'Test sales reporting and analytics',
  },
  {
    name: 'Product Management',
    query: 'Add a new product: "Smart Watch Pro" priced at $299.99 in Electronics category',
    expectedTools: ['addProduct'],
    description: 'Test product creation functionality',
  },
  {
    name: 'Inventory Update',
    query: 'Add 50 units to the GreenLife Eco-Friendly Water Bottle inventory',
    expectedTools: ['updateInventory'],
    description: 'Test inventory management',
  },
  {
    name: 'Content Generation',
    query: 'Generate a product description for TechPro Wireless Headphones in a professional style',
    expectedTools: ['generateProductDescription'],
    description: 'Test AI content generation',
  },
  {
    name: 'Collection Browse',
    query: 'Show me all products in the Premium Line collection',
    expectedTools: ['getProductsByCollection'],
    description: 'Test product filtering by collection',
  },
  {
    name: 'Revenue Reports',
    query: 'Create a revenue report showing trends and top-performing products',
    expectedTools: ['revenueReports', 'salesAnalytics'],
    description: 'Test comprehensive revenue analysis',
  },
];

async function testAgent(query: string, scenario?: TestScenario): Promise<void> {
  console.log(`\n🤖 Testing query: "${query}"\n`);
  
  if (scenario) {
    console.log(`📝 Scenario: ${scenario.name}`);
    console.log(`📋 Description: ${scenario.description}`);
    if (scenario.expectedTools) {
      console.log(`🔧 Expected tools: ${scenario.expectedTools.join(', ')}`);
    }
    console.log('');
  }

  try {
    const startTime = Date.now();
    
    // Execute the query with Aria agent
    const aria = mastra.getAgent('aria');
    const result = await aria.generate(query, {
      maxSteps: 10,
    });
    
    const duration = Date.now() - startTime;

    console.log('📤 Aria Response:');
    console.log('-'.repeat(50));
    console.log(result.text);
    console.log('-'.repeat(50));
    
    // Log tool usage
    if (result.steps && result.steps.length > 0) {
      console.log('\n🔧 Tools Used:');
      result.steps.forEach((step: any, index: number) => {
        if (step.toolCalls && step.toolCalls.length > 0) {
          step.toolCalls.forEach((toolCall: any) => {
            console.log(`  ${index + 1}. ${toolCall.toolName}`);
            if (toolCall.args) {
              console.log(`     Args: ${JSON.stringify(toolCall.args, null, 6)}`);
            }
          });
        }
      });
    }

    console.log(`\n⏱️  Execution time: ${duration}ms`);
    
    // Log interaction
    logAgent('test-user', query, result.steps?.flatMap((s: any) => s.toolCalls?.map((tc: any) => tc.toolName) || []) || [], result.text);
    
  } catch (error) {
    console.error('❌ Error testing agent:', error instanceof Error ? error.message : 'Unknown error');
    logger.logError('TEST', error instanceof Error ? error : new Error('Unknown test error'));
  }
}

async function runInteractiveMode(): Promise<void> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`
🎯 Interactive Mode - Type your queries for Aria
Commands:
  - Type any e-commerce query to test Aria
  - 'scenarios' - Run all test scenarios
  - 'exit' - Exit interactive mode
`);

  const askQuestion = (): Promise<void> => {
    return new Promise((resolve) => {
      readline.question('\n💬 Your query: ', async (input: string) => {
        const query = input.trim();
        
        if (query.toLowerCase() === 'exit') {
          readline.close();
          resolve();
          return;
        }
        
        if (query.toLowerCase() === 'scenarios') {
          await runTestScenarios();
          askQuestion().then(resolve);
          return;
        }
        
        if (query) {
          await testAgent(query);
        }
        
        askQuestion().then(resolve);
      });
    });
  };

  await askQuestion();
}

async function runTestScenarios(): Promise<void> {
  console.log('\n🧪 Running all test scenarios...\n');
  
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const scenario = TEST_SCENARIOS[i];
    console.log(`\n📋 Scenario ${i + 1}/${TEST_SCENARIOS.length}`);
    await testAgent(scenario.query, scenario);
    
    if (i < TEST_SCENARIOS.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next scenario...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n✅ All test scenarios completed!');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚀 Aria E-commerce Agent Testing Tool\n');

  try {
    // Initialize with sample data
    console.log('📦 Setting up sample data...');
    await quickSetup();
    console.log('✅ Sample data ready\n');

    if (command === 'scenarios') {
      await runTestScenarios();
    } else if (command === 'interactive' || !command) {
      await runInteractiveMode();
    } else {
      // Treat the command and all args as a single query
      const query = args.join(' ');
      await testAgent(query);
    }

  } catch (error) {
    console.error('❌ Testing failed:', error instanceof Error ? error.message : 'Unknown error');
    logger.logError('TEST', error instanceof Error ? error : new Error('Unknown test error'));
    process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
Aria E-commerce Agent Testing Tool

Usage:
  npm run test-agent                    # Interactive mode
  npm run test-agent interactive        # Interactive mode
  npm run test-agent scenarios          # Run all test scenarios
  npm run test-agent "your query here"  # Test a specific query

Examples:
  npm run test-agent "Check stock for headphones"
  npm run test-agent "Generate sales report"
  npm run test-agent scenarios
`);
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp();
  process.exit(0);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('TEST', 'Unhandled Promise Rejection', { reason, promise });
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}
