import { test, expect } from '@playwright/test';

/**
 * Enhanced AI Workflow & Performance Tests for Hadith Narrator Checker
 * Tests all AI-powered features with focus on performance optimization and caching
 * Target: <1.5s analysis time, <3s model loading, comprehensive error handling
 */
test.describe('AI Performance & Optimization Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/app');
    
    // Wait for the page to load completely
    await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
    
    // Allow time for initial setup
    await page.waitForTimeout(1000);
  });

  test('AI-PERF-1: Model Loading Performance (<3s target)', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to AI Analysis tab to trigger model loading
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    // Wait for AI interface to be ready
    await expect(page.locator('text=AI-Powered Text Analysis').or(page.locator('text=AI Analysis'))).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Performance target: Model loading should complete within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`✅ AI Model loading completed in ${loadTime}ms (target: <3000ms)`);
  });

  test('AI-PERF-2: Text Analysis Speed (<1.5s target)', async ({ page }) => {
    // Navigate to AI Analysis tab
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    // Wait for interface to be ready
    await expect(page.locator('text=AI-Powered').or(page.locator('text=AI Analysis'))).toBeVisible();
    
    const arabicText = 'حدثنا أبو بكر بن أبي شيبة حدثنا عمر بن الخطاب عن علي بن أبي طالب رضي الله عنهم';
    
    // Find and fill the AI text analysis input
    const aiTextInput = page.locator('textarea[placeholder*="Arabic"], textarea').first();
    await aiTextInput.fill(arabicText);
    
    const startTime = Date.now();
    
    // Click analyze button
    await page.getByRole('button', { name: /Analyze Text|Analyze|Process/ }).first().click();
    
    // Wait for AI processing to complete
    await page.waitForSelector('[data-testid="ai-results"], .ai-analysis-results, text="Analysis complete", text="Processing complete"', { 
      timeout: 8000 
    });
    
    const processingTime = Date.now() - startTime;
    
    // Performance target: Analysis should complete within 1.5 seconds
    expect(processingTime).toBeLessThan(1500);
    
    // Verify results are displayed
    await expect(page.locator('text=Analysis').or(page.locator('text=Results'))).toBeVisible();
    
    console.log(`✅ AI Analysis completed in ${processingTime}ms (target: <1500ms)`);
  });

  test('AI-PERF-3: Caching Performance (Second Analysis)', async ({ page }) => {
    // Navigate to AI Analysis tab
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    await page.waitForTimeout(1000);
    
    const arabicText = 'حدثنا أبو بكر بن أبي شيبة حدثنا وكيع عن سفيان';
    const aiTextInput = page.locator('textarea').first();
    
    // First analysis (cache miss)
    await aiTextInput.fill(arabicText);
    const firstStartTime = Date.now();
    await page.getByRole('button', { name: /Analyze/ }).first().click();
    await page.waitForSelector('[data-testid="ai-results"], text="Analysis complete"', { timeout: 8000 });
    const firstTime = Date.now() - firstStartTime;
    
    // Clear and repeat same analysis (cache hit)
    await aiTextInput.clear();
    await page.waitForTimeout(500);
    await aiTextInput.fill(arabicText);
    
    const secondStartTime = Date.now();
    await page.getByRole('button', { name: /Analyze/ }).first().click();
    await page.waitForSelector('[data-testid="ai-results"], text="Analysis complete"', { timeout: 5000 });
    const secondTime = Date.now() - secondStartTime;
    
    // Second analysis should be significantly faster (cached)
    expect(secondTime).toBeLessThan(firstTime * 0.7); // At least 30% faster
    expect(secondTime).toBeLessThan(800); // Should be very fast with cache
    
    console.log(`✅ Cache performance: First=${firstTime}ms, Second=${secondTime}ms (${((1 - secondTime/firstTime) * 100).toFixed(1)}% faster)`);
  });

  test('AI-PERF-4: Narrator Recognition Accuracy & Speed', async ({ page }) => {
    // Use example hadith with known narrators
    await page.getByRole('button', { name: 'Use this example' }).click();
    
    const startTime = Date.now();
    
    // Analyze hadith
    await page.getByRole('button', { name: 'Analyze Hadith' }).click();
    
    // Wait for results
    await expect(page.getByRole('tab', { name: /Results/ })).toBeVisible({ timeout: 8000 });
    
    const processingTime = Date.now() - startTime;
    
    // Performance check: Narrator recognition should be fast
    expect(processingTime).toBeLessThan(2000);
    
    // Verify accuracy: Check for known narrators
    await expect(page.locator('text=أبو بكر')).toBeVisible();
    await expect(page.locator('text=عمر')).toBeVisible();
    
    console.log(`✅ Narrator recognition completed in ${processingTime}ms with accurate results`);
  });

  test('AI-PERF-5: Bulk Processing Performance', async ({ page }) => {
    // Navigate to Advanced Processing tab
    await page.getByRole('tab', { name: 'Advanced Processing' }).click();
    
    // Check bulk processing interface
    await expect(page.locator('text=Bulk').or(page.locator('text=Advanced Processing'))).toBeVisible();
    
    // Test data for bulk processing (multiple hadiths)
    const bulkText = `
حدثنا أبو بكر بن أبي شيبة حدثنا وكيع
حدثنا عمر بن الخطاب عن عائشة رضي الله عنها
حدثنا علي بن أبي طالب قال قال رسول الله
حدثنا أبو هريرة عن النبي صلى الله عليه وسلم
    `.trim();
    
    // Find bulk input area
    const bulkInput = page.locator('textarea[placeholder*="bulk"], textarea[placeholder*="multiple"]').first();
    await bulkInput.fill(bulkText);
    
    const startTime = Date.now();
    
    // Start bulk processing
    await page.getByRole('button', { name: /Process Bulk|Start Processing|Analyze All/ }).first().click();
    
    // Wait for bulk processing to complete
    await page.waitForSelector('[data-testid="bulk-results"], text="Processing complete", text="Bulk analysis finished"', { 
      timeout: 15000 
    });
    
    const processingTime = Date.now() - startTime;
    
    // Performance check: Bulk processing should be efficient
    expect(processingTime).toBeLessThan(10000); // 10 seconds for 4 hadiths
    
    // Check results display
    await expect(page.locator('text=Processing complete').or(page.locator('text=Analysis Results'))).toBeVisible();
    
    console.log(`✅ Bulk processing completed in ${processingTime}ms for 4 hadiths`);
  });

  test('AI-PERF-6: Memory Usage & Stability', async ({ page }) => {
    // Monitor console errors for memory issues
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Perform multiple AI operations to test memory stability
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    const testTexts = [
      'حدثنا أبو بكر بن أبي شيبة',
      'حدثنا عمر بن الخطاب عن عائشة',
      'حدثنا علي بن أبي طالب رضي الله عنه',
      'حدثنا أبو هريرة عن النبي صلى الله عليه وسلم'
    ];
    
    const aiInput = page.locator('textarea').first();
    
    for (const text of testTexts) {
      await aiInput.clear();
      await aiInput.fill(text);
      await page.getByRole('button', { name: /Analyze/ }).first().click();
      await page.waitForTimeout(2000); // Allow processing
    }
    
    // Check for memory-related errors
    const memoryErrors = consoleErrors.filter(error => 
      error.includes('memory') || error.includes('heap') || error.includes('allocation') || error.includes('out of memory')
    );
    
    expect(memoryErrors.length).toBe(0);
    
    console.log(`✅ Memory stability test passed. Total console errors: ${consoleErrors.length}, Memory errors: ${memoryErrors.length}`);
  });

  test('AI-PERF-7: Error Handling & Recovery', async ({ page }) => {
    // Test AI error handling with invalid inputs
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    const invalidInputs = [
      '', // Empty
      '   ', // Whitespace only
      '123456789', // Numbers only
      'abcdefghijk', // English only
      '!@#$%^&*()', // Special characters only
      'x'.repeat(10000), // Very long text
    ];
    
    const aiInput = page.locator('textarea').first();
    
    for (const input of invalidInputs) {
      await aiInput.clear();
      await aiInput.fill(input);
      
      const analyzeBtn = page.getByRole('button', { name: /Analyze/ }).first();
      
      if (input.trim() === '') {
        // Should handle empty input gracefully
        await expect(analyzeBtn).toBeDisabled();
      } else {
        // Should handle invalid input without crashing
        await analyzeBtn.click();
        await page.waitForTimeout(2000);
        
        // Application should remain functional
        await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
      }
    }
    
    console.log('✅ Error handling test passed for all invalid inputs');
  });

  test('AI-PERF-8: Arabic Unicode & RTL Performance', async ({ page }) => {
    // Test various Arabic text scenarios for performance
    const complexTexts = [
      'حَدَّثَنَا أَبُو بَكْرِ بْنُ أَبِي شَيْبَةَ', // With diacritics
      'حدثنا ابو بكر Ibn Abi Shaybah', // Mixed Arabic-English
      'قال رسول الله ﷺ في الحديث الشريف', // With special characters
      'حدثنا أبو بكر بن أبي شيبة حدثنا وكيع عن سفيان عن منصور عن إبراهيم', // Long chain
    ];

    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    const aiInput = page.locator('textarea').first();
    
    for (const testText of complexTexts) {
      const startTime = Date.now();
      
      await aiInput.clear();
      await aiInput.fill(testText);
      
      // Verify text is preserved correctly
      const value = await aiInput.inputValue();
      expect(value).toBe(testText);
      
      // Check RTL rendering
      const direction = await aiInput.evaluate(el => getComputedStyle(el).direction);
      expect(direction).toBe('rtl');
      
      // Test processing performance
      await page.getByRole('button', { name: /Analyze/ }).first().click();
      await page.waitForTimeout(1500);
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(3000); // Should handle complex text efficiently
      
      console.log(`✅ Complex Arabic text processed in ${processingTime}ms: ${testText.substring(0, 30)}...`);
    }
  });

  test('AI-PERF-9: Similarity Engine Performance', async ({ page }) => {
    // Navigate to Advanced Processing tab
    await page.getByRole('tab', { name: 'Advanced Processing' }).click();
    
    // Check similarity engine interface
    await expect(page.locator('text=Text Similarity').or(page.locator('text=Similarity Search'))).toBeVisible();
    
    const testText = 'حدثنا أبو بكر بن أبي شيبة حدثنا وكيع';
    
    // Find similarity input
    const similarityInput = page.locator('input[placeholder*="similarity"], textarea[placeholder*="compare"]').first();
    await similarityInput.fill(testText);
    
    const startTime = Date.now();
    
    // Execute similarity search
    await page.getByRole('button', { name: /Find Similar|Search Similar|Compare/ }).first().click();
    
    // Wait for similarity results
    await page.waitForSelector('[data-testid="similarity-results"], text="Similarity results", .similarity-match', { 
      timeout: 6000 
    });
    
    const processingTime = Date.now() - startTime;
    
    // Performance check: Similarity search should be fast
    expect(processingTime).toBeLessThan(3000);
    
    console.log(`✅ Similarity search completed in ${processingTime}ms`);
  });

  test('AI-PERF-10: Cross-Tab Performance & State Management', async ({ page }) => {
    // Test performance when switching between AI-related tabs
    const tabs = [
      'AI Analysis',
      'Advanced Processing',
      'Hadith Analysis',
      'AI Analysis', // Return to first tab
    ];

    for (const tabName of tabs) {
      const startTime = Date.now();
      
      await page.getByRole('tab', { name: tabName }).click();
      
      // Wait for tab content to load
      await page.waitForTimeout(200);
      
      const switchTime = Date.now() - startTime;
      expect(switchTime).toBeLessThan(1000); // Tab switch should be fast
      
      // Verify tab is active and content is visible
      await expect(page.getByRole('tab', { name: tabName })).toHaveAttribute('data-state', 'active');
      
      console.log(`✅ Tab switch to ${tabName}: ${switchTime}ms`);
    }
  });
});

// Comprehensive Error Handling Tests
test.describe('AI Error Handling & Recovery', () => {
  test('AI-ERR-1: Network Failure Recovery', async ({ page }) => {
    await page.goto('/app');
    
    // Simulate network issues by intercepting AI-related requests
    await page.route('**/api/**', route => {
      if (route.request().url().includes('ai') || route.request().url().includes('analyze')) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    // Try to perform AI operation
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    const aiInput = page.locator('textarea').first();
    await aiInput.fill('حدثنا أبو بكر بن أبي شيبة');
    await page.getByRole('button', { name: /Analyze/ }).first().click();
    
    // Should show error message gracefully
    await expect(page.locator('text=error').or(page.locator('text=failed')).or(page.locator('text=network'))).toBeVisible({ timeout: 5000 });
    
    // Application should remain functional
    await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
    
    console.log('✅ Network failure recovery test passed');
  });

  test('AI-ERR-2: Model Loading Failure Fallback', async ({ page }) => {
    await page.goto('/app');
    
    // Simulate model loading failure
    await page.addInitScript(() => {
      // Override transformer loader to simulate failure
      (window as any).__transformerLoader = async () => {
        throw new Error('Model loading failed');
      };
    });
    
    // Navigate to AI tab
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    // Should still show interface (fallback to pattern-based analysis)
    await expect(page.locator('text=AI').or(page.locator('text=Analysis'))).toBeVisible();
    
    // Try analysis with fallback
    const aiInput = page.locator('textarea').first();
    await aiInput.fill('حدثنا أبو بكر بن أبي شيبة');
    await page.getByRole('button', { name: /Analyze/ }).first().click();
    
    // Should work with pattern-based fallback
    await page.waitForTimeout(3000);
    await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
    
    console.log('✅ Model loading failure fallback test passed');
  });
}); 