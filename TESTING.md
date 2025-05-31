# 🧪 Automated Testing Guide - Hadith Narrator Checker

## Quick Start

### 1. Install Test Dependencies (One-time setup)
```bash
npm run test:install
```

### 2. Run All Tests
```bash
# Start dev server (in terminal 1)
npm run dev

# Run tests (in terminal 2)  
npm run test
```

## Available Test Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Run all tests in headless mode |
| `npm run test:ui` | Interactive test runner with UI |
| `npm run test:debug` | Debug mode with step-by-step execution |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:install` | Install Playwright and browsers |

## 📋 Comprehensive Test Coverage

Our automated test suite validates **10 critical user workflows**:

### ✅ **Core Application Features**
1. **Application Loading & Navigation** - Interface rendering, Arabic/English text, tab navigation
2. **Example Hadith Functionality** - Sample text loading, button state management
3. **Hadith Analysis Engine** - Narrator extraction, result processing, classification

### ✅ **User Interaction Flows**  
4. **Narrator Profile Modal** - Detail views, biography tabs, scholarly opinions
5. **Advanced Search Functionality** - Search interface, filtering, real-time validation
6. **Search Results Display** - Multi-narrator results, biographical data

### ✅ **Dashboard & Analytics**
7. **Statistics Dashboard** - Database metrics, real-time analytics, system health
8. **Full Workflow Integration** - End-to-end user journey testing

### ✅ **Quality Assurance**
9. **Responsive Design Elements** - Layout verification, accessibility, keyboard navigation  
10. **Error Handling & Edge Cases** - Input validation, error states, system boundaries

## 🎯 Test Data Coverage

Tests validate against live database content:
- **6 narrator profiles** with complete biographical information
- **7 scholarly opinions** from classical Islamic sources  
- **3 geographic regions** represented in the dataset
- **83% trustworthy, 17% weak** credibility distribution

## 🌐 Cross-Browser Testing

Automated tests run across:
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)

## 📊 Test Results & Reporting

### Automatic Test Artifacts
- **Screenshots** captured on test failures
- **Videos** recorded for failed test runs
- **Traces** collected for debugging
- **HTML reports** with detailed results

### View Test Reports
```bash
npx playwright show-report
```

## 🚀 CI/CD Integration

For continuous integration:
```bash
# Set environment for CI
export CI=true

# Run tests with CI optimizations
npm run test

# Generate JUnit reports for CI systems
npx playwright test --reporter=junit
```

## 🔧 Configuration Files

### Key Files Created:
- `tests/hadith-app.spec.ts` - Main test suite (10 comprehensive tests)
- `playwright.config.ts` - Playwright configuration with browser setup
- `scripts/run-tests.js` - Smart test runner with automatic setup
- `tests/README.md` - Detailed testing documentation

### Configuration Features:
- **Automatic server startup** for tests
- **Parallel test execution** for speed
- **Retry logic** for flaky tests
- **Multiple browser support**
- **Mobile device simulation**

## 🐛 Debugging Tests

### Visual Debugging
```bash
npm run test:debug
```

### Test Generation (Record new tests)
```bash
npx playwright codegen http://localhost:3001/app
```

### Inspect Test Results
```bash
# View trace files
npx playwright show-trace trace.zip

# Open test report
npx playwright show-report
```

## 🛠️ Troubleshooting

### Common Issues & Solutions

**❌ Tests fail with "Connection refused"**
```bash
# Ensure dev server is running
npm run dev
```

**❌ Playwright not found**
```bash
# Install test dependencies
npm run test:install
```

**❌ Port conflicts**
```bash
# Update playwright.config.ts if using different port
baseURL: 'http://localhost:3002'
```

**❌ Database connection issues**
```bash
# Verify Supabase environment variables in .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 📈 Test Performance

### Typical Run Times:
- **Single test**: 5-15 seconds
- **Full suite**: 2-5 minutes  
- **Cross-browser**: 8-12 minutes

### Optimization Tips:
- Run specific tests during development: `npx playwright test --grep "Test 1"`
- Use headless mode for faster execution: `npm run test`
- Parallel execution is enabled by default

## 🔄 Continuous Testing Workflow

### Recommended Development Flow:
1. **Make code changes**
2. **Run specific tests**: `npx playwright test --grep "relevant feature"`
3. **Fix any failures**
4. **Run full suite**: `npm run test`
5. **Commit with confidence**

### Pre-deployment Checklist:
- [ ] All tests pass: `npm run test`
- [ ] Cross-browser validation completed
- [ ] Performance regression checks
- [ ] Database connectivity verified

## 📚 Related Documentation

- [Playwright Official Docs](https://playwright.dev/)
- [Project Memory Bank](./memory-bank/progress.md) - Development history with test results
- [Application README](./HADITH_APP_README.md) - Project overview
- [Test File Documentation](./tests/README.md) - Detailed test descriptions

---

## ✨ Success Metrics

Our comprehensive testing ensures:
- **100% critical path coverage** - All major user workflows tested
- **Multi-browser compatibility** - Works across all target browsers  
- **Real-time validation** - Tests against live database
- **Performance monitoring** - Fast execution and reliable results
- **Developer confidence** - Automated quality assurance

**Last Updated**: January 30, 2025  
**Test Framework**: Playwright 1.x  
**Coverage**: 10 comprehensive test scenarios  
**Status**: ✅ Production Ready 