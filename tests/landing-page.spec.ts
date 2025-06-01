import { test, expect } from '@playwright/test';

test.describe('Islamic Hadith Narrator Checker - Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the hero section with Islamic branding', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: /Authenticate Hadith with Islamic AI/i })).toBeVisible();
    
    // Check Islamic badge
    await expect(page.getByText('AI-Powered Islamic Scholarship • بإذن الله')).toBeVisible();
    
    // Check Arabic text
    await expect(page.getByText('خدمة للعلم الشرعي')).toBeVisible();
    
    // Check Islamic messaging
    await expect(page.getByText('🕌 Serving the global Muslim community with respect and precision')).toBeVisible();
  });

  test('should display navigation with working links', async ({ page }) => {
    // Check navigation items
    await expect(page.getByRole('link', { name: 'Features' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Demo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    
    // Test Features link navigation
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('should display statistics with Islamic focus', async ({ page }) => {
    // Check narrator statistics
    await expect(page.getByText('50,000+')).toBeVisible();
    await expect(page.getByText('Narrators Analyzed')).toBeVisible();
    
    // Check accuracy rate
    await expect(page.getByText('95%+')).toBeVisible();
    await expect(page.getByText('Accuracy Rate')).toBeVisible();
    
    // Check processing speed
    await expect(page.getByText('<2s')).toBeVisible();
    await expect(page.getByText('Processing Speed')).toBeVisible();
    
    // Check Islamic traditions
    await expect(page.getByText('6 Books')).toBeVisible();
    await expect(page.getByText('Islamic Traditions')).toBeVisible();
  });

  test('should display 3D feature cards with Islamic technology focus', async ({ page }) => {
    // Scroll to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // Check section heading
    await expect(page.getByText('Built for Modern Islamic Scholarship')).toBeVisible();
    await expect(page.getByText('Advanced Islamic Technology')).toBeVisible();
    
    // Check feature cards
    await expect(page.getByText('AI-Powered Analysis')).toBeVisible();
    await expect(page.getByText('Advanced Arabic NLP models trained specifically for hadith narrator recognition')).toBeVisible();
    
    await expect(page.getByText('Instant Verification')).toBeVisible();
    await expect(page.getByText('Traditional Methodology')).toBeVisible();
    await expect(page.getByText('Professional Reports')).toBeVisible();
    await expect(page.getByText('Global Accessibility')).toBeVisible();
    
    // Check Arabic text in features
    await expect(page.getByText('الجمع بين التراث والتقنية')).toBeVisible();
  });

  test('should display CTA section with Islamic messaging', async ({ page }) => {
    // Scroll to CTA section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check CTA heading
    await expect(page.getByText('Ready to Transform Your Islamic Research?')).toBeVisible();
    await expect(page.getByText('Join the Islamic AI Revolution')).toBeVisible();
    
    // Check Arabic CTA text
    await expect(page.getByText('انضم إلى ثورة البحث الإسلامي')).toBeVisible();
    
    // Check feature highlights
    await expect(page.getByText('Premium AI Models')).toBeVisible();
    await expect(page.getByText('Trained on authentic Islamic sources')).toBeVisible();
    
    await expect(page.getByText('Scholarly Approved')).toBeVisible();
    await expect(page.getByText('Validated by Islamic scholars')).toBeVisible();
    
    await expect(page.getByText('Global Access')).toBeVisible();
    await expect(page.getByText('Available worldwide, 24/7')).toBeVisible();
  });

  test('should display footer with Islamic focus and working links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check Islamic branding in footer
    await expect(page.getByText('خدمة للعلم الشرعي • بإذن الله')).toBeVisible();
    await expect(page.getByText('🕌 Built with love for the Ummah')).toBeVisible();
    
    // Check Islamic focus section
    await expect(page.getByText('Islamic Focus')).toBeVisible();
    await expect(page.getByText('Sahih Bukhari')).toBeVisible();
    await expect(page.getByText('Sahih Muslim')).toBeVisible();
    await expect(page.getByText('Classical Methodology')).toBeVisible();
    await expect(page.getByText('Scholar Verified')).toBeVisible();
    
    // Check platform links
    await expect(page.getByRole('link', { name: 'Features' }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Demo' }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'App' })).toBeVisible();
    
    // Test app link
    await page.getByRole('link', { name: 'App' }).click();
    await expect(page).toHaveURL('/app');
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /Authenticate Hadith with Islamic AI/i })).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: /Authenticate Hadith with Islamic AI/i })).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: /Authenticate Hadith with Islamic AI/i })).toBeVisible();
  });

  test('should display Sign In functionality', async ({ page }) => {
    // Check Sign In button is visible
    await expect(page.getByRole('button', { name: 'Sign In' }).first()).toBeVisible();
    
    // Check multiple Sign In buttons in different sections
    const signInButtons = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButtons).toHaveCount(3); // Navigation, hero CTA, and CTA section
  });

  test('should have proper Islamic color scheme', async ({ page }) => {
    // Check if the page has Islamic green colors
    const heroSection = page.locator('.bg-gradient-to-br').first();
    await expect(heroSection).toBeVisible();
    
    // Check if Islamic-themed elements are present
    await expect(page.getByText('Islamic AI')).toBeVisible();
    await expect(page.getByText('Islamic Scholarship')).toBeVisible();
    await expect(page.getByText('Islamic Research')).toBeVisible();
  });

  test('should display typewriter effect', async ({ page }) => {
    // Wait for typewriter effect to be visible
    await page.waitForSelector('[class*="typewriter"]', { timeout: 10000 });
    
    // Check if typewriter cursor is present
    const cursor = page.locator('[class*="bg-yellow-400"]');
    await expect(cursor).toBeVisible();
  });

  test('should have proper meta information', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Saas Starter/);
    
    // Check if page loads without console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should have minimal console errors (only allow React DevTools message)
    const significantErrors = consoleErrors.filter(error => 
      !error.includes('React DevTools') && 
      !error.includes('Download the React DevTools')
    );
    expect(significantErrors).toHaveLength(0);
  });
}); 