import { test, expect } from '@playwright/test';

/**
 * Build Validation Tests
 * Tests for build issues, AI functionality, and Windows compatibility
 */

test.describe('Build Issues Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000/app');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
  });

  test('should load without critical console errors', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Collect console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    // Wait for app to fully load
    await page.waitForTimeout(5000);
    
    // Check for critical errors (should be minimal)
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load resource') && // Allow some resource loading failures
      !error.includes('net::ERR_BLOCKED_BY_RESPONSE') // Allow some CSP blocks
    );
    
    console.log('Console Errors:', errors);
    console.log('Console Warnings:', warnings);
    
    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('should display AI Ready status', async ({ page }) => {
    // Check for AI Ready indicator
    const aiReadyBadge = page.locator('text=AI Ready');
    await expect(aiReadyBadge).toBeVisible({ timeout: 10000 });
    
    // Check for Connected status
    const connectedBadge = page.locator('text=Connected');
    await expect(connectedBadge).toBeVisible();
  });

  test('should handle Arabic text input correctly', async ({ page }) => {
    // Navigate to Analysis tab
    await page.click('[data-testid="analysis-tab"], text=Analysis');
    
    // Find the hadith input field
    const textArea = page.locator('textarea').first();
    await expect(textArea).toBeVisible();
    
    // Test Arabic text input
    const arabicText = 'حدثنا أبو بكر بن أبي شيبة حدثنا عبد الله بن نمير';
    await textArea.fill(arabicText);
    
    // Verify text is displayed correctly (RTL)
    const inputValue = await textArea.inputValue();
    expect(inputValue).toBe(arabicText);
  });

  test('should navigate between tabs without errors', async ({ page }) => {
    const tabs = [
      'Analysis',
      'Search', 
      'Results',
      'AI Analysis',
      'Advanced',
      'Statistics'
    ];
    
    for (const tab of tabs) {
      await page.click(`text=${tab}`);
      await page.waitForTimeout(1000);
      
      // Check that tab content loads
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should handle AI analysis gracefully', async ({ page }) => {
    // Navigate to AI Analysis tab
    await page.click('text=AI Analysis');
    await page.waitForTimeout(2000);
    
    // Check for AI dashboard
    const dashboard = page.locator('text=AI-Powered Analysis');
    await expect(dashboard).toBeVisible();
    
    // Look for error handling UI
    const errorElements = page.locator('[data-testid="error-state"], .error, text=error');
    const errorCount = await errorElements.count();
    
    // Should handle errors gracefully (show error UI, not crash)
    if (errorCount > 0) {
      console.log('AI errors detected, checking for graceful handling...');
      
      // Should show user-friendly error messages
      const userFriendlyError = page.locator('text=Failed to load AI models, text=Please try again');
      const hasUserFriendlyError = await userFriendlyError.count() > 0;
      
      expect(hasUserFriendlyError).toBe(true);
    }
  });

  test('should load page within performance thresholds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/app');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds (generous for development)
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000/app');
    
    // Simulate network failure
    await page.route('**/*', route => route.abort());
    
    // Try to trigger AI functionality
    await page.click('text=AI Analysis');
    await page.waitForTimeout(3000);
    
    // Should show appropriate error messages
    const offlineIndicator = page.locator('text=offline, text=network, text=connection');
    const hasOfflineHandling = await offlineIndicator.count() > 0;
    
    // Should handle network issues gracefully
    expect(hasOfflineHandling).toBe(true);
  });
});

test.describe('Windows Compatibility', () => {
  test('should not have file path issues', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('EPERM')) {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000/app');
    await page.waitForTimeout(5000);
    
    // Should not have Windows file permission errors
    expect(errors.length).toBe(0);
  });

  test('should handle Windows-specific paths correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/app');
    
    // Check for path-related errors in console
    const pathErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && 
          (msg.text().includes('\\') || msg.text().includes('path'))) {
        pathErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(5000);
    
    // Should handle Windows paths correctly
    expect(pathErrors.length).toBeLessThan(2);
  });
});

test.describe('CSP and Security', () => {
  test('should allow necessary resources while maintaining security', async ({ page }) => {
    const blockedResources: string[] = [];
    const allowedResources: string[] = [];
    
    page.on('response', response => {
      if (response.status() === 200) {
        allowedResources.push(response.url());
      } else if (response.status() >= 400) {
        blockedResources.push(response.url());
      }
    });
    
    await page.goto('http://localhost:3000/app');
    await page.waitForTimeout(5000);
    
    console.log('Blocked resources:', blockedResources.length);
    console.log('Allowed resources:', allowedResources.length);
    
    // Should allow essential resources
    expect(allowedResources.length).toBeGreaterThan(5);
    
    // Some blocking is expected for security, but not everything
    expect(blockedResources.length).toBeLessThan(allowedResources.length);
  });

  test('should have proper CSP headers', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/app');
    const headers = response?.headers();
    
    // Should have CSP header
    expect(headers?.['content-security-policy']).toBeDefined();
    
    // Should allow necessary sources for AI
    const csp = headers?.['content-security-policy'] || '';
    expect(csp).toContain('cdn.jsdelivr.net');
    expect(csp).toContain('connect-src');
  });
}); 