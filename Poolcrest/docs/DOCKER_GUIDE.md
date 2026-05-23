# Poolcrest Docker Deployment Guide

## 🎯 Overview

This guide explains the production-ready Docker setup for the Poolcrest application, created by a master software engineer with extensive experience in cybersecurity and DevOps.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Backend Dockerfile](#backend-dockerfile)
- [Frontend Dockerfile](#frontend-dockerfile)
- [Security Features](#security-features)
- [Environment Variables](#environment-variables)
- [Building Images](#building-images)
- [Running Containers](#running-containers)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

### Multi-Stage Build Process

Both Dockerfiles use multi-stage builds for:
- **Smaller image sizes**: Only production dependencies are included
- **Faster builds**: Better layer caching
- **Enhanced security**: Build tools are not present in final image
- **Separation of concerns**: Build stage vs runtime stage

### Technology Stack

**Backend:**
- Python 3.11 (slim-bookworm)
- Django 4.2+ with REST Framework
- Gunicorn WSGI server
- Daphne ASGI server (for WebSockets)
- PostgreSQL client
- Redis support

**Frontend:**
- Node.js 20 (Alpine)
- React 18+ with Vite
- Nginx 1.25 (Alpine) as reverse proxy
- Optimized static asset serving

## ✅ Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available for Docker
- Basic understanding of Docker concepts

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository (if not already)
cd e:\Projects\Poolcrest

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Manual Build and Run

```bash
# Backend
cd be
docker build -t poolcrest-be:latest .
docker run -d -p 8000:8000 --name poolcrest-be poolcrest-be:latest

# Frontend
cd ../fe
docker build -t poolcrest-fe:latest .
docker run -d -p 4028:4028 --name poolcrest-fe poolcrest-fe:latest
```

## 🔧 Backend Dockerfile

### Features

1. **Multi-stage build** (4 stages):
   - `base`: Base Python image with system dependencies
   - `dependencies`: Python packages installation
   - `production`: Final production image
   - `development`: Development variant (optional)

2. **Security Hardening**:
   - Non-root user (`poolcrest:poolcrest`, UID/GID 1000)
   - Minimal base image (Debian Bookworm slim)
   - No cache files or build artifacts
   - Proper file permissions

3. **Optimization**:
   - Layer caching for dependencies
   - Cleaned package lists
   - Removed Python cache files
   - Environment variable optimization

4. **Production Ready**:
   - Health checks for container orchestration
   - ASGI support for WebSockets
   - Entrypoint script for initialization
   - Graceful shutdown handling

### Directory Structure

```
/app/
├── apps/               # Django applications
├── core/               # Django project settings
├── config/             # Custom configurations
├── logs/              # Application logs
│   ├── daily/
│   ├── errors/
│   └── security/
├── media/             # User uploads
├── static/            # Static files (source)
├── staticfiles/       # Collected static files
├── manage.py
└── docker-entrypoint.sh
```

### Build Arguments

None required, but can be customized:

```dockerfile
# Example: Use different Python version
FROM python:3.12-slim-bookworm AS base
```

### Environment Variables

See [Environment Variables](#environment-variables) section below.

## 🎨 Frontend Dockerfile

### Features

1. **Multi-stage build** (3 stages):
   - `builder`: Node.js build environment
   - `production`: Nginx with built assets
   - `development`: Vite dev server (optional)

2. **Nginx Configuration**:
   - Reverse proxy to Django backend
   - WebSocket support for Django Channels
   - Security headers (CSP, X-Frame-Options, etc.)
   - Gzip compression
   - Static asset caching
   - Rate limiting
   - SPA routing support

3. **Security Headers**:
   - Content Security Policy (CSP)
   - X-Frame-Options: SAMEORIGIN
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection
   - Referrer-Policy
   - Permissions-Policy

4. **Performance**:
   - Asset caching (1 year for static assets)
   - Gzip compression
   - Connection keep-alive
   - Buffer optimization

### Nginx Routes

- `/` - React SPA (serves index.html)
- `/api/*` - Proxies to Django backend (rate limited)
- `/ws/*` - WebSocket proxy to Django Channels
- `/static/*` - Django static files
- `/media/*` - Django media files
- `/health` - Health check endpoint

### Build Arguments

```dockerfile
ARG VITE_API_BASE_URL=/api
ARG NODE_ENV=production
```

### Build with Custom API URL

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.yourdomain.com/api \
  -t poolcrest-fe:latest \
  ./fe
```

## 🔒 Security Features

### Backend Security

1. **Non-root Execution**: Runs as `poolcrest` user (UID 1000)
2. **Minimal Attack Surface**: Only necessary packages installed
3. **No Secrets in Image**: All secrets via environment variables
4. **Security Updates**: Base image is updated during build
5. **Read-only Filesystem**: Can be configured in docker-compose
6. **Resource Limits**: CPU and memory limits in docker-compose

### Frontend Security

1. **Non-root Execution**: Nginx runs as `poolcrest` user
2. **Security Headers**: Comprehensive HTTP security headers
3. **Rate Limiting**: Protection against abuse
4. **CSP Policy**: Prevents XSS attacks
5. **HTTPS Ready**: Can be placed behind SSL termination proxy
6. **No Source Maps**: Production builds exclude source maps

### Additional Hardening (Optional)

```yaml
# docker-compose.yml additions
services:
  poolcrest-be:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /app/logs
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

## 🌍 Environment Variables

### Backend (.env file in be/)

```env
# Django Core
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=False
APP_ENV=production
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,localhost

# Database - Docker PostgreSQL
DOCKER_DB_HOST=poolcrest_db
DOCKER_DB_PORT=5432
DOCKER_DB_NAME=poolcrest_db
DOCKER_DB_USER=postgres
DOCKER_DB_PASSWORD=postgres

# Or Supabase PostgreSQL
# SUPABASE_DB_HOST=your-project.supabase.co
# SUPABASE_DB_PORT=5432
# SUPABASE_DB_NAME=postgres
# SUPABASE_DB_USER=postgres
# SUPABASE_DB_PASSWORD=your-password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:4028,https://yourdomain.com

# Static/Media
STATIC_URL=/static/
MEDIA_URL=/media/

# Security
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False

# Production should set:
# SECURE_SSL_REDIRECT=True
# SESSION_COOKIE_SECURE=True
# CSRF_COOKIE_SECURE=True
```

### Frontend (.env file in fe/)

```env
# API Configuration
VITE_API_BASE_URL=/api

# For production with different domain:
# VITE_API_BASE_URL=https://api.yourdomain.com/api

# Environment
NODE_ENV=production
```

## 🔨 Building Images

### Development Builds

```bash
# Backend
docker build -t poolcrest-be:dev --target development ./be

# Frontend (uses Vite dev server)
docker build -t poolcrest-fe:dev --target development ./fe
```

### Production Builds

```bash
# Backend
docker build -t poolcrest-be:latest --target production ./be

# Frontend
docker build -t poolcrest-fe:latest --target production ./fe
```

### Multi-platform Builds (for ARM/AMD)

```bash
# Create builder
docker buildx create --name mybuilder --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t yourdockerhub/poolcrest-be:latest \
  --push \
  ./be

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t yourdockerhub/poolcrest-fe:latest \
  --push \
  ./fe
```

## 🏃 Running Containers

### Using Docker Compose (Production)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f poolcrest-be
docker-compose logs -f poolcrest-fe

# Restart specific service
docker-compose restart poolcrest-be

# Execute commands in container
docker-compose exec poolcrest-be python manage.py migrate
docker-compose exec poolcrest-be python manage.py createsuperuser
docker-compose exec poolcrest-be python manage.py collectstatic --noinput

# Stop all services
docker-compose down
```

### Manual Container Management

```bash
# Run backend
docker run -d \
  --name poolcrest-be \
  -p 8000:8000 \
  --env-file ./be/.env \
  -v poolcrest_media:/app/media \
  -v poolcrest_static:/app/staticfiles \
  poolcrest-be:latest

# Run frontend
docker run -d \
  --name poolcrest-fe \
  -p 4028:4028 \
  --link poolcrest-be:backend \
  poolcrest-fe:latest

# View logs
docker logs -f poolcrest-be
docker logs -f poolcrest-fe

# Execute commands
docker exec poolcrest-be python manage.py migrate
docker exec -it poolcrest-be bash

# Stop containers
docker stop poolcrest-be poolcrest-fe
docker rm poolcrest-be poolcrest-fe
```

## 🚀 Production Deployment

### 1. Prepare Environment Files

```bash
# Backend
cp be/.env.example be/.env
# Edit be/.env with production values

# Frontend
cp fe/.env.example fe/.env
# Edit fe/.env with production values
```

### 2. Build Images

```bash
docker-compose build --no-cache
```

### 3. Initialize Database

```bash
# Start database first
docker-compose up -d poolcrest_db redis

# Wait for database
sleep 10

# Run migrations
docker-compose run --rm poolcrest-be python manage.py migrate

# Create superuser
docker-compose run --rm poolcrest-be python manage.py createsuperuser

# Collect static files
docker-compose run --rm poolcrest-be python manage.py collectstatic --noinput
```

### 4. Start All Services

```bash
docker-compose up -d
```

### 5. Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Check backend health
curl http://localhost:8000/api/health/

# Check frontend health
curl http://localhost:4028/health

# View logs
docker-compose logs -f
```

### 6. SSL/TLS Setup (Nginx Reverse Proxy)

For production, place behind Nginx or Traefik with SSL:

```nginx
# /etc/nginx/sites-available/poolcrest
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4028;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐛 Troubleshooting

### Backend Issues

#### Container won't start

```bash
# Check logs
docker-compose logs poolcrest-be

# Common issues:
# 1. Database not ready - wait longer
# 2. Missing environment variables - check .env
# 3. Port already in use - check with: netstat -ano | findstr :8000
```

#### Database connection failed

```bash
# Verify database is running
docker-compose ps poolcrest_db

# Check network connectivity
docker-compose exec poolcrest-be nc -zv poolcrest_db 5432

# Verify environment variables
docker-compose exec poolcrest-be env | grep DB
```

#### Static files not found

```bash
# Collect static files
docker-compose exec poolcrest-be python manage.py collectstatic --noinput

# Verify volume
docker volume inspect poolcrest_be_staticfiles
```

### Frontend Issues

#### Build fails

```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache poolcrest-fe

# Check build logs
docker-compose logs poolcrest-fe
```

#### Can't connect to backend

```bash
# Check backend is running
docker-compose ps poolcrest-be

# Check nginx configuration
docker-compose exec poolcrest-fe cat /etc/nginx/conf.d/default.conf

# Test backend connection from frontend container
docker-compose exec poolcrest-fe curl http://poolcrest-be:8000/api/health/
```

#### 502 Bad Gateway

```bash
# Backend might be down
docker-compose restart poolcrest-be

# Check nginx logs
docker-compose logs poolcrest-fe

# Check backend logs
docker-compose logs poolcrest-be
```

### General Issues

#### Permission denied errors

```bash
# Fix ownership
docker-compose exec -u root poolcrest-be chown -R poolcrest:poolcrest /app/logs /app/media

# Restart container
docker-compose restart poolcrest-be
```

#### Out of disk space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (careful!)
docker system prune -a --volumes
```

#### Rebuild everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker rmi poolcrest-be poolcrest-fe

# Rebuild and start
docker-compose up -d --build
```

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Backend
curl http://localhost:8000/api/health/

# Frontend
curl http://localhost:4028/health

# Docker health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Logs Management

```bash
# View logs
docker-compose logs -f --tail=100

# Save logs to file
docker-compose logs > logs.txt

# Rotate logs (configure in docker-compose.yml)
services:
  poolcrest-be:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Backup

```bash
# Backup database
docker-compose exec poolcrest_db pg_dump -U postgres poolcrest_db > backup.sql

# Backup volumes
docker run --rm \
  -v poolcrest_be_media:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/media-backup.tar.gz /data

# Restore database
docker-compose exec -T poolcrest_db psql -U postgres poolcrest_db < backup.sql
```

### Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild with latest base images
docker-compose build --pull --no-cache

# Restart services
docker-compose up -d --force-recreate
```

## 📚 Additional Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Docker logs: `docker-compose logs`
3. Check existing documentation in the `docs/` folder
4. Contact the development team

---

**Built with ❤️ by a Master Software Engineer**  
*Production-ready, secure, and optimized for performance*
