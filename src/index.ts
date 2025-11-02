/**
 * howto - XTEP-like Application Entry Point
 *
 * X (Twitter) Marketing Automation Platform
 * Powered by Miyabi framework
 */

import { XTEPApp } from './XTEPApp.js';

console.log('🌸 Welcome to XTEP-like Marketing Automation Platform!');
console.log('Powered by Miyabi - Autonomous AI Development Framework');
console.log('');
console.log('Features:');
console.log('  ✓ Automated DM/Reply sending');
console.log('  ✓ Campaign management (Lottery systems)');
console.log('  ✓ Post scheduling');
console.log('  ✓ Analytics & Reporting');
console.log('');

export function hello(): string {
  return 'Hello from XTEP-like App!';
}

// Main application function
export async function main(): Promise<void> {
  console.log('Starting XTEP application...\n');

  // Create and start the app
  const app = new XTEPApp({
    defaultDelay: 3,
    maxRetries: 3,
  });

  app.start();

  // Run demo
  await app.runDemo();

  // Show examples of using the services
  console.log('\n📚 Usage Examples:\n');

  console.log('// Create automation rule');
  console.log('await app.getAutomation().createRule(...);');
  console.log('');

  console.log('// Create campaign');
  console.log('await app.getCampaigns().createCampaign(...);');
  console.log('');

  console.log('// Schedule post');
  console.log('await app.getScheduler().schedulePost("Your post", new Date(...));');
  console.log('');

  console.log('// Get analytics');
  console.log('const report = app.getAnalytics().getWeeklyReport();');
  console.log('');

  console.log('For more information, see the documentation in the README.md');
  console.log('');

  // Keep the app running
  console.log('✓ Application is running. Press Ctrl+C to stop.\n');
}

// Run main if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
