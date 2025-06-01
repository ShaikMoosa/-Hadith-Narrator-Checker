/**
 * Secure Environment Configuration Management
 * 
 * This module provides secure environment variable validation,
 * configuration management, and runtime security checks for
 * production deployment of the Hadith Narrator Checker.
 */

/**
 * Environment configuration interface
 */
interface EnvironmentConfig {
  // Application environment
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Database configuration
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Authentication
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  
  // OAuth providers
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  
  // Security
  ENCRYPTION_KEY?: string;
  SECURITY_SALT?: string;
  
  // Monitoring
  VERCEL_URL?: string;
  
  // Features
  AI_ENABLED: boolean;
  PDF_GENERATION_ENABLED: boolean;
  CACHE_ENABLED: boolean;
}

/**
 * Required environment variables for production
 */
const REQUIRED_PRODUCTION_VARS = [
  'NODE_ENV',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
] as const;

/**
 * Sensitive environment variables that should be masked in logs
 */
const SENSITIVE_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_SECRET',
  'ENCRYPTION_KEY',
  'SECURITY_SALT'
] as const;

/**
 * Environment configuration singleton
 */
class EnvironmentConfigManager {
  private config: EnvironmentConfig | null = null;
  private isValidated = false;
  private validationErrors: string[] = [];

  /**
   * Get validated environment configuration
   */
  public getConfig(): EnvironmentConfig {
    if (!this.config || !this.isValidated) {
      this.validateAndLoad();
    }
    
    if (!this.config) {
      throw new Error('Environment configuration failed validation');
    }
    
    return this.config;
  }

  /**
   * Validate and load environment configuration
   */
  private validateAndLoad(): void {
    this.validationErrors = [];
    
    try {
      // Load raw environment variables
      const rawConfig = this.loadRawConfig();
      
      // Validate required variables
      this.validateRequiredVariables(rawConfig);
      
      // Validate variable formats
      this.validateVariableFormats(rawConfig);
      
      // Security validation
      this.validateSecurity(rawConfig);
      
      // Transform and type the configuration
      this.config = this.transformConfig(rawConfig);
      
      if (this.validationErrors.length === 0) {
        this.isValidated = true;
        this.logConfigurationStatus();
      } else {
        throw new Error(`Environment validation failed: ${this.validationErrors.join(', ')}`);
      }
      
    } catch (error) {
      console.error('[SECURITY] Environment configuration validation failed:', error);
      throw error;
    }
  }

  /**
   * Load raw environment variables
   */
  private loadRawConfig(): Record<string, string> {
    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
      SECURITY_SALT: process.env.SECURITY_SALT || '',
      VERCEL_URL: process.env.VERCEL_URL || '',
      AI_ENABLED: process.env.AI_ENABLED || 'true',
      PDF_GENERATION_ENABLED: process.env.PDF_GENERATION_ENABLED || 'true',
      CACHE_ENABLED: process.env.CACHE_ENABLED || 'false'
    };
  }

  /**
   * Validate required environment variables
   */
  private validateRequiredVariables(config: Record<string, string>): void {
    const isProduction = config.NODE_ENV === 'production';
    
    for (const varName of REQUIRED_PRODUCTION_VARS) {
      if (isProduction && !config[varName]) {
        this.validationErrors.push(`Missing required environment variable: ${varName}`);
      }
    }
  }

  /**
   * Validate environment variable formats
   */
  private validateVariableFormats(config: Record<string, string>): void {
    // Validate NODE_ENV
    if (!['development', 'production', 'test'].includes(config.NODE_ENV)) {
      this.validationErrors.push('NODE_ENV must be development, production, or test');
    }

    // Validate URLs
    if (config.SUPABASE_URL && !this.isValidUrl(config.SUPABASE_URL)) {
      this.validationErrors.push('SUPABASE_URL must be a valid URL');
    }

    if (config.NEXTAUTH_URL && !this.isValidUrl(config.NEXTAUTH_URL)) {
      this.validationErrors.push('NEXTAUTH_URL must be a valid URL');
    }

    // Validate Supabase keys format
    if (config.SUPABASE_ANON_KEY && !config.SUPABASE_ANON_KEY.startsWith('eyJ')) {
      this.validationErrors.push('SUPABASE_ANON_KEY appears to be invalid');
    }

    if (config.SUPABASE_SERVICE_ROLE_KEY && !config.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
      this.validationErrors.push('SUPABASE_SERVICE_ROLE_KEY appears to be invalid');
    }

    // Validate NextAuth secret length
    if (config.NEXTAUTH_SECRET && config.NEXTAUTH_SECRET.length < 32) {
      this.validationErrors.push('NEXTAUTH_SECRET must be at least 32 characters long');
    }
  }

  /**
   * Validate security configuration
   */
  private validateSecurity(config: Record<string, string>): void {
    const isProduction = config.NODE_ENV === 'production';

    if (isProduction) {
      // Ensure HTTPS in production
      if (config.NEXTAUTH_URL && !config.NEXTAUTH_URL.startsWith('https://')) {
        this.validationErrors.push('NEXTAUTH_URL must use HTTPS in production');
      }

      if (config.SUPABASE_URL && !config.SUPABASE_URL.startsWith('https://')) {
        this.validationErrors.push('SUPABASE_URL must use HTTPS in production');
      }

      // Validate secret strength
      if (config.NEXTAUTH_SECRET && this.isWeakSecret(config.NEXTAUTH_SECRET)) {
        this.validationErrors.push('NEXTAUTH_SECRET appears to be weak');
      }
    }
  }

  /**
   * Transform raw configuration to typed configuration
   */
  private transformConfig(rawConfig: Record<string, string>): EnvironmentConfig {
    return {
      NODE_ENV: rawConfig.NODE_ENV as 'development' | 'production' | 'test',
      SUPABASE_URL: rawConfig.SUPABASE_URL,
      SUPABASE_ANON_KEY: rawConfig.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: rawConfig.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_SECRET: rawConfig.NEXTAUTH_SECRET,
      NEXTAUTH_URL: rawConfig.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: rawConfig.GOOGLE_CLIENT_ID || undefined,
      GOOGLE_CLIENT_SECRET: rawConfig.GOOGLE_CLIENT_SECRET || undefined,
      GITHUB_CLIENT_ID: rawConfig.GITHUB_CLIENT_ID || undefined,
      GITHUB_CLIENT_SECRET: rawConfig.GITHUB_CLIENT_SECRET || undefined,
      ENCRYPTION_KEY: rawConfig.ENCRYPTION_KEY || undefined,
      SECURITY_SALT: rawConfig.SECURITY_SALT || undefined,
      VERCEL_URL: rawConfig.VERCEL_URL || undefined,
      AI_ENABLED: rawConfig.AI_ENABLED === 'true',
      PDF_GENERATION_ENABLED: rawConfig.PDF_GENERATION_ENABLED === 'true',
      CACHE_ENABLED: rawConfig.CACHE_ENABLED === 'true'
    };
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a secret is weak
   */
  private isWeakSecret(secret: string): boolean {
    // Basic weak secret detection
    const weakPatterns = [
      /^password/i,
      /^secret/i,
      /^admin/i,
      /^test/i,
      /^dev/i,
      /^demo/i,
      /123456/,
      /qwerty/i
    ];

    return weakPatterns.some(pattern => pattern.test(secret)) || 
           secret.length < 32 ||
           !/[A-Z]/.test(secret) ||
           !/[a-z]/.test(secret) ||
           !/[0-9]/.test(secret);
  }

  /**
   * Log configuration status (with sensitive data masked)
   */
  private logConfigurationStatus(): void {
    const config = this.config!;
    const maskedConfig = { ...config };
    
    // Mask sensitive values
    for (const sensitiveVar of SENSITIVE_VARS) {
      if (maskedConfig[sensitiveVar as keyof EnvironmentConfig]) {
        (maskedConfig as any)[sensitiveVar] = '***MASKED***';
      }
    }

    console.log('[SECURITY] Environment configuration validated successfully:', {
      environment: config.NODE_ENV,
      features: {
        ai: config.AI_ENABLED,
        pdf: config.PDF_GENERATION_ENABLED,
        cache: config.CACHE_ENABLED
      },
      oauth: {
        google: !!config.GOOGLE_CLIENT_ID,
        github: !!config.GITHUB_CLIENT_ID
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get configuration for security audit
   */
  public getSecurityAuditInfo(): {
    isProduction: boolean;
    hasAllRequiredVars: boolean;
    enabledFeatures: string[];
    configuredProviders: string[];
    validationErrors: string[];
  } {
    const config = this.getConfig();
    
    return {
      isProduction: config.NODE_ENV === 'production',
      hasAllRequiredVars: this.validationErrors.length === 0,
      enabledFeatures: [
        config.AI_ENABLED && 'AI',
        config.PDF_GENERATION_ENABLED && 'PDF',
        config.CACHE_ENABLED && 'Cache'
      ].filter(Boolean) as string[],
      configuredProviders: [
        config.GOOGLE_CLIENT_ID && 'Google',
        config.GITHUB_CLIENT_ID && 'GitHub'
      ].filter(Boolean) as string[],
      validationErrors: [...this.validationErrors]
    };
  }

  /**
   * Reset configuration (for testing)
   */
  public reset(): void {
    this.config = null;
    this.isValidated = false;
    this.validationErrors = [];
  }
}

// Export singleton instance
export const environmentConfig = new EnvironmentConfigManager();

// Export convenience function
export function getEnvironmentConfig(): EnvironmentConfig {
  return environmentConfig.getConfig();
}

// Export security audit function
export function getEnvironmentSecurityInfo() {
  return environmentConfig.getSecurityAuditInfo();
} 