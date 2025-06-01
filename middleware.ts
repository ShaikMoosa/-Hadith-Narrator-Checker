import authConfig from "@/lib/auth.config"
import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Enhanced middleware configuration with security paths
export const config = {
	matcher: [
		"/app/:path*",
		"/api/:path*",
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
	],
};

const { auth } = NextAuth(authConfig)

// Rate limiting map for basic security
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 requests per minute per IP

/**
 * Security monitoring and logging
 */
function logSecurityEvent(event: string, request: NextRequest, details?: any) {
	const timestamp = new Date().toISOString();
	const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
	const userAgent = request.headers.get('user-agent') || 'unknown';
	
	console.log(`[SECURITY] [${timestamp}] ${event}:`, {
		ip,
		userAgent,
		url: request.url,
		method: request.method,
		...details
	});
}

/**
 * Basic rate limiting implementation
 */
function checkRateLimit(request: NextRequest): boolean {
	const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
	const now = Date.now();
	
	// Clean old entries
	for (const [key, value] of rateLimit.entries()) {
		if (now - value.timestamp > RATE_LIMIT_WINDOW) {
			rateLimit.delete(key);
		}
	}
	
	const existing = rateLimit.get(ip);
	if (!existing) {
		rateLimit.set(ip, { count: 1, timestamp: now });
		return true;
	}
	
	if (now - existing.timestamp > RATE_LIMIT_WINDOW) {
		rateLimit.set(ip, { count: 1, timestamp: now });
		return true;
	}
	
	existing.count++;
	if (existing.count > RATE_LIMIT_MAX_REQUESTS) {
		logSecurityEvent('RATE_LIMIT_EXCEEDED', request, { requestCount: existing.count });
		return false;
	}
	
	return true;
}

/**
 * Validate request headers for security
 */
function validateRequestHeaders(request: NextRequest): boolean {
	const contentType = request.headers.get('content-type');
	const userAgent = request.headers.get('user-agent');
	
	// Check for suspicious content types
	if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
		// Allow for form submissions but log
		logSecurityEvent('FORM_SUBMISSION', request, { contentType });
	}
	
	// Check for missing user agent (potential bot)
	if (!userAgent || userAgent.length < 10) {
		logSecurityEvent('SUSPICIOUS_USER_AGENT', request, { userAgent });
		// Don't block, but monitor
	}
	
	// Check for potentially malicious headers
	const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
	for (const header of suspiciousHeaders) {
		if (request.headers.get(header)) {
			logSecurityEvent('SUSPICIOUS_HEADER', request, { header, value: request.headers.get(header) });
		}
	}
	
	return true;
}

/**
 * Enhanced middleware with security features
 */
export default auth((req) => {
	const request = req as NextRequest;
	
	try {
		// Security header validation
		if (!validateRequestHeaders(request)) {
			logSecurityEvent('HEADER_VALIDATION_FAILED', request);
			return new NextResponse('Bad Request', { status: 400 });
		}
		
		// Rate limiting check
		if (!checkRateLimit(request)) {
			return new NextResponse('Too Many Requests', { 
				status: 429,
				headers: {
					'Retry-After': '60',
					'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
					'X-RateLimit-Window': RATE_LIMIT_WINDOW.toString()
				}
			});
		}
		
		// Handle API routes with additional security
		if (request.nextUrl.pathname.startsWith('/api/')) {
			// API routes security checks
			const method = request.method;
			
			// Log API access for monitoring
			logSecurityEvent('API_ACCESS', request, { endpoint: request.nextUrl.pathname, method });
			
			// Check for suspicious API access patterns
			if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
				const contentLength = request.headers.get('content-length');
				if (contentLength && parseInt(contentLength) > 1000000) { // 1MB limit
					logSecurityEvent('LARGE_PAYLOAD', request, { contentLength });
					return new NextResponse('Payload Too Large', { status: 413 });
				}
			}
			
			// Continue to API route
			return NextResponse.next();
		}
		
		// Authentication check for protected routes
		if (request.nextUrl.pathname.startsWith('/app')) {
			if (!req.auth) {
				logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', request);
				return NextResponse.redirect(new URL("/api/auth/signin", request.url));
			}
			
			// Log successful authentication
			logSecurityEvent('AUTHENTICATED_ACCESS', request, { 
				userId: req.auth.user?.id,
				email: req.auth.user?.email 
			});
		}
		
		// Add security headers to response
		const response = NextResponse.next();
		
		// Additional security headers for specific routes
		if (request.nextUrl.pathname.startsWith('/app')) {
			response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
			response.headers.set('Pragma', 'no-cache');
			response.headers.set('Expires', '0');
		}
		
		// Add security monitoring headers
		response.headers.set('X-Request-ID', crypto.randomUUID());
		response.headers.set('X-Security-Version', '1.0');
		
		return response;
		
	} catch (error) {
		// Log security errors
		logSecurityEvent('MIDDLEWARE_ERROR', request, { 
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined
		});
		
		return new NextResponse('Internal Server Error', { status: 500 });
	}
});