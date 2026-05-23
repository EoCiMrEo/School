"""
Security Middleware for Enhanced Protection

This middleware adds security headers to prevent XSS, clickjacking, and other attacks.
Includes Content Security Policy (CSP), X-Frame-Options, and other security headers.
"""

from django.conf import settings
import secrets


class SecurityHeadersMiddleware:
    """
    Middleware that adds comprehensive security headers to all responses.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        self._add_security_headers(response, request)
        
        return response
    
    def _add_security_headers(self, response, request):
        """Add security headers to response"""
        
        # X-Content-Type-Options: Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # X-Frame-Options: Prevent clickjacking
        if not response.has_header('X-Frame-Options'):
            response['X-Frame-Options'] = 'DENY'
        
        # X-XSS-Protection: Enable browser XSS filter
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Referrer-Policy: Control referrer information
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Permissions-Policy: Control browser features
        response['Permissions-Policy'] = (
            'geolocation=(), '
            'microphone=(), '
            'camera=(), '
            'payment=(), '
            'usb=(), '
            'magnetometer=(), '
            'gyroscope=(), '
            'accelerometer=()'
        )
        
        # Content Security Policy
        if getattr(settings, 'CSP_ENABLED', False):
            self._add_csp_header(response, request)
        
        return response
    
    def _add_csp_header(self, response, request):
        """Add Content Security Policy header"""
        
        is_production = getattr(settings, 'IS_PRODUCTION', False)
        csp_report_only = getattr(settings, 'CSP_REPORT_ONLY', False)
        
        # Generate nonce for inline scripts (if needed in future)
        nonce = secrets.token_urlsafe(16)
        request.csp_nonce = nonce
        
        # Build CSP policy
        csp_directives = [
            "default-src 'self'",
            f"script-src 'self' 'nonce-{nonce}' https://cdn.jsdelivr.net https://unpkg.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: https: http:",
            "connect-src 'self' http://localhost:* http://127.0.0.1:* https://*",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
        ]
        
        # In development, be more permissive for hot reload
        if not is_production:
            csp_directives.extend([
                "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:*",
                "connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:*",
            ])
        
        csp_policy = '; '.join(csp_directives)
        
        # Use report-only mode in development
        if csp_report_only:
            response['Content-Security-Policy-Report-Only'] = csp_policy
        else:
            response['Content-Security-Policy'] = csp_policy


class RateLimitSecurityMiddleware:
    """
    Middleware for additional rate limiting and security checks
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.suspicious_patterns = [
            # SQL injection patterns
            r"(\bunion\b.*\bselect\b)",
            r"(\bor\b.*=.*)",
            r"(;.*drop\b)",
            # XSS patterns
            r"(<script[^>]*>.*?</script>)",
            r"(javascript:)",
            r"(onerror\s*=)",
            r"(onload\s*=)",
        ]
    
    def __call__(self, request):
        # Check for suspicious patterns in request
        if self._has_suspicious_content(request):
            from django.http import HttpResponseBadRequest
            return HttpResponseBadRequest("Invalid request")
        
        response = self.get_response(request)
        return response
    
    def _has_suspicious_content(self, request):
        """Check if request contains suspicious patterns"""
        import re
        
        # Check query parameters
        query_string = request.META.get('QUERY_STRING', '')
        for pattern in self.suspicious_patterns:
            if re.search(pattern, query_string, re.IGNORECASE):
                return True
        
        # Check POST data
        if request.method == 'POST':
            try:
                body = request.body.decode('utf-8', errors='ignore')
                for pattern in self.suspicious_patterns:
                    if re.search(pattern, body, re.IGNORECASE):
                        return True
            except Exception:
                pass
        
        return False


class SecureJWTCookieMiddleware:
    """
    Middleware to extract JWT from httpOnly cookies
    and add it to the Authorization header for DRF
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Paths that must NOT force JWT auth from cookies (allow invalid/expired tokens without 401)
        # These endpoints need to work even if access token is missing/expired
        skip_injection_paths = (
            '/auth/login/',
            '/auth/register/',
            '/auth/refresh/',
            '/auth/csrf/',
            '/auth/validate/',
            '/auth/password',  # covers password reset endpoints
        )

        # Extract JWT from cookie if not in header and not on skip paths
        if not request.META.get('HTTP_AUTHORIZATION') and not any(p in request.path for p in skip_injection_paths):
            access_token = request.COOKIES.get('access_token')
            if access_token:
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
                if settings.DEBUG:
                    print(f"✅ JWT extracted from cookie for {request.path}")
            elif settings.DEBUG:
                # Avoid noisy logs on auth endpoints
                print(f"⚠️  No access_token cookie found for {request.path}")
                print(f"   Available cookies: {list(request.COOKIES.keys())}")
        
        response = self.get_response(request)
        return response
