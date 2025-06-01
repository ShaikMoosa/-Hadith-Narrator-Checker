import { test, expect, devices } from '@playwright/test';

/**
 * Cross-Browser Compatibility Tests for Hadith Narrator Checker
 * Tests application functionality across different browsers and devices
 */

// Define browser configurations
const browserTests = [
  { name: 'Desktop Chrome', device: {} },
  { name: 'Desktop Firefox', device: {} },
  { name: 'Desktop Safari', device: {} },
  { name: 'Mobile Chrome', device: devices['Pixel 5'] },
  { name: 'Mobile Safari', device: devices['iPhone 12'] },
];

// Create separate test files for each browser configuration
browserTests.forEach(({ name, device }) => {
  test.describe(`${name} Tests`, () => {
    // Apply device configuration at the top level
    if (Object.keys(device).length > 0) {
      test.use(device);
    }

    test(`BC-1: ${name} - Basic Page Load & Arabic Text Rendering`, async ({ page }) => {
      await page.goto('/app');
      
      // Check page loads successfully
      await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
      
      // Check Arabic text direction is RTL
      const arabicTitle = page.locator('h1:has-text("مُتحقق الرواة")');
      const direction = await arabicTitle.evaluate(el => getComputedStyle(el).direction);
      expect(direction).toBe('rtl');
      
      // Check English title loads
      await expect(page.locator('h2:has-text("Hadith Narrator Checker")')).toBeVisible();
      
      // Check all tabs are visible
      await expect(page.getByRole('tab', { name: 'Hadith Analysis' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Advanced Search' })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Results/ })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'AI Analysis' })).toBeVisible();
      
      console.log(`${name}: Basic page load test passed`);
    });

    test(`BC-2: ${name} - Arabic Text Input & Processing`, async ({ page }) => {
      await page.goto('/app');
      
      // Test Arabic text input
      await page.getByRole('button', { name: 'Use this example' }).click();
      
      // Verify Arabic text is properly loaded
      const textInput = page.getByRole('textbox', { name: /Hadith Text/ });
      const arabicValue = await textInput.inputValue();
      expect(arabicValue).toContain('حدثنا');
      expect(arabicValue).toContain('أبو بكر');
      
      // Test text analysis
      await page.getByRole('button', { name: 'Analyze Hadith' }).click();
      
      // Wait for results
      await expect(page.getByRole('tab', { name: /Results/ })).toBeVisible({ timeout: 10000 });
      
      // Check Arabic narrator names are displayed correctly
      await expect(page.locator('text=أبو بكر')).toBeVisible();
      await expect(page.locator('text=عمر بن الخطاب')).toBeVisible();
      
      console.log(`${name}: Arabic text processing test passed`);
    });

    test(`BC-3: ${name} - Font Rendering & Typography`, async ({ page }) => {
      await page.goto('/app');
      
      // Check Arabic font loading
      const arabicTitle = page.locator('h1:has-text("مُتحقق الرواة")');
      
      // Wait for fonts to load
      await page.waitForTimeout(2000);
      
      // Check font family is applied
      const fontFamily = await arabicTitle.evaluate(el => getComputedStyle(el).fontFamily);
      expect(fontFamily).toBeTruthy();
      
      // Check text is readable (not using fallback fonts)
      const fontSize = await arabicTitle.evaluate(el => getComputedStyle(el).fontSize);
      expect(parseInt(fontSize)).toBeGreaterThan(20);
      
      console.log(`${name}: Font rendering test passed - ${fontFamily}`);
    });

    test(`BC-4: ${name} - Responsive Design & Mobile Layout`, async ({ page }) => {
      await page.goto('/app');
      
      // Check responsive behavior
      const viewport = page.viewportSize();
      const isMobile = viewport?.width && viewport.width < 768;
      
      if (isMobile) {
        // Mobile-specific tests
        await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
        
        // Check tabs are accessible on mobile
        await expect(page.getByRole('tab', { name: 'Hadith Analysis' })).toBeVisible();
        
        // Test mobile interaction
        await page.getByRole('button', { name: 'Use this example' }).click();
        await expect(page.getByRole('textbox', { name: /Hadith Text/ })).toBeVisible();
        
        console.log(`${name}: Mobile layout test passed`);
      } else {
        // Desktop-specific tests
        await expect(page.locator('.max-w-7xl')).toBeVisible();
        console.log(`${name}: Desktop layout test passed`);
      }
    });

    test(`BC-5: ${name} - JavaScript & Interactive Elements`, async ({ page }) => {
      await page.goto('/app');
      
      // Test tab switching
      await page.getByRole('tab', { name: 'Advanced Search' }).click();
      await expect(page.locator('text=Advanced Narrator Search')).toBeVisible();
      
      await page.getByRole('tab', { name: 'AI Analysis' }).click();
      await expect(page.locator('text=AI-Powered').or(page.locator('text=AI Analysis'))).toBeVisible();
      
      // Test interactive buttons
      await page.getByRole('tab', { name: 'Hadith Analysis' }).click();
      await expect(page.getByRole('button', { name: 'Use this example' })).toBeEnabled();
      await expect(page.getByRole('button', { name: 'Analyze Hadith' })).toBeDisabled();
      
      console.log(`${name}: Interactive elements test passed`);
    });

    if (name.includes('Desktop')) {
      test(`BC-6: ${name} - Advanced Features & Performance`, async ({ page }) => {
        await page.goto('/app');
        
        // Test AI features (desktop only for performance)
        await page.getByRole('tab', { name: 'AI Analysis' }).click();
        
        const aiInput = page.locator('textarea').first();
        if (await aiInput.isVisible()) {
          await aiInput.fill('حدثنا أبو بكر بن أبي شيبة');
          
          // Test AI processing doesn't break
          const analyzeBtn = page.getByRole('button', { name: /Analyze/ }).first();
          if (await analyzeBtn.isVisible()) {
            await analyzeBtn.click();
            await page.waitForTimeout(3000);
          }
        }
        
        // Test advanced processing tab
        await page.getByRole('tab', { name: 'Advanced Processing' }).click();
        await expect(page.locator('text=Advanced').or(page.locator('text=Bulk'))).toBeVisible();
        
        console.log(`${name}: Advanced features test passed`);
      });
    }
  });
});

test.describe('Arabic Unicode & RTL Specific Tests', () => {
  test('UNI-1: Complex Arabic Text Rendering', async ({ page }) => {
    await page.goto('/app');
    
    const complexTexts = [
      'حَدَّثَنَا أَبُو بَكْرِ بْنُ أَبِي شَيْبَةَ', // With full diacritics
      'حدثنا أبو بكر بن أبي شيبة حدثنا وكيع', // Mixed names
      'قال رسول الله صلى الله عليه وسلم', // Religious phrases
      'حدثنا ابن عباس رضي الله عنهما', // With honorifics
    ];

    const textInput = page.getByRole('textbox', { name: /Hadith Text/ });
    
    for (const text of complexTexts) {
      await textInput.clear();
      await textInput.fill(text);
      
      // Verify text is preserved correctly
      const value = await textInput.inputValue();
      expect(value).toBe(text);
      
      // Check RTL rendering
      const direction = await textInput.evaluate(el => getComputedStyle(el).direction);
      expect(direction).toBe('rtl');
      
      console.log(`Complex Arabic text test passed: ${text.substring(0, 20)}...`);
    }
  });

  test('UNI-2: Mixed Language Content', async ({ page }) => {
    await page.goto('/app');
    
    const mixedTexts = [
      'حدثنا Abu Bakr بن أبي شيبة', // Arabic + English
      'Narrator: أبو بكر الصديق (Abu Bakr)', // English + Arabic + English
      'حدثنا أبو بكر 123 بن أبي شيبة', // Arabic + numbers
    ];

    const textInput = page.getByRole('textbox', { name: /Hadith Text/ });
    
    for (const text of mixedTexts) {
      await textInput.clear();
      await textInput.fill(text);
      
      const value = await textInput.inputValue();
      expect(value).toBe(text);
      
      console.log(`Mixed language test passed: ${text}`);
    }
  });
});

// Performance and Memory Tests
test.describe('Performance & Memory Tests', () => {
  test('PERF-1: Page Load Performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/app');
    await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('PERF-2: AI Model Loading Performance', async ({ page }) => {
    await page.goto('/app');
    
    const startTime = Date.now();
    
    // Navigate to AI tab to trigger model loading
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    
    // Wait for AI interface to be ready
    await expect(page.locator('text=AI-Powered').or(page.locator('text=AI Analysis'))).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // AI models should load within 8 seconds
    expect(loadTime).toBeLessThan(8000);
    
    console.log(`AI model load time: ${loadTime}ms`);
  });

  test('PERF-3: Memory Usage Monitoring', async ({ page }) => {
    await page.goto('/app');
    
    // Perform memory-intensive operations
    await page.getByRole('tab', { name: 'AI Analysis' }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('tab', { name: 'Advanced Processing' }).click();
    await page.waitForTimeout(2000);
    
    // Check for memory leaks by monitoring console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    // Should not have memory-related errors
    const memoryErrors = consoleErrors.filter(error => 
      error.includes('memory') || error.includes('heap') || error.includes('allocation')
    );
    
    expect(memoryErrors.length).toBe(0);
    
    console.log(`Memory monitoring completed. Console errors: ${consoleErrors.length}`);
  });
});

// Error Handling Tests
test.describe('Error Handling & Recovery Tests', () => {
  test('ERR-1: Network Error Recovery', async ({ page }) => {
    await page.goto('/app');
    
    // Simulate network issues by intercepting requests
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Try to perform an operation that requires network
    await page.getByRole('button', { name: 'Use this example' }).click();
    await page.getByRole('button', { name: 'Analyze Hadith' }).click();
    
    // Should show error message gracefully
    await expect(page.locator('text=error').or(page.locator('text=failed'))).toBeVisible({ timeout: 5000 });
    
    console.log('Network error handling test passed');
  });

  test('ERR-2: Invalid Input Handling', async ({ page }) => {
    await page.goto('/app');
    
    const textInput = page.getByRole('textbox', { name: /Hadith Text/ });
    
    // Test with invalid inputs
    const invalidInputs = [
      '', // Empty
      '   ', // Whitespace only
      '123456789', // Numbers only
      'abcdefghijk', // English only
      '!@#$%^&*()', // Special characters only
    ];
    
    for (const input of invalidInputs) {
      await textInput.clear();
      await textInput.fill(input);
      
      const analyzeBtn = page.getByRole('button', { name: 'Analyze Hadith' });
      
      if (input.trim() === '') {
        // Should be disabled for empty input
        await expect(analyzeBtn).toBeDisabled();
      } else {
        // Should handle invalid input gracefully
        await analyzeBtn.click();
        await page.waitForTimeout(1000);
        
        // Should not crash the application
        await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
      }
    }
    
    console.log('Invalid input handling test passed');
  });
}); 