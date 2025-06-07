#!/usr/bin/env node
/**
 * Data seeding script for Aria E-commerce Agent
 * Usage: npm run seed-data [options]
 */

import { seedDatabase, quickSetup } from '../data/seed';
import { logger } from '../utils/logger';

interface SeedOptions {
  products?: number;
  sales?: number;
  quick?: boolean;
  clear?: boolean;
  help?: boolean;
}

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  const options: SeedOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--products':
      case '-p':
        options.products = parseInt(args[++i], 10);
        break;
      case '--sales':
      case '-s':
        options.sales = parseInt(args[++i], 10);
        break;
      case '--quick':
      case '-q':
        options.quick = true;
        break;
      case '--clear':
      case '-c':
        options.clear = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        console.warn(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Aria E-commerce Agent - Data Seeding Script

Usage:
  npm run seed-data [options]

Options:
  -p, --products <number>   Number of products to generate (default: 50)
  -s, --sales <number>      Number of sales to generate (default: 200)
  -q, --quick              Quick setup with demo data and smaller dataset
  -c, --clear              Clear existing data before seeding (default: true)
  -h, --help               Show this help message

Examples:
  npm run seed-data                    # Default seeding (50 products, 200 sales)
  npm run seed-data --quick            # Quick setup for development
  npm run seed-data -p 100 -s 500     # Custom amounts
  npm run seed-data --clear            # Clear existing data first
`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  try {
    console.log('🌱 Starting Aria E-commerce data seeding...\n');

    if (options.quick) {
      logger.info('SCRIPT', 'Running quick setup');
      await quickSetup();
      console.log('✅ Quick setup completed successfully!');
    } else {
      const productCount = options.products || 50;
      const salesCount = options.sales || 200;
      const clearExisting = options.clear !== false; // Default to true

      logger.info('SCRIPT', 'Running custom seeding', { productCount, salesCount, clearExisting });

      const result = await seedDatabase({
        productCount,
        salesCount,
        clearExisting,
      });

      console.log(`✅ Seeding completed successfully!
      
📊 Results:
  • Products created: ${result.productsCreated}
  • Sales created: ${result.salesCreated}
  • Errors: ${result.errors.length}
`);

      if (result.errors.length > 0) {
        console.log('⚠️  Errors encountered:');
        result.errors.forEach((error: string, index: number) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
    }

    console.log('\n🎉 Data seeding completed. Aria is ready to use!');
    
  } catch (error) {
    logger.error('SCRIPT', 'Seeding script failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    console.error('❌ Seeding failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('SCRIPT', 'Unhandled Promise Rejection', { reason, promise });
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('SCRIPT', 'Uncaught Exception', { error: error.message, stack: error.stack });
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}
