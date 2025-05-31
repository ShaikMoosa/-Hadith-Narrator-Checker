# Hadith Narrator Checker - Automated UI Tests

This directory contains comprehensive Playwright tests for the Hadith Narrator Checker application.

## Setup Instructions

### 1. Install Playwright

```bash
# Install Playwright test framework
npm install --save-dev @playwright/test

# Install browsers (one-time setup)
npx playwright install
```

### 2. Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report"
  }
}
```

## Running Tests

### Start the Development Server
Before running tests, ensure the application is running:

```bash
npm run dev
```

The application should be accessible at `http://localhost:3001`

### Run All Tests

```bash
# Run all tests in headless mode
npm run test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# View test report
npm run test:report
```

### Run Specific Tests

```bash
# Run a specific test file
npx playwright test hadith-app.spec.ts

# Run a specific test
npx playwright test --grep "Test 1: Application Loading"

# Run tests in headed mode (see browser)
npx playwright test --headed
```

## Test Coverage

Our comprehensive test suite covers:

### ✅ **Test 1: Application Loading & Navigation**
- Arabic title rendering
- English interface elements
- Tab navigation
- User authentication status
- Feature cards display

### ✅ **Test 2: Example Hadith Functionality**
- Example hadith loading
- Button state management
- Text input validation

### ✅ **Test 3: Hadith Analysis Engine**
- Narrator extraction from Arabic text
- Result count verification
- Narrator classification (trustworthy/weak)
- Biographical data display

### ✅ **Test 4: Narrator Profile Modal**
- Modal opening/closing
- Biography tab information
- Scholarly opinions display
- Classical source citations

### ✅ **Test 5: Advanced Search Functionality**
- Search interface validation
- Real-time search term processing
- Filter badge display
- Search result navigation

### ✅ **Test 6: Search Results Display**
- Multiple narrator results
- Complete biographical information
- Interaction button availability
- Credibility badge display

### ✅ **Test 7: Statistics Dashboard**
- Database metrics display
- Real-time analytics
- System health monitoring
- Geographic coverage stats

### ✅ **Test 8: Full Workflow Integration**
- End-to-end user journey
- Cross-tab navigation
- State preservation
- Complete functionality chain

### ✅ **Test 9: Responsive Design Elements**
- Layout verification
- Accessibility checks
- Keyboard navigation
- Visual element positioning

### ✅ **Test 10: Error Handling and Edge Cases**
- Empty search validation
- Clear functionality
- Button state management
- System refresh capabilities

## Browser Support

Tests run across multiple browsers and devices:

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)

## Configuration

The `playwright.config.ts` file includes:

- **Automatic server startup** - Tests will start the dev server automatically
- **Screenshot capture** - On test failures
- **Video recording** - For failed tests
- **Trace collection** - For debugging
- **Parallel execution** - For faster test runs

## Test Data

Tests use the existing sample data:
- **6 narrator profiles** with biographical information
- **7 scholarly opinions** from classical sources
- **3 geographic regions** represented
- **83% trustworthy, 17% weak** credibility distribution

## Continuous Integration

For CI/CD environments:

```bash
# CI optimized test run
CI=true npx playwright test

# Generate JUnit XML reports
npx playwright test --reporter=junit
```

## Debugging Tests

### Visual Debugging
```bash
# Open test with Playwright Inspector
npx playwright test --debug

# Record test actions
npx playwright codegen http://localhost:3001/app
```

### Screenshots and Videos
Test artifacts are automatically saved to:
- `test-results/` - Screenshots and videos on failure
- `playwright-report/` - HTML test reports

## Best Practices

1. **Ensure dev server is running** before executing tests
2. **Use data-testid attributes** for reliable element selection
3. **Wait for elements** instead of using fixed delays
4. **Group related tests** in describe blocks
5. **Use page object models** for complex workflows

## Troubleshooting

### Common Issues

**Port conflicts**: If port 3001 is in use, update the config:
```typescript
// playwright.config.ts
baseURL: 'http://localhost:3002'
```

**Database connection**: Ensure Supabase credentials are configured in `.env.local`

**Network timeouts**: Increase timeout in config:
```typescript
// playwright.config.ts
timeout: 60 * 1000 // 1 minute
```

## Related Files

- `hadith-app.spec.ts` - Main test suite
- `playwright.config.ts` - Test configuration
- `package.json` - NPM scripts and dependencies
- `memory-bank/progress.md` - Development progress with test results

---

**Created**: January 30, 2025  
**Test Framework**: Playwright v1.x  
**Application**: Hadith Narrator Checker v0.1.0 