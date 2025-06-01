module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        chromeFlags: ['--no-sandbox', '--disable-dev-shm-usage'],
        preset: 'desktop',
        throttlingMethod: 'simulate',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals for Islamic scholarship platform
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // AI Component Performance
        'speed-index': ['warn', { maxNumericValue: 3500 }],
        'interactive': ['warn', { maxNumericValue: 4000 }],
        
        // Arabic Text & RTL Support
        'color-contrast': ['error', { minScore: 1.0 }],
        'document-title': ['error', { minScore: 1.0 }],
        'html-has-lang': ['error', { minScore: 1.0 }],
        'meta-description': ['warn', { minScore: 1.0 }],
        
        // Security & Best Practices
        'uses-https': ['error', { minScore: 1.0 }],
        'uses-http2': ['warn', { minScore: 1.0 }],
        'no-vulnerable-libraries': ['error', { minScore: 1.0 }],
        'csp-xss': ['warn', { minScore: 1.0 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}; 