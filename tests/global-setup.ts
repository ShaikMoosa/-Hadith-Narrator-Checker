import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup for Hadith Narrator Checker Tests
 * Prepares the environment for AI workflow testing and optimizes performance
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  const startTime = Date.now();
  
  try {
    // Launch browser for setup
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Navigate to the application to warm up
    console.log('🌐 Warming up application...');
    await page.goto('http://localhost:3000/app', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Wait for initial page load
    await page.waitForSelector('h1:has-text("مُتحقق الرواة")', { timeout: 30000 });
    console.log('✅ Application loaded successfully');
    
    // Pre-load AI models by triggering AI tab
    console.log('🤖 Pre-loading AI models...');
    try {
      await page.getByRole('tab', { name: 'AI Analysis' }).click();
      await page.waitForTimeout(5000); // Give AI models time to load
      console.log('✅ AI models pre-loaded');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('⚠️  AI models pre-loading skipped:', errorMessage);
    }
    
    // Test database connectivity
    console.log('🗄️  Testing database connectivity...');
    try {
      await page.getByRole('tab', { name: 'Statistics' }).click();
      await page.waitForSelector('text=Database Statistics', { timeout: 10000 });
      console.log('✅ Database connection verified');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('⚠️  Database connectivity check failed:', errorMessage);
    }
    
    // Close browser
    await browser.close();
    
    const setupTime = Date.now() - startTime;
    console.log(`✅ Global setup completed in ${setupTime}ms`);
    
    // Store setup information
    process.env.SETUP_COMPLETED = 'true';
    process.env.SETUP_TIME = setupTime.toString();
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup; 