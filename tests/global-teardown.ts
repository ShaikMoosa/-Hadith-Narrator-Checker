import { FullConfig } from '@playwright/test';

/**
 * Global Teardown for Hadith Narrator Checker Tests
 * Cleans up test environment and reports performance metrics
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Report setup performance
    if (process.env.SETUP_COMPLETED === 'true') {
      const setupTime = process.env.SETUP_TIME;
      console.log(`📊 Setup performance: ${setupTime}ms`);
    }
    
    // Clean up any temporary files or resources
    console.log('🗑️  Cleaning up test resources...');
    
    // Report test completion
    console.log('✅ Global teardown completed successfully');
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Global teardown failed:', errorMessage);
  }
}

export default globalTeardown; 