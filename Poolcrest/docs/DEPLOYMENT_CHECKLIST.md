# 🚀 Poolcrest Docker Deployment Checklist

## Pre-Deployment Checklist

### ✅ Prerequisites

- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] At least 4GB RAM available for Docker
- [ ] At least 10GB disk space available
- [ ] Git repository cloned/updated
- [ ] PowerShell or compatible shell access

### ✅ Environment Setup

#### Backend Configuration
- [ ] Copy `be/.env.example` to `be/.env` (if exists)
- [ ] Set `SECRET_KEY` in `be/.env` (generate with: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
- [ ] Set `DEBUG=False` for production
- [ ] Configure `ALLOWED_HOSTS` with your domain(s)
- [ ] Set database credentials (or use defaults)
- [ ] Configure `CORS_ALLOWED_ORIGINS`
- [ ] Review all other environment variables

#### Frontend Configuration
- [ ] Copy `fe/.env.example` to `fe/.env` (optional)
- [ ] Set `VITE_API_BASE_URL` if needed
- [ ] Configure any other frontend variables

#### Docker Compose
- [ ] Review `docker-compose.yml` settings
- [ ] Verify port mappings don't conflict
- [ ] Check volume configurations
- [ ] Ensure network settings are correct

## 🔨 Build Phase

### ✅ Initial Build

```powershell
# Clean build (first time)
- [ ] cd e:\Projects\Poolcrest
- [ ] docker-compose build --no-cache

# Check for build errors
- [ ] Review build output for warnings/errors
- [ ] Verify both images built successfully
```

### ✅ Image Verification

```powershell
# List built images
- [ ] docker images | grep poolcrest

# Expected output:
# poolcrest-be    latest    [IMAGE_ID]    [SIZE ~450MB]
# poolcrest-fe    latest    [IMAGE_ID]    [SIZE ~45MB]
```

## 🗄️ Database Setup

### ✅ Database Initialization

```powershell
# 1. Start database and Redis only
- [ ] docker-compose up -d poolcrest_db redis

# 2. Wait for services to be ready
- [ ] Start-Sleep -Seconds 10

# 3. Verify database is running
- [ ] docker-compose ps poolcrest_db
- [ ] docker-compose exec poolcrest_db pg_isready -U postgres

# 4. Run migrations
- [ ] docker-compose run --rm poolcrest-be python manage.py migrate

# 5. Create superuser
- [ ] docker-compose run --rm poolcrest-be python manage.py createsuperuser

# 6. Collect static files
- [ ] docker-compose run --rm poolcrest-be python manage.py collectstatic --noinput

# 7. (Optional) Load initial data
- [ ] docker-compose run --rm poolcrest-be python manage.py loaddata initial_data.json
```

### ✅ Database Verification

```powershell
# Check database connection
- [ ] docker-compose run --rm poolcrest-be python manage.py check --database default

# List migrations
- [ ] docker-compose run --rm poolcrest-be python manage.py showmigrations

# Verify superuser was created
- [ ] docker-compose exec poolcrest_db psql -U postgres -d poolcrest_db -c "SELECT username FROM auth_user WHERE is_superuser=true;"
```

## 🚀 Deployment

### ✅ Start All Services

```powershell
# Start all services
- [ ] docker-compose up -d

# Wait for services to stabilize
- [ ] Start-Sleep -Seconds 30

# Check all containers are running
- [ ] docker-compose ps
```

Expected output:
```
NAME            STATE    PORTS
poolcrest-be    Up       0.0.0.0:8000->8000/tcp
poolcrest-fe    Up       0.0.0.0:4028->4028/tcp
poolcrest_db    Up       0.0.0.0:5432->5432/tcp
redis           Up       0.0.0.0:6379->6379/tcp
```

### ✅ Service Verification

#### Backend Health Check
```powershell
- [ ] curl http://localhost:8000/api/health/
- [ ] curl http://localhost:8000/api/
- [ ] curl http://localhost:8000/admin/
```

#### Frontend Health Check
```powershell
- [ ] curl http://localhost:4028/health
- [ ] curl http://localhost:4028/
```

#### Redis Health Check
```powershell
- [ ] docker-compose exec redis redis-cli ping
# Expected: PONG
```

#### Database Health Check
```powershell
- [ ] docker-compose exec poolcrest_db pg_isready -U postgres
# Expected: accepting connections
```

### ✅ Log Verification

```powershell
# Check for errors in logs
- [ ] docker-compose logs poolcrest-be | grep -i error
- [ ] docker-compose logs poolcrest-fe | grep -i error
- [ ] docker-compose logs poolcrest_db | grep -i error

# Review last 50 lines
- [ ] docker-compose logs --tail=50 poolcrest-be
- [ ] docker-compose logs --tail=50 poolcrest-fe
```

## 🧪 Testing Phase

### ✅ Functional Testing

#### Backend API Tests
```powershell
# Test authentication endpoint
- [ ] curl -X POST http://localhost:8000/api/users/auth/login/ -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'

# Test protected endpoint (with token)
- [ ] curl http://localhost:8000/api/users/profile/ -H "Authorization: Bearer YOUR_TOKEN"

# Run Django tests
- [ ] docker-compose exec poolcrest-be python manage.py test
```

#### Frontend Tests
```powershell
# Test main page loads
- [ ] Open http://localhost:4028 in browser

# Test API proxy works
- [ ] Check browser console for API calls to /api/*

# Test WebSocket (if applicable)
- [ ] Check WebSocket connection in browser dev tools
```

### ✅ Integration Testing

```powershell
# Test full authentication flow
- [ ] Register new user via frontend
- [ ] Login via frontend
- [ ] Access protected pages
- [ ] Test logout

# Test file uploads (if applicable)
- [ ] Upload an image via frontend
- [ ] Verify file appears in media volume
- [ ] Verify file is accessible via URL
```

### ✅ Performance Testing

```powershell
# Check resource usage
- [ ] docker stats --no-stream

# Load test (optional, use tools like ab or wrk)
- [ ] ab -n 1000 -c 10 http://localhost:8000/api/health/
```

## 🔒 Security Checklist

### ✅ Container Security

```powershell
# Verify non-root execution
- [ ] docker-compose exec poolcrest-be whoami  # Should output: poolcrest
- [ ] docker-compose exec poolcrest-fe whoami  # Should output: poolcrest

# Check for security vulnerabilities
- [ ] docker scan poolcrest-be:latest
- [ ] docker scan poolcrest-fe:latest
```

### ✅ Application Security

```powershell
# Verify security headers (frontend)
- [ ] curl -I http://localhost:4028
# Look for:
# - X-Frame-Options: SAMEORIGIN
# - X-Content-Type-Options: nosniff
# - Content-Security-Policy: ...

# Verify CORS settings
- [ ] Check backend CORS_ALLOWED_ORIGINS in .env

# Verify DEBUG mode is off
- [ ] Confirm DEBUG=False in be/.env
- [ ] Visit http://localhost:8000/test-non-existent-page
# Should NOT show Django debug page
```

### ✅ Network Security

```powershell
# Verify services are on correct network
- [ ] docker network inspect poolcrest_network

# Test database is not accessible from outside (optional)
- [ ] Try connecting to localhost:5432 from external tool
# Should fail if you want it isolated
```

## 📊 Monitoring Setup

### ✅ Log Monitoring

```powershell
# Set up log rotation in docker-compose.yml
- [ ] Verify logging configuration is present

# Example in docker-compose.yml:
# logging:
#   driver: "json-file"
#   options:
#     max-size: "10m"
#     max-file: "3"
```

### ✅ Health Monitoring

```powershell
# Verify health checks are working
- [ ] docker inspect poolcrest-be --format='{{.State.Health.Status}}'
- [ ] docker inspect poolcrest-fe --format='{{.State.Health.Status}}'
# Both should output: healthy
```

## 💾 Backup Setup

### ✅ Database Backup

```powershell
# Create backup directory
- [ ] mkdir -p backups

# Manual backup
- [ ] docker-compose exec poolcrest_db pg_dump -U postgres poolcrest_db > backups/backup_$(Get-Date -Format yyyyMMdd_HHmmss).sql

# Schedule regular backups (Windows Task Scheduler or cron)
- [ ] Set up automated backup script
```

### ✅ Volume Backup

```powershell
# Backup media files
- [ ] docker run --rm -v poolcrest_be_media:/data -v ${PWD}/backups:/backup alpine tar czf /backup/media-backup.tar.gz /data

# Backup static files
- [ ] docker run --rm -v poolcrest_be_staticfiles:/data -v ${PWD}/backups:/backup alpine tar czf /backup/static-backup.tar.gz /data
```

### ✅ Backup Verification

```powershell
# Verify backup files exist
- [ ] ls backups/

# Test restore process (on test instance)
- [ ] docker-compose -f docker-compose.test.yml exec -T poolcrest_db psql -U postgres poolcrest_db < backups/backup_YYYYMMDD_HHMMSS.sql
```

## 🌐 Production Deployment (Additional)

### ✅ Domain Setup

- [ ] DNS records configured
- [ ] A record points to server IP
- [ ] CNAME for www subdomain (optional)
- [ ] Wait for DNS propagation (can take 24-48 hours)

### ✅ SSL/TLS Setup

- [ ] Install Certbot or use cloud provider SSL
- [ ] Generate SSL certificate
- [ ] Configure reverse proxy (Nginx/Traefik)
- [ ] Update ALLOWED_HOSTS in backend .env
- [ ] Update CORS_ALLOWED_ORIGINS in backend .env
- [ ] Test HTTPS connection
- [ ] Set up automatic certificate renewal

### ✅ Firewall Configuration

```powershell
# Open required ports
- [ ] Port 80 (HTTP) - for SSL certificate validation
- [ ] Port 443 (HTTPS) - for secure traffic
- [ ] Block direct access to 8000, 5432, 6379 from outside
```

### ✅ Reverse Proxy Setup

```nginx
# Example Nginx configuration
- [ ] Create /etc/nginx/sites-available/poolcrest
- [ ] Link to sites-enabled
- [ ] Test nginx configuration: nginx -t
- [ ] Reload nginx: systemctl reload nginx
```

### ✅ Environment Variables (Production)

```powershell
# Update backend .env for production
- [ ] SECRET_KEY (new random value)
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
- [ ] SECURE_SSL_REDIRECT=True
- [ ] SESSION_COOKIE_SECURE=True
- [ ] CSRF_COOKIE_SECURE=True
- [ ] Strong database password
- [ ] Redis password (if using)
```

## 📈 Post-Deployment

### ✅ Monitoring

```powershell
# Set up monitoring tools
- [ ] Application monitoring (Sentry, New Relic, etc.)
- [ ] Infrastructure monitoring (Prometheus, Grafana, etc.)
- [ ] Uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Log aggregation (ELK, Loki, etc.)
```

### ✅ Alerts

```powershell
# Configure alerts for:
- [ ] Container restarts
- [ ] High CPU/Memory usage
- [ ] Disk space low
- [ ] Database connection failures
- [ ] Application errors (500 errors)
```

### ✅ Documentation

```powershell
# Document the deployment
- [ ] Server IP addresses
- [ ] Domain names
- [ ] Access credentials (in secure location)
- [ ] SSL certificate details
- [ ] Backup procedures
- [ ] Recovery procedures
- [ ] Contact information
```

## 🔄 Maintenance Tasks

### ✅ Daily

```powershell
- [ ] Check container status: docker-compose ps
- [ ] Review logs for errors: docker-compose logs --since 24h
- [ ] Monitor disk space: df -h
- [ ] Check backup completion
```

### ✅ Weekly

```powershell
- [ ] Review application metrics
- [ ] Check for Docker updates
- [ ] Review security logs
- [ ] Test backup restoration
```

### ✅ Monthly

```powershell
- [ ] Update Docker base images: docker-compose build --pull --no-cache
- [ ] Update application dependencies
- [ ] Review and rotate logs
- [ ] Security audit
- [ ] Performance review
```

## 🆘 Emergency Procedures

### ✅ Rollback Plan

```powershell
# If deployment fails:
1. - [ ] Stop new containers: docker-compose down
2. - [ ] Restore previous images: docker-compose up -d [previous_image_tag]
3. - [ ] Restore database backup if needed
4. - [ ] Verify service restoration
5. - [ ] Document issue for post-mortem
```

### ✅ Disaster Recovery

```powershell
# Complete recovery procedure:
1. - [ ] Restore Docker images from registry
2. - [ ] Restore database from backup
3. - [ ] Restore volumes from backup
4. - [ ] Verify .env files
5. - [ ] Start services: docker-compose up -d
6. - [ ] Run migrations if needed
7. - [ ] Verify all services are healthy
8. - [ ] Test critical functionality
```

## ✅ Final Sign-Off

### Deployment Complete

- [ ] All services running (docker-compose ps)
- [ ] All health checks passing
- [ ] Frontend accessible and functional
- [ ] Backend API responding
- [ ] Database connected and migrated
- [ ] Authentication working
- [ ] File uploads working (if applicable)
- [ ] WebSockets working (if applicable)
- [ ] SSL/TLS configured (production)
- [ ] Backups configured and tested
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified of deployment

### Performance Metrics

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] No error logs on startup
- [ ] Memory usage within limits
- [ ] CPU usage within limits
- [ ] Disk space sufficient

### Security Verification

- [ ] All security checks passed
- [ ] No vulnerabilities found in scans
- [ ] Security headers present
- [ ] Non-root execution verified
- [ ] Secrets not exposed in logs/images
- [ ] Access controls configured

---

## 📝 Notes

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  
**Environment:** [ ] Development  [ ] Staging  [ ] Production

**Issues Encountered:**
- 
- 
- 

**Resolutions:**
- 
- 
- 

**Next Steps:**
- 
- 
- 

---

**Checklist Status:** [ ] Complete  [ ] In Progress  [ ] Blocked

**Approved By:** _______________  
**Date:** _______________

🎉 **Congratulations on your successful deployment!**
