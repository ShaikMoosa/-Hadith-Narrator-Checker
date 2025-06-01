import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers configuration for production
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Content Security Policy - Updated for AI model compatibility
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              "block-all-mixed-content",
              // Allow WASM and AI model loading
              "connect-src 'self' https://cdn.jsdelivr.net https://huggingface.co",
              "worker-src 'self' blob:",
              "child-src 'self' blob:"
            ].join('; ')
          },
          // Prevent XSS attacks
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Strict Transport Security for HTTPS enforcement
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Referrer policy for privacy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions policy for security - Fixed ambient-light-sensor warning
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()',
              'autoplay=(self)',
              'encrypted-media=(self)'
            ].join(', ')
          },
          // Cross-Origin policies - Relaxed for AI model loading
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          }
        ]
      },
      // Note: Removed overly restrictive API route CSP that was blocking AI functionality
      // API routes will inherit the main CSP policy which allows necessary resources
    ];
  },
  
  // Experimental features configuration - Fixed for Windows compatibility
  experimental: {
    // Optimize for Windows compatibility - Removed turbo rules causing issues
    turbo: {
      resolveAlias: {
        // Fix for Windows path resolution
        '@': './src',
      }
    },
    // Enable for better performance
    optimizePackageImports: ['@radix-ui/react-tabs', '@xenova/transformers'],
    // Enable for better memory management
    optimizeServerReact: true,
  },
  
  // Webpack configuration for better compatibility
  webpack: (config, { dev, isServer }) => {
    // Fix for @xenova/transformers in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
      
      // Add support for WASM files
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      };
    }
    
    // Optimize for Arabic text processing and WASM
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
    
    // Fix for Windows file watching issues
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.next'],
      };
    }
    
    return config;
  },
  
  // Output configuration for better build performance
  output: 'standalone',
  
  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,
  
  // Optimize bundle analyzer
  transpilePackages: ['@xenova/transformers'],
  
  // Add Windows-specific optimizations
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;
