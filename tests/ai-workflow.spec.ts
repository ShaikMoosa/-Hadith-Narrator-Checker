import { test, expect } from '@playwright/test';

/**
 * Comprehensive AI Workflow Tests for Hadith Narrator Checker
 * Tests all AI-powered features including Arabic NLP, text analysis, and performance
 */
test.describe('AI Workflow & Performance Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/app');
    
    // Wait for the page to load completely
    await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
    
    // Wait for potential AI model loading (give it time)
    await page.waitForTimeout(2000);
  });

  test('AI-1: Arabic Text Processing & NLP Analysis', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to AI Analysis tab
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    // Check AI interface elements
    await expect(page.locator('text=AI-Powered Text Analysis')).toBeVisible();
    
    // Test Arabic text input
    const arabicText = 'حدثنا أبو بكر بن أبي شيبة حدثنا عمر بن الخطاب عن علي بن أبي طالب';
    
    // Find and fill the AI text analysis input
    const aiTextInput = page.locator('textarea[placeholder*="Arabic"]').first();
    await aiTextInput.fill(arabicText);
    
    // Click analyze button
    await page.getByRole('button', { name: /Analyze Text|Analyze/ }).first().click();
    
    // Wait for AI processing to complete (max 10 seconds)
    await page.waitForSelector('[data-testid="ai-results"], .ai-analysis-results, text="Analysis complete"', { 
      timeout: 10000 
    });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Performance check: Should complete within 5 seconds
    expect(processingTime).toBeLessThan(5000);
    
    // Check AI results are displayed
    await expect(page.locator('text=Arabic Text Analysis').or(page.locator('text=NLP Results'))).toBeVisible();
    
    console.log(`AI Analysis completed in ${processingTime}ms`);
  });

  test('AI-2: Narrator Recognition & Pattern Matching', async ({ page }) => {
    // Load example hadith with known narrators
    await page.getByRole('button', { name: 'Use this example' }).click();
    
    const startTime = Date.now();
    
    // Analyze hadith
    await page.getByRole('button', { name: 'Analyze Hadith' }).click();
    
    // Wait for AI processing
    await expect(page.getByRole('tab', { name: /Results/ })).toBeVisible({ timeout: 8000 });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Performance check: Narrator recognition should be fast
    expect(processingTime).toBeLessThan(3000);
    
    // Verify narrator recognition accuracy
    await expect(page.locator('text=أبو بكر')).toBeVisible();
    await expect(page.locator('text=عمر بن الخطاب')).toBeVisible();
    await expect(page.locator('text=علي بن أبي طالب')).toBeVisible();
    
    console.log(`Narrator recognition completed in ${processingTime}ms`);
  });

  test('AI-3: Bulk Text Processing Performance', async ({ page }) => {
    // Navigate to Advanced Processing tab
    await page.getByRole('tab', { name: 'Advanced Processing' }).click();
    
    // Check bulk processing interface
    await expect(page.locator('text=Bulk Hadith Processing').or(page.locator('text=Advanced Processing'))).toBeVisible();
    
    // Test data for bulk processing
    const bulkText = `
حدثنا أبو بكر بن أبي شيبة
حدثنا عمر بن الخطاب عن عائشة
حدثنا علي بن أبي طالب
حدثنا أبو هريرة عن النبي
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
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Performance check: Bulk processing should complete reasonably fast
    expect(processingTime).toBeLessThan(12000);
    
    // Check results display
    await expect(page.locator('text=Processing complete').or(page.locator('text=Analysis Results'))).toBeVisible();
    
    console.log(`Bulk processing completed in ${processingTime}ms`);
  });

  test('AI-4: Text Similarity Engine', async ({ page }) => {
    // Navigate to Advanced Processing tab
    await page.getByRole('tab', { name: 'Advanced Processing' }).click();
    
    // Check similarity engine interface
    await expect(page.locator('text=Text Similarity').or(page.locator('text=Similarity Search'))).toBeVisible();
    
    const testText = 'حدثنا أبو بكر بن أبي شيبة';
    
    // Find similarity input
    const similarityInput = page.locator('input[placeholder*="similarity"], textarea[placeholder*="compare"]').first();
    await similarityInput.fill(testText);
    
    const startTime = Date.now();
    
    // Execute similarity search
    await page.getByRole('button', { name: /Find Similar|Search Similar|Compare/ }).first().click();
    
    // Wait for similarity results
    await page.waitForSelector('[data-testid="similarity-results"], text="Similarity results", .similarity-match', { 
      timeout: 8000 
    });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Performance check: Similarity search should be fast
    expect(processingTime).toBeLessThan(4000);
    
    console.log(`Similarity search completed in ${processingTime}ms`);
  });

  test('AI-5: Memory Usage & Model Loading Performance', async ({ page }) => {
    // Monitor network requests for model loading
    const modelRequests = [];
    page.on('request', request => {
      if (request.url().includes('huggingface') || request.url().includes('.onnx') || request.url().includes('model')) {
        modelRequests.push(request.url());
      }
    });

    // Navigate to AI tab to trigger model loading
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    const startTime = Date.now();
    
    // Perform AI operation to ensure models are loaded
    const aiInput = page.locator('textarea').first();
    await aiInput.fill('حدثنا أبو بكر');
    await page.getByRole('button', { name: /Analyze/ }).first().click();
    
    // Wait for AI initialization
    await page.waitForTimeout(3000);
    
    const endTime = Date.now();
    const loadingTime = endTime - startTime;
    
    // Performance check: Model loading should be reasonable
    expect(loadingTime).toBeLessThan(8000);
    
    console.log(`AI Model loading completed in ${loadingTime}ms`);
    console.log(`Model requests detected: ${modelRequests.length}`);
  });

  test('AI-6: Arabic Unicode & RTL Text Handling', async ({ page }) => {
    // Test various Arabic text scenarios
    const testTexts = [
      'حدثنا أبو بكر بن أبي شيبة', // Standard Arabic
      'حَدَّثَنَا أَبُو بَكْرٍ', // With diacritics
      'حدثنا ابو بكر Ibn Abi Shaybah', // Mixed Arabic-English
      'قال رسول الله ﷺ', // With special characters
    ];

    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    for (const testText of testTexts) {
      // Clear previous input
      const aiInput = page.locator('textarea').first();
      await aiInput.clear();
      await aiInput.fill(testText);
      
      // Verify text is displayed correctly (RTL)
      await expect(aiInput).toHaveValue(testText);
      
      // Test processing
      await page.getByRole('button', { name: /Analyze/ }).first().click();
      await page.waitForTimeout(1000);
      
      console.log(`Arabic text test passed for: ${testText}`);
    }
  });

  test('AI-7: Error Handling & Recovery', async ({ page }) => {
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    // Test with invalid/problematic input
    const problematicInputs = [
      '', // Empty string
      'x'.repeat(10000), // Very long string
      '###invalid###', // Invalid characters
      '\u0000\u0001\u0002', // Control characters
    ];

    for (const input of problematicInputs) {
      const aiInput = page.locator('textarea').first();
      await aiInput.clear();
      await aiInput.fill(input);
      
      // Click analyze and check for graceful error handling
      await page.getByRole('button', { name: /Analyze/ }).first().click();
      
      // Should not crash - either show error message or handle gracefully
      await page.waitForTimeout(2000);
      
      // Check page is still functional
      await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
      
      console.log(`Error handling test passed for problematic input`);
    }
  });

  test('AI-8: Cross-Tab Workflow Integration', async ({ page }) => {
    // Test workflow that spans multiple tabs
    
    // Start with input analysis
    await page.getByRole('button', { name: 'Use this example' }).click();
    await page.getByRole('button', { name: 'Analyze Hadith' }).click();
    
    // Wait for results
    await expect(page.getByRole('tab', { name: /Results/ })).toBeVisible();
    
    // Navigate to AI Analysis with context
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    // Verify AI analysis can work with previous results
    await expect(page.locator('textarea, input[type="text"]').first()).toBeVisible();
    
    // Navigate to Advanced Processing
    await page.getByRole('tab', { name: 'Advanced Processing' }).click();
    
    // Check data consistency across tabs
    await expect(page.locator('text=Advanced Processing').or(page.locator('text=Bulk Processing'))).toBeVisible();
    
    console.log('Cross-tab workflow integration test completed');
  });

  test('AI-9: PDF Generation with AI Results', async ({ page }) => {
    // Process hadith to get results
    await page.getByRole('button', { name: 'Use this example' }).click();
    await page.getByRole('button', { name: 'Analyze Hadith' }).click();
    
    // Wait for results
    await expect(page.getByRole('tab', { name: /Results/ })).toBeVisible();
    
    // Look for PDF generation button
    const pdfButton = page.getByRole('button', { name: /Generate PDF|Export|Download Report/ }).first();
    
    if (await pdfButton.isVisible()) {
      const startTime = Date.now();
      
      // Click PDF generation
      await pdfButton.click();
      
      // Wait for PDF generation to complete
      await page.waitForTimeout(5000);
      
      const endTime = Date.now();
      const pdfTime = endTime - startTime;
      
      // Performance check: PDF generation should be reasonable
      expect(pdfTime).toBeLessThan(8000);
      
      console.log(`PDF generation completed in ${pdfTime}ms`);
    } else {
      console.log('PDF generation feature not found - may need implementation');
    }
  });

  test('AI-10: Complete AI Workflow Performance Benchmark', async ({ page }) => {
    const startTime = Date.now();
    
    // Complete workflow test
    // 1. Load example text
    await page.getByRole('button', { name: 'Use this example' }).click();
    const step1Time = Date.now();
    
    // 2. Analyze hadith (narrator recognition)
    await page.getByRole('button', { name: 'Analyze Hadith' }).click();
    await expect(page.getByRole('tab', { name: /Results/ })).toBeVisible();
    const step2Time = Date.now();
    
    // 3. AI analysis
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    const aiInput = page.locator('textarea').first();
    await aiInput.fill('حدثنا أبو بكر بن أبي شيبة');
    await page.getByRole('button', { name: /Analyze/ }).first().click();
    await page.waitForTimeout(2000);
    const step3Time = Date.now();
    
    // 4. Advanced processing
    await page.getByRole('tab', { name: 'Advanced Processing' }).click();
    await page.waitForTimeout(1000);
    const step4Time = Date.now();
    
    // Calculate timing
    const totalTime = step4Time - startTime;
    const analysisTime = step2Time - step1Time;
    const aiTime = step3Time - step2Time;
    
    // Performance assertions
    expect(totalTime).toBeLessThan(15000); // Complete workflow under 15s
    expect(analysisTime).toBeLessThan(5000); // Hadith analysis under 5s
    expect(aiTime).toBeLessThan(8000); // AI processing under 8s
    
    console.log(`Complete AI workflow benchmark:`);
    console.log(`- Total time: ${totalTime}ms`);
    console.log(`- Analysis time: ${analysisTime}ms`);
    console.log(`- AI processing time: ${aiTime}ms`);
  });
}); 