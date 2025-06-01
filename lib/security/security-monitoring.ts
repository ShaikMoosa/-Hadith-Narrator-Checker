/**
 * Security Monitoring and Event Tracking System
 * 
 * This module provides comprehensive security monitoring, event tracking,
 * and alerting capabilities for the Hadith Narrator Checker application.
 */

/**
 * Security event types
 */
export enum SecurityEventType {
  AUTHENTICATION_SUCCESS = 'auth_success',
  AUTHENTICATION_FAILURE = 'auth_failure',
  AUTHORIZATION_DENIED = 'authz_denied',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_ACCESS = 'data_access',
  API_ABUSE = 'api_abuse',
  CONFIGURATION_ERROR = 'config_error',
  SECURITY_SCAN_DETECTED = 'security_scan',
  INVALID_INPUT = 'invalid_input',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  RESOURCE_EXHAUSTION = 'resource_exhaustion'
}

/**
 * Security event severity levels
 */
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Security event interface
 */
interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  message: string;
  details: Record<string, any>;
  resolved: boolean;
  alertSent: boolean;
}

/**
 * Security metrics interface
 */
interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<SecuritySeverity, number>;
  eventsLast24h: number;
  criticalEventsUnresolved: number;
  topIpAddresses: Array<{ ip: string; count: number }>;
  topUserAgents: Array<{ userAgent: string; count: number }>;
  averageResponseTime: number;
}

/**
 * Security monitoring configuration
 */
interface MonitoringConfig {
  enabled: boolean;
  alertThresholds: {
    criticalEvents: number;
    suspiciousEventsPerHour: number;
    rateLimitViolationsPerHour: number;
  };
  retentionDays: number;
  enableAlerting: boolean;
  enableMetrics: boolean;
}

/**
 * Default monitoring configuration
 */
const DEFAULT_CONFIG: MonitoringConfig = {
  enabled: process.env.NODE_ENV === 'production',
  alertThresholds: {
    criticalEvents: 5,
    suspiciousEventsPerHour: 10,
    rateLimitViolationsPerHour: 50
  },
  retentionDays: 30,
  enableAlerting: true,
  enableMetrics: true
};

/**
 * Security monitoring class
 */
class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private config: MonitoringConfig;
  private metrics: SecurityMetrics | null = null;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring system
   */
  private initializeMonitoring(): void {
    if (!this.config.enabled) {
      console.log('[SECURITY] Security monitoring is disabled');
      return;
    }

    console.log('[SECURITY] Security monitoring initialized:', {
      enabled: this.config.enabled,
      alerting: this.config.enableAlerting,
      metrics: this.config.enableMetrics,
      retention: this.config.retentionDays
    });

    // Start cleanup interval
    setInterval(() => this.cleanupOldEvents(), 24 * 60 * 60 * 1000); // Daily cleanup
  }

  /**
   * Log a security event
   */
  public logEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    message: string,
    details: Record<string, any> = {},
    request?: {
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      url?: string;
      method?: string;
    }
  ): void {
    if (!this.config.enabled) return;

    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type,
      severity,
      timestamp: new Date().toISOString(),
      userId: request?.userId,
      sessionId: request?.sessionId,
      ipAddress: request?.ipAddress,
      userAgent: request?.userAgent,
      url: request?.url,
      method: request?.method,
      message,
      details,
      resolved: false,
      alertSent: false
    };

    this.events.push(event);
    this.logToConsole(event);

    // Check if alert should be sent
    if (this.config.enableAlerting && this.shouldAlert(event)) {
      this.sendAlert(event);
    }

    // Update metrics
    if (this.config.enableMetrics) {
      this.updateMetrics();
    }
  }

  /**
   * Log event to console with proper formatting
   */
  private logToConsole(event: SecurityEvent): void {
    const logLevel = this.getLogLevel(event.severity);
    const logMessage = `[SECURITY] [${event.severity.toUpperCase()}] ${event.type}: ${event.message}`;
    
    const logData = {
      id: event.id,
      timestamp: event.timestamp,
      userId: event.userId,
      ip: event.ipAddress,
      url: event.url,
      details: event.details
    };

    switch (logLevel) {
      case 'error':
        console.error(logMessage, logData);
        break;
      case 'warn':
        console.warn(logMessage, logData);
        break;
      case 'info':
        console.info(logMessage, logData);
        break;
      default:
        console.log(logMessage, logData);
    }
  }

  /**
   * Get appropriate log level for severity
   */
  private getLogLevel(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.CRITICAL:
      case SecuritySeverity.HIGH:
        return 'error';
      case SecuritySeverity.MEDIUM:
        return 'warn';
      case SecuritySeverity.LOW:
        return 'info';
      default:
        return 'log';
    }
  }

  /**
   * Check if an alert should be sent for this event
   */
  private shouldAlert(event: SecurityEvent): boolean {
    // Always alert for critical events
    if (event.severity === SecuritySeverity.CRITICAL) {
      return true;
    }

    // Check rate-based thresholds
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentEvents = this.events.filter(e => e.timestamp > oneHourAgo);

    // Check suspicious activity threshold
    const suspiciousEvents = recentEvents.filter(e => 
      e.type === SecurityEventType.SUSPICIOUS_ACTIVITY
    );
    if (suspiciousEvents.length >= this.config.alertThresholds.suspiciousEventsPerHour) {
      return true;
    }

    // Check rate limit violations
    const rateLimitEvents = recentEvents.filter(e => 
      e.type === SecurityEventType.RATE_LIMIT_EXCEEDED
    );
    if (rateLimitEvents.length >= this.config.alertThresholds.rateLimitViolationsPerHour) {
      return true;
    }

    return false;
  }

  /**
   * Send security alert
   */
  private sendAlert(event: SecurityEvent): void {
    // Mark as alert sent
    event.alertSent = true;

    // In a real implementation, this would send to:
    // - Email notifications
    // - Slack/Discord webhooks
    // - SMS alerts
    // - Monitoring services (DataDog, New Relic, etc.)
    
    console.error('[SECURITY ALERT]', {
      severity: event.severity,
      type: event.type,
      message: event.message,
      timestamp: event.timestamp,
      details: event.details
    });

    // Log the alert for audit purposes
    this.logEvent(
      SecurityEventType.CONFIGURATION_ERROR,
      SecuritySeverity.LOW,
      'Security alert sent',
      { originalEventId: event.id, alertType: 'console' }
    );
  }

  /**
   * Update security metrics
   */
  private updateMetrics(): void {
    const now = Date.now();
    const last24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const recentEvents = this.events.filter(e => e.timestamp > last24h);

    // Count events by type
    const eventsByType = {} as Record<SecurityEventType, number>;
    Object.values(SecurityEventType).forEach(type => {
      eventsByType[type] = this.events.filter(e => e.type === type).length;
    });

    // Count events by severity
    const eventsBySeverity = {} as Record<SecuritySeverity, number>;
    Object.values(SecuritySeverity).forEach(severity => {
      eventsBySeverity[severity] = this.events.filter(e => e.severity === severity).length;
    });

    // Get top IP addresses
    const ipCounts = new Map<string, number>();
    this.events.forEach(event => {
      if (event.ipAddress) {
        ipCounts.set(event.ipAddress, (ipCounts.get(event.ipAddress) || 0) + 1);
      }
    });
    const topIpAddresses = Array.from(ipCounts.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top user agents
    const uaCounts = new Map<string, number>();
    this.events.forEach(event => {
      if (event.userAgent) {
        uaCounts.set(event.userAgent, (uaCounts.get(event.userAgent) || 0) + 1);
      }
    });
    const topUserAgents = Array.from(uaCounts.entries())
      .map(([userAgent, count]) => ({ userAgent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    this.metrics = {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      eventsLast24h: recentEvents.length,
      criticalEventsUnresolved: this.events.filter(e => 
        e.severity === SecuritySeverity.CRITICAL && !e.resolved
      ).length,
      topIpAddresses,
      topUserAgents,
      averageResponseTime: 0 // Would be calculated from actual response times
    };
  }

  /**
   * Get current security metrics
   */
  public getMetrics(): SecurityMetrics | null {
    if (!this.config.enableMetrics) return null;
    
    this.updateMetrics();
    return this.metrics;
  }

  /**
   * Get recent security events
   */
  public getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get events by type
   */
  public getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter(e => e.type === type);
  }

  /**
   * Get events by severity
   */
  public getEventsBySeverity(severity: SecuritySeverity): SecurityEvent[] {
    return this.events.filter(e => e.severity === severity);
  }

  /**
   * Mark an event as resolved
   */
  public resolveEvent(eventId: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Clean up old events
   */
  private cleanupOldEvents(): void {
    const cutoffDate = new Date(
      Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const beforeCount = this.events.length;
    this.events = this.events.filter(e => e.timestamp > cutoffDate);
    const afterCount = this.events.length;

    if (beforeCount !== afterCount) {
      console.log(`[SECURITY] Cleaned up ${beforeCount - afterCount} old security events`);
    }
  }

  /**
   * Get security health status
   */
  public getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: SecurityMetrics | null;
  } {
    const metrics = this.getMetrics();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (metrics) {
      // Check for critical unresolved events
      if (metrics.criticalEventsUnresolved > 0) {
        status = 'critical';
        issues.push(`${metrics.criticalEventsUnresolved} unresolved critical events`);
      }

      // Check for high activity in last 24h
      if (metrics.eventsLast24h > 1000) {
        status = status === 'critical' ? 'critical' : 'warning';
        issues.push(`High security event volume: ${metrics.eventsLast24h} events in 24h`);
      }

      // Check for rate limit abuse
      const rateLimitEvents = metrics.eventsByType[SecurityEventType.RATE_LIMIT_EXCEEDED] || 0;
      if (rateLimitEvents > 100) {
        status = status === 'critical' ? 'critical' : 'warning';
        issues.push(`High rate limiting: ${rateLimitEvents} violations`);
      }
    }

    return { status, issues, metrics };
  }
}

// Create singleton instance
export const securityMonitor = new SecurityMonitor();

// Export convenience functions
export function logSecurityEvent(
  type: SecurityEventType,
  severity: SecuritySeverity,
  message: string,
  details?: Record<string, any>,
  request?: any
): void {
  securityMonitor.logEvent(type, severity, message, details, request);
}

export function getSecurityMetrics(): SecurityMetrics | null {
  return securityMonitor.getMetrics();
}

export function getSecurityHealth() {
  return securityMonitor.getHealthStatus();
} 