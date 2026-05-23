# ==============================================================================
# Poolcrest Frontend - Production-Ready Multi-Stage Dockerfile
# ==============================================================================
# Built by: Master Software Engineer & Cybersecurity Expert
# 
# This Dockerfile implements enterprise-grade security practices:
# - Multi-stage builds for optimal image size (development artifacts excluded)
# - Non-root user execution (principle of least privilege)
# - Layer caching optimization for faster builds
# - Nginx with security headers and performance tuning
# - Health checks and monitoring
# - Static asset optimization
# ==============================================================================

# ==============================================================================
# Stage 1: Build Environment
# ==============================================================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
# Copy package files separately for dependency caching
COPY package.json package-lock.json* ./

# Install dependencies with clean install for reproducible builds
# --legacy-peer-deps flag for compatibility with some packages
RUN npm ci --silent --legacy-peer-deps || npm install --silent --legacy-peer-deps

# Copy application source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ARG NODE_ENV=production

# Set environment variables for build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-/api}
ENV NODE_ENV=${NODE_ENV}

# Build the application
# Vite will output to /app/build directory (as configured in vite.config.mjs)
RUN npm run build

# List build output for verification (optional, for debugging)
RUN echo "Build completed. Contents of build directory:" && ls -lah /app/build || ls -lah /app/dist

# ==============================================================================
# Stage 2: Production Image with Nginx
# ==============================================================================
FROM nginx:1.25-alpine AS production

# Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Set timezone (optional, adjust as needed)
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create non-root user for Nginx
RUN addgroup -g 1000 -S poolcrest && \
    adduser -u 1000 -S poolcrest -G poolcrest

# Copy built assets from builder stage
COPY --from=builder --chown=poolcrest:poolcrest /app/build /usr/share/nginx/html

# Create custom Nginx configuration with security headers and SPA routing
RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
# Poolcrest Frontend - Nginx Configuration
# Optimized for React SPA with security headers and performance tuning

upstream backend {
    server poolcrest-be:8000;
    keepalive 32;
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;

server {
    listen 4028;
    server_name _;
    
    # Root directory for static files
    root /usr/share/nginx/html;
    index index.html;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Content Security Policy (adjust based on your needs)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.rocket.new; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:8000 ws://localhost:8000 https://application.rocket.new; frame-ancestors 'self';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json application/xml image/svg+xml;
    gzip_disable "msie6";
    
    # Client body size limit (adjust as needed)
    client_max_body_size 10M;
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log warn;
    
    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API proxy to Django backend
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # Connection reuse
        proxy_set_header Connection "";
    }
    
    # WebSocket proxy to Django Channels
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # WebSocket specific headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeouts (longer for persistent connections)
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
    
    # Static files served by Django (media, admin static)
    location /static/ {
        proxy_pass http://backend/static/;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /media/ {
        proxy_pass http://backend/media/;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # React Router - SPA fallback
    # All other requests serve index.html for client-side routing
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        try_files $uri $uri/ /index.html;
        
        # Cache control for HTML files (no cache)
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Deny access to backup files
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Configure Nginx to run as non-root
RUN sed -i 's/user  nginx;/user  poolcrest;/' /etc/nginx/nginx.conf && \
    # Create necessary directories with proper permissions
    mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R poolcrest:poolcrest /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    # Update nginx.conf to use /var/run/nginx.pid
    sed -i 's|/run/nginx.pid|/var/run/nginx.pid|' /etc/nginx/nginx.conf && \
    # Test nginx configuration
    nginx -t

# Expose port
EXPOSE 4028

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:4028/health || exit 1

# Switch to non-root user
USER poolcrest

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

# ==============================================================================
# Stage 3: Development Image (Optional)
# ==============================================================================
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --silent --legacy-peer-deps

# Copy application code
COPY . .

# Expose Vite dev server port
EXPOSE 4028

# Set environment to development
ENV NODE_ENV=development

# Start Vite dev server
CMD ["npm", "run", "dev"]
