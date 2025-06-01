import { test, expect, devices } from '@playwright/test';

/**
 * Cross-Browser Compatibility Tests for Hadith Narrator Checker
 * Tests Arabic text rendering, RTL support, and browser-specific functionality
 */
test.describe('Cross-Browser Compatibility Tests', () => {
  
  // Test on multiple browsers and devices
  const browserTests = [
    { name: 'Chrome Desktop', device: devices['Desktop Chrome'] },
    { name: 'Firefox Desktop', device: devices['Desktop Firefox'] },
    { name: 'Safari Desktop', device: devices['Desktop Safari'] },
    { name: 'Edge Desktop', device: devices['Desktop Edge'] },
    { name: 'Mobile Chrome', device: devices['Pixel 5'] },
    { name: 'Mobile Safari', device: devices['iPhone 12'] },
  ];

  browserTests.forEach(({ name, device }) => {
    test.describe(`${name} Tests`, () => {
      test.use(device);

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

  test.describe('Performance Across Browsers', () => {
    test('PERF-1: Page Load Performance', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/app');
      await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Performance expectation: Page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      console.log(`Page load time: ${loadTime}ms`);
    });

    test('PERF-2: Tab Switching Performance', async ({ page }) => {
      await page.goto('/app');
      
      const tabs = [
        'Advanced Search',
        'AI Analysis',
        'Advanced Processing',
        'Statistics',
        'Hadith Analysis',
      ];

      for (const tabName of tabs) {
        const startTime = Date.now();
        
        await page.getByRole('tab', { name: tabName }).click();
        await page.waitForTimeout(100); // Small delay to ensure rendering
        
        const switchTime = Date.now() - startTime;
        expect(switchTime).toBeLessThan(500); // Tab switch should be fast
        
        console.log(`Tab switch to ${tabName}: ${switchTime}ms`);
      }
    });
  });

  test.describe('Accessibility & Screen Reader Support', () => {
    test('A11Y-1: Keyboard Navigation', async ({ page }) => {
      await page.goto('/app');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate to first interactive element
      const focusedElement = await page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();
      
      console.log('Keyboard navigation test passed');
    });

    test('A11Y-2: ARIA Labels & Screen Reader Support', async ({ page }) => {
      await page.goto('/app');
      
      // Check for proper ARIA labels
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('tablist')).toBeVisible();
      
      // Check text input has proper labeling
      const textInput = page.getByRole('textbox', { name: /Hadith Text/ });
      await expect(textInput).toBeVisible();
      
      console.log('ARIA labels test passed');
    });
  });
}); 