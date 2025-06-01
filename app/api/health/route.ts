import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/utils/supabase/server';

interface HealthCheckItem {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime: number;
  error?: string;
  usage?: number;
  heap?: number;
  external?: number;
}

interface HealthCheckResponse {
  status: 'healthy' | 'warning' | 'unhealthy' | 'error';
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheckItem;
    ai: HealthCheckItem;
    security: HealthCheckItem;
    memory: HealthCheckItem;
  };
  responseTime?: number;
  message?: string;
}

/**
 * Health Check API Endpoint
 * Provides comprehensive system status for monitoring
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const healthCheck: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: { status: 'unknown', responseTime: 0 },
        ai: { status: 'unknown', responseTime: 0 },
        security: { status: 'unknown', responseTime: 0 },
        memory: { status: 'unknown', responseTime: 0, usage: 0 }
      }
    };

    // Database Health Check
    try {
      const dbStartTime = performance.now();
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase
        .from('narrator')
        .select('id')
        .limit(1);
      
      const dbEndTime = performance.now();
      healthCheck.checks.database = {
        status: error ? 'error' : 'healthy',
        responseTime: Math.round(dbEndTime - dbStartTime),
        ...(error && { error: error.message })
      };
    } catch (dbError) {
      healthCheck.checks.database = {
        status: 'error',
        responseTime: 0,
        error: dbError instanceof Error ? dbError.message : 'Database connection failed'
      };
    }

    // AI Components Health Check
    try {
      const aiStartTime = performance.now();
      // Simple AI module validation
      const aiModule = await import('@/lib/ai/arabic-nlp');
      const aiEndTime = performance.now();
      
      healthCheck.checks.ai = {
        status: aiModule ? 'healthy' : 'error',
        responseTime: Math.round(aiEndTime - aiStartTime)
      };
    } catch (aiError) {
      healthCheck.checks.ai = {
        status: 'error',
        responseTime: 0,
        error: aiError instanceof Error ? aiError.message : 'AI module failed'
      };
    }

    // Security Monitoring Check
    try {
      const securityStartTime = performance.now();
      const securityModule = await import('@/lib/security/security-audit');
      const securityEndTime = performance.now();
      
      healthCheck.checks.security = {
        status: securityModule ? 'healthy' : 'error',
        responseTime: Math.round(securityEndTime - securityStartTime)
      };
    } catch (securityError) {
      healthCheck.checks.security = {
        status: 'error',
        responseTime: 0,
        error: securityError instanceof Error ? securityError.message : 'Security module failed'
      };
    }

    // Memory Usage Check
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.heapUsed + memUsage.external;
      const memoryUsageMB = Math.round(totalMemory / 1024 / 1024);
      
      healthCheck.checks.memory = {
        status: memoryUsageMB < 512 ? 'healthy' : 'warning',
        responseTime: 0,
        usage: memoryUsageMB,
        heap: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      };
    }

    // Overall Status Assessment
    const hasErrors = Object.values(healthCheck.checks).some(
      check => check.status === 'error'
    );
    const hasWarnings = Object.values(healthCheck.checks).some(
      check => check.status === 'warning'
    );

    if (hasErrors) {
      healthCheck.status = 'unhealthy';
    } else if (hasWarnings) {
      healthCheck.status = 'warning';
    }

    const totalTime = performance.now() - startTime;
    
    // Add response time and message
    healthCheck.responseTime = Math.round(totalTime);
    healthCheck.message = healthCheck.status === 'healthy' 
      ? 'الحمد لله - System is running smoothly'
      : 'System requires attention - Please check component status';

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'warning' ? 200 : 503;

    return NextResponse.json(healthCheck, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
        'X-Health-Check': 'hadith-narrator-checker',
        'X-Response-Time': totalTime.toString()
      }
    });

  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Health check failed - System may be experiencing issues'
    };

    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
        'X-Health-Check': 'hadith-narrator-checker'
      }
    });
  }
}

// Support HEAD requests for load balancer health checks
export async function HEAD(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from('narrator')
      .select('id')
      .limit(1);
    
    return new NextResponse(null, { 
      status: error ? 503 : 200,
      headers: {
        'X-Health-Check': 'hadith-narrator-checker'
      }
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
} 