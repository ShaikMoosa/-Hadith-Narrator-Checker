import { test, expect } from '@playwright/test';

test.describe('Hadith Narrator Checker Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/app');
    
    // Wait for the page to load
    await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
  });

  test('Test 1: Application Loading & Navigation', async ({ page }) => {
    // Check Arabic title is displayed
    await expect(page.locator('h1:has-text("مُتحقق الرواة")')).toBeVisible();
    
    // Check English title is displayed
    await expect(page.locator('h2:has-text("Hadith Narrator Checker")')).toBeVisible();
    
    // Check all main tabs are present
    await expect(page.getByRole('tab', { name: 'Hadith Analysis' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Advanced Search' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Results/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Statistics' })).toBeVisible();
    
    // Check feature cards
    await expect(page.locator('text=Classical Sources')).toBeVisible();
    await expect(page.locator('text=Verified Narrators')).toBeVisible();
    await expect(page.locator('text=Advanced Search')).toBeVisible();
  });

  test('Test 2: Example Hadith Functionality', async ({ page }) => {
    // Check initial state - Analyze button should be disabled
    await expect(page.getByRole('button', { name: 'Analyze Hadith' })).toBeDisabled();
    
    // Click "Use this example" button
    await page.getByRole('button', { name: 'Use this example' }).click();
    
    // Check that hadith text is loaded
    const textbox = page.getByRole('textbox', { name: 'Hadith Text (Arabic or English)' });
    await expect(textbox).toHaveValue(/حدثنا أبو بكر بن أبي شيبة/);
    
    // Check that Analyze button is now enabled
    await expect(page.getByRole('button', { name: 'Analyze Hadith' })).toBeEnabled();
  });

  test('Test 3: Hadith Analysis Engine', async ({ page }) => {
    // Load example hadith
    await page.getByRole('button', { name: 'Use this example' }).click();
    
    // Click Analyze Hadith button
    await page.getByRole('button', { name: 'Analyze Hadith' }).click();
    
    // Wait for analysis to complete and results tab to be active
    await expect(page.getByRole('tab', { name: /Results \(3\)/ })).toBeVisible();
    
    // Check that 3 narrators were identified
    await expect(page.locator('text=3 narrators identified')).toBeVisible();
    
    // Check specific narrators are displayed
    await expect(page.locator('heading', { hasText: 'أبو بكر الصديق' })).toBeVisible();
    await expect(page.locator('heading', { hasText: 'عمر بن الخطاب' })).toBeVisible();
    await expect(page.locator('heading', { hasText: 'علي بن أبي طالب' })).toBeVisible();
    
    // Check narrator details
    await expect(page.locator('text=Abu Bakr As-Siddiq')).toBeVisible();
    await expect(page.locator('text=573 - 634 AH')).toBeVisible();
    await expect(page.locator('text=Mecca/Medina')).toBeVisible();
    
    // Check trustworthy badges
    await expect(page.locator('text=trustworthy').first()).toBeVisible();
  });

  test('Test 4: Narrator Profile Modal', async ({ page }) => {
    // Load example and analyze
    await page.getByRole('button', { name: 'Use this example' }).click();
    await page.getByRole('button', { name: 'Analyze Hadith' }).click();
    
    // Wait for results
    await expect(page.getByRole('tab', { name: /Results \(3\)/ })).toBeVisible();
    
    // Click View Details for first narrator
    await page.getByRole('button', { name: 'View Details' }).first().click();
    
    // Check modal opened with narrator details
    await expect(page.locator('heading', { hasText: 'أبو بكر الصديق' })).toBeVisible();
    await expect(page.locator('text=Abu Bakr As-Siddiq')).toBeVisible();
    
    // Check Biography tab is active by default
    await expect(page.getByRole('tab', { name: 'Biography' })).toHaveAttribute('aria-selected', 'true');
    
    // Check biographical information
    await expect(page.locator('text=573 - 634 AH')).toBeVisible();
    await expect(page.locator('text=Mecca/Medina')).toBeVisible();
    
    // Click Scholarly Opinions tab
    await page.getByRole('tab', { name: /Scholarly Opinions/ }).click();
    
    // Check scholarly opinion is displayed
    await expect(page.locator('text=Ibn Hajar al-Asqalani')).toBeVisible();
    await expect(page.locator('text=Al-Isabah')).toBeVisible();
    await expect(page.locator('text=The most truthful of people after the Prophet')).toBeVisible();
    
    // Close modal by clicking close button
    await page.locator('button').filter({ hasText: /^$/ }).first().click();
  });

  test('Test 5: Advanced Search Functionality', async ({ page }) => {
    // Click Advanced Search tab
    await page.getByRole('tab', { name: 'Advanced Search' }).click();
    
    // Check search interface elements
    await expect(page.locator('heading', { hasText: 'Advanced Narrator Search' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Search by Arabic name/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Advanced Filters' })).toBeVisible();
    
    // Check Search button is initially disabled
    await expect(page.getByRole('button', { name: 'Search Narrators' })).toBeDisabled();
    
    // Enter search term
    await page.getByRole('textbox', { name: /Search by Arabic name/ }).fill('Abu');
    
    // Check Search button is now enabled
    await expect(page.getByRole('button', { name: 'Search Narrators' })).toBeEnabled();
    
    // Check active filter badge appears
    await expect(page.locator('text=Search: "Abu"')).toBeVisible();
    
    // Execute search
    await page.getByRole('button', { name: 'Search Narrators' }).click();
    
    // Wait for search results
    await expect(page.getByRole('tab', { name: /Results \(2\)/ })).toBeVisible();
    
    // Check search found 2 narrators
    await expect(page.locator('text=2 narrators identified')).toBeVisible();
    
    // Check specific search results
    await expect(page.locator('heading', { hasText: 'أبو بكر الصديق' })).toBeVisible();
    await expect(page.locator('heading', { hasText: 'أبو هريرة' })).toBeVisible();
    
    // Check narrator details in search results
    await expect(page.locator('text=Abu Bakr As-Siddiq')).toBeVisible();
    await expect(page.locator('text=Abu Hurairah')).toBeVisible();
  });

  test('Test 6: Search Results Display and Interaction', async ({ page }) => {
    // Perform search from Advanced Search tab
    await page.getByRole('tab', { name: 'Advanced Search' }).click();
    await page.getByRole('textbox', { name: /Search by Arabic name/ }).fill('Abu');
    await page.getByRole('button', { name: 'Search Narrators' }).click();
    
    // Wait for results
    await expect(page.getByRole('tab', { name: /Results \(2\)/ })).toBeVisible();
    
    // Check both narrators have complete information
    // Abu Bakr As-Siddiq
    await expect(page.locator('text=Abu Bakr As-Siddiq')).toBeVisible();
    await expect(page.locator('text=573 - 634 AH')).toBeVisible();
    
    // Abu Hurairah
    await expect(page.locator('text=Abu Hurairah')).toBeVisible();
    await expect(page.locator('text=599 - 681 AH')).toBeVisible();
    await expect(page.locator('text=Yemen/Medina')).toBeVisible();
    
    // Check interaction buttons are present
    await expect(page.getByRole('button', { name: 'View Details' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bookmark' }).first()).toBeVisible();
    
    // Check trustworthy badges
    await expect(page.locator('text=trustworthy').first()).toBeVisible();
  });

  test('Test 7: Statistics Dashboard', async ({ page }) => {
    // Click Statistics tab
    await page.getByRole('tab', { name: 'Statistics' }).click();
    
    // Check main statistics heading
    await expect(page.locator('heading', { hasText: 'Database Statistics' })).toBeVisible();
    
    // Check refresh button
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    
    // Check timestamp
    await expect(page.locator('text=Last updated:')).toBeVisible();
    
    // Check key statistics
    await expect(page.locator('text=Total Narrators')).toBeVisible();
    await expect(page.locator('text=Trustworthy')).toBeVisible();
    await expect(page.locator('text=Weak')).toBeVisible();
    await expect(page.locator('text=Regions')).toBeVisible();
    
    // Check specific numbers
    await expect(page.locator('text="6"')).toBeVisible(); // Total narrators
    await expect(page.locator('text="5"')).toBeVisible(); // Trustworthy
    await expect(page.locator('text="1"')).toBeVisible(); // Weak
    await expect(page.locator('text="3"')).toBeVisible(); // Regions
    
    // Check percentages
    await expect(page.locator('text=83%')).toBeVisible();
    await expect(page.locator('text=17%')).toBeVisible();
    
    // Check Database Insights section
    await expect(page.locator('heading', { hasText: 'Database Insights' })).toBeVisible();
    await expect(page.locator('heading', { hasText: 'Credibility Assessment' })).toBeVisible();
    await expect(page.locator('heading', { hasText: 'Scholarly Knowledge' })).toBeVisible();
    
    // Check Quick Facts section
    await expect(page.locator('heading', { hasText: 'Quick Facts' })).toBeVisible();
    await expect(page.locator('text=83% of narrators are considered trustworthy')).toBeVisible();
    await expect(page.locator('text=Coverage spans 3 different regions')).toBeVisible();
    await expect(page.locator('text=7 scholarly opinions recorded')).toBeVisible();
    
    // Check system status
    await expect(page.locator('text=Database Status: Healthy')).toBeVisible();
    await expect(page.locator('text=All systems operational')).toBeVisible();
  });

  test('Test 8: Full Workflow Integration', async ({ page }) => {
    // Test complete workflow from hadith analysis to statistics
    
    // 1. Start with hadith analysis
    await page.getByRole('button', { name: 'Use this example' }).click();
    await page.getByRole('button', { name: 'Analyze Hadith' }).click();
    await expect(page.getByRole('tab', { name: /Results \(3\)/ })).toBeVisible();
    
    // 2. View narrator details
    await page.getByRole('button', { name: 'View Details' }).first().click();
    await expect(page.locator('heading', { hasText: 'أبو بكر الصديق' })).toBeVisible();
    await page.getByRole('tab', { name: /Scholarly Opinions/ }).click();
    await expect(page.locator('text=Ibn Hajar al-Asqalani')).toBeVisible();
    
    // Close modal
    await page.locator('button').filter({ hasText: /^$/ }).first().click();
    
    // 3. Switch to advanced search
    await page.getByRole('tab', { name: 'Advanced Search' }).click();
    await page.getByRole('textbox', { name: /Search by Arabic name/ }).fill('Abu');
    await page.getByRole('button', { name: 'Search Narrators' }).click();
    await expect(page.getByRole('tab', { name: /Results \(2\)/ })).toBeVisible();
    
    // 4. Check statistics
    await page.getByRole('tab', { name: 'Statistics' }).click();
    await expect(page.locator('text=Database Status: Healthy')).toBeVisible();
    
    // 5. Return to hadith analysis
    await page.getByRole('tab', { name: 'Hadith Analysis' }).click();
    await expect(page.locator('heading', { hasText: 'Hadith Text Analysis' })).toBeVisible();
  });

  test('Test 9: Responsive Design Elements', async ({ page }) => {
    // Check that key elements are visible and properly positioned
    await expect(page.locator('main')).toBeVisible();
    
    // Check header elements
    await expect(page.locator('link', { hasText: 'App' })).toBeVisible();
    
    // Check footer
    await expect(page.locator('text=Built with ❤️ for Islamic scholarship')).toBeVisible();
    await expect(page.locator('text=تم بناؤه لخدمة العلوم الإسلامية')).toBeVisible();
    
    // Check tab navigation is accessible
    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible();
    
    // Test keyboard navigation (optional)
    await page.getByRole('tab', { name: 'Hadith Analysis' }).focus();
    await expect(page.getByRole('tab', { name: 'Hadith Analysis' })).toBeFocused();
  });

  test('Test 10: Error Handling and Edge Cases', async ({ page }) => {
    // Test empty search
    await page.getByRole('tab', { name: 'Advanced Search' }).click();
    
    // Search button should be disabled when no text
    await expect(page.getByRole('button', { name: 'Search Narrators' })).toBeDisabled();
    
    // Test clear functionality
    await page.getByRole('textbox', { name: /Search by Arabic name/ }).fill('test');
    await expect(page.locator('text=Search: "test"')).toBeVisible();
    
    // Clear the search
    await page.locator('button').filter({ hasText: /^$/ }).last().click();
    await expect(page.getByRole('button', { name: 'Search Narrators' })).toBeDisabled();
    
    // Test statistics refresh
    await page.getByRole('tab', { name: 'Statistics' }).click();
    await page.getByRole('button', { name: 'Refresh' }).click();
    
    // Should still show healthy status
    await expect(page.locator('text=Database Status: Healthy')).toBeVisible();
  });
}); 