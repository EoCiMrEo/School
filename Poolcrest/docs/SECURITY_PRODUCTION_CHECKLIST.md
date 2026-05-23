# 🔒 Security Production Deployment Checklist

## ✅ Current Security Implementation Status

### Authentication Security
- ✅ **httpOnly Cookies**: JWT tokens stored in httpOnly cookies (XSS protection)
- ✅ **Secure Flag**: Automatically enabled in production (HTTPS only)
- ✅ **SameSite=Lax**: CSRF protection via cookie policy
- ✅ **Path='/'**: Cookies available across all endpoints
- ✅ **Token Expiration**: Access token (1 hour), Refresh token (7 days)
- ✅ **Automatic Token Refresh**: Frontend automatically refreshes expired tokens
- ✅ **Session Tracking**: UserSession model tracks all active sessions
- ✅ **Session Termination**: Users can terminate specific or all sessions

### Backend Security (Django)
- ✅ **Content Security Policy (CSP)**: Prevents XSS attacks
- ✅ **X-Frame-Options**: Prevents clickjacking
- ✅ **X-Content-Type-Options**: Prevents MIME sniffing
- ✅ **X-XSS-Protection**: Browser-level XSS protection
- ✅ **CSRF Protection**: Django CSRF middleware + httpOnly cookies
- ✅ **SQL Injection Prevention**: Django ORM with parameterized queries
- ✅ **Rate Limiting**: Login (5/min), Password reset (3/hour), API (100/min)
- ✅ **Input Validation**: Serializers validate all input data
- ✅ **Secure Middleware**: Custom middleware for additional security
- ✅ **CORS with Credentials**: Configured for cookie-based auth

### Frontend Security (React)
- ✅ **No Token Storage in localStorage**: Eliminated XSS vulnerability
- ✅ **sessionStorage for Non-Sensitive Data**: Only profile data, no tokens
- ✅ **Automatic Migration**: Cleans up old localStorage tokens
- ✅ **Comprehensive Logging**: All API requests/responses logged (dev only)
- ✅ **withCredentials**: Cookies sent with all API requests
- ✅ **CSRF Token Handling**: Automatic CSRF token management

---

## 🚀 Production Deployment Requirements

### Environment Variables (Critical)

#### Backend (.env)
```bash
# Production Environment
APP_ENV=production
DEBUG=False
IS_PRODUCTION=True

# Security Keys (CHANGE THESE!)
SECRET_KEY=<generate-strong-random-key-here>
DJANGO_SECRET_KEY=<generate-strong-random-key-here>

# Database (Use PostgreSQL in production)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Allowed Hosts
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# CORS Origins
FRONTEND_URL=https://yourdomain.com

# Cookie Domain (for cross-subdomain cookies)
JWT_AUTH_COOKIE_DOMAIN=.yourdomain.com

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379/0
```

#### Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api
NODE_ENV=production
```

### SSL/TLS Certificate (REQUIRED)
- ✅ **HTTPS Required**: Production MUST use HTTPS
- ✅ **Let's Encrypt**: Free SSL certificates (recommended)
- ✅ **Cloudflare**: Alternative CDN with free SSL
- ⚠️ **No HTTP in Production**: `secure=True` cookies only work with HTTPS

### Server Configuration

#### Nginx Configuration (Recommended)
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers (additional to Django's)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend (React)
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API (Django)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cookie forwarding
        proxy_pass_request_headers on;
        proxy_set_header Cookie $http_cookie;
    }
    
    # Django Static Files
    location /static/ {
        alias /var/www/backend/staticfiles/;
    }
    
    # Django Media Files
    location /media/ {
        alias /var/www/backend/media/;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔐 Pre-Deployment Security Checklist

### Django Settings Verification
- [ ] `DEBUG = False` in production
- [ ] `ALLOWED_HOSTS` contains your domain
- [ ] `SECRET_KEY` is strong and unique (50+ characters)
- [ ] `SESSION_COOKIE_SECURE = True`
- [ ] `CSRF_COOKIE_SECURE = True`
- [ ] `JWT_AUTH_COOKIE_SECURE = True`
- [ ] `SECURE_SSL_REDIRECT = True` (if using HTTPS)
- [ ] `SECURE_HSTS_SECONDS = 31536000` (1 year)
- [ ] `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
- [ ] `CORS_ALLOWED_ORIGINS` contains only your frontend URL
- [ ] `CORS_ALLOW_CREDENTIALS = True`
- [ ] Database is PostgreSQL (not SQLite)
- [ ] Redis is configured for rate limiting
- [ ] Email backend is configured for password reset

### Database Security
- [ ] Database user has limited permissions (not root)
- [ ] Database password is strong and unique
- [ ] Database is not publicly accessible
- [ ] Regular backups are configured
- [ ] Migrations are up to date

### File Permissions
- [ ] Django user has minimal permissions
- [ ] Static files are served by Nginx (not Django)
- [ ] Media files have proper permissions
- [ ] Logs directory is writable by Django user only

### Monitoring & Logging
- [ ] Error logging is configured (e.g., Sentry)
- [ ] Access logs are enabled
- [ ] Security logs are monitored
- [ ] Rate limit violations are logged
- [ ] Failed login attempts are logged

---

## 🧪 Security Testing Before Deployment

### 1. XSS Testing
```bash
# Try to inject script in login form
curl -X POST https://api.yourdomain.com/api/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>","password":"test"}'

# Expected: Should be rejected or sanitized
```

### 2. CSRF Testing
```bash
# Try request without CSRF token
curl -X POST https://api.yourdomain.com/api/users/auth/logout/ \
  -H "Content-Type: application/json"

# Expected: 403 Forbidden (CSRF token missing)
```

### 3. SQL Injection Testing
```bash
# Try SQL injection in email field
curl -X POST https://api.yourdomain.com/api/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com OR 1=1--","password":"test"}'

# Expected: 401 Unauthorized (invalid credentials)
```

### 4. Rate Limiting Testing
```bash
# Send 10 rapid login requests
for i in {1..10}; do
  curl -X POST https://api.yourdomain.com/api/users/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done

# Expected: 429 Too Many Requests after 5 attempts
```

### 5. Cookie Security Testing
1. Open browser DevTools → Application → Cookies
2. Check cookies have:
   - ✅ `HttpOnly` flag set
   - ✅ `Secure` flag set (in production/HTTPS)
   - ✅ `SameSite=Lax` or `SameSite=Strict`
   - ✅ `Path=/`
3. Try accessing cookies via JavaScript console:
```javascript
document.cookie // Should NOT show access_token or refresh_token
```

---

## 📊 Security Monitoring in Production

### Key Metrics to Monitor
1. **Failed Login Attempts**: Track and alert on >10 failures/minute
2. **Rate Limit Violations**: Monitor for DDoS attempts
3. **Token Refresh Failures**: May indicate token theft
4. **Session Anomalies**: Multiple sessions from different locations
5. **CSRF Failures**: Possible attack attempts
6. **SQL Injection Attempts**: Pattern matching in logs
7. **XSS Attempts**: Script injection in request data

### Recommended Tools
- **Sentry**: Error tracking and monitoring
- **Datadog**: Application performance monitoring
- **CloudFlare**: DDoS protection and CDN
- **AWS WAF**: Web application firewall
- **Fail2Ban**: Automatic IP blocking for brute force

---

## 🆘 Security Incident Response

### If Tokens are Compromised
1. Blacklist all refresh tokens: `RefreshToken.objects.all().blacklist()`
2. Force all users to re-login
3. Rotate `SECRET_KEY` (requires all users to re-login)
4. Investigate logs for breach source

### If Database is Compromised
1. Change all passwords immediately
2. Rotate database credentials
3. Check for unauthorized data access in logs
4. Notify affected users (if applicable by law)
5. Restore from backup if data is corrupted

### If XSS Attack is Detected
1. Sanitize user input immediately
2. Review and update CSP headers
3. Check for stored XSS in database
4. Deploy fix and force cache refresh

---

## 📚 Additional Security Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Django Security**: https://docs.djangoproject.com/en/stable/topics/security/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **CORS Explained**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **CSP Guide**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

## ✅ Final Production Checklist

Before deploying to production, verify:

- [ ] All environment variables are set correctly
- [ ] HTTPS is enabled with valid SSL certificate
- [ ] `DEBUG=False` in Django settings
- [ ] Database is PostgreSQL (not SQLite)
- [ ] Redis is running for rate limiting
- [ ] Static files are collected: `python manage.py collectstatic`
- [ ] Migrations are applied: `python manage.py migrate`
- [ ] CORS is configured with specific origins (not `*`)
- [ ] All security headers are enabled
- [ ] Rate limiting is active
- [ ] Error logging is configured
- [ ] Backups are automated
- [ ] Monitoring alerts are set up
- [ ] Security testing is completed
- [ ] Incident response plan is documented

---

**Last Updated**: October 27, 2025
**Security Review Required**: Every 3 months
**Next Review Date**: January 27, 2026
