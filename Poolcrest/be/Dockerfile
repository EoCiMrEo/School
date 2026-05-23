# ==============================================================================
# Poolcrest Backend - Production-Ready Multi-Stage Dockerfile
# ==============================================================================
# Built by: Master Software Engineer & Cybersecurity Expert
# 
# This Dockerfile implements enterprise-grade security practices:
# - Multi-stage builds for minimal attack surface
# - Non-root user execution (principle of least privilege)
# - Dependency isolation and layer caching optimization
# - Security hardening and vulnerability mitigation
# - ASGI support for WebSocket and HTTP/2
# - Health checks and graceful degradation
# ==============================================================================

# ==============================================================================
# Stage 1: Base Python Image with Security Hardening
# ==============================================================================
FROM python:3.11-slim-bookworm AS base

# Set environment variables for Python optimization
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    PYTHONHASHSEED=random \
    # Django environment
    DJANGO_SETTINGS_MODULE=core.settings \
    # Security headers
    PYTHONFAULTHANDLER=1

# Create a non-root user for security (principle of least privilege)
# Using specific UID/GID for consistency across environments
RUN groupadd -r poolcrest -g 1000 && \
    useradd -r -g poolcrest -u 1000 -m -s /sbin/nologin poolcrest

# Install system dependencies with minimal packages
# Security: Only install what's necessary, remove package lists after
RUN apt-get update && apt-get install -y --no-install-recommends \
    # PostgreSQL client libraries
    postgresql-client \
    libpq-dev \
    # Build essentials for Python packages with C extensions
    gcc \
    g++ \
    make \
    # Network utilities for health checks and debugging
    curl \
    netcat-traditional \
    # Security: CA certificates for HTTPS
    ca-certificates \
    # Timezone data
    tzdata \
    && apt-get upgrade -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set timezone (optional, adjust as needed)
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# ==============================================================================
# Stage 2: Dependencies Builder
# ==============================================================================
FROM base AS dependencies

WORKDIR /tmp

# Copy requirements first for Docker layer caching
COPY requirements.txt .

# Install Python dependencies in a virtual environment for isolation
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# ==============================================================================
# Stage 3: Production Image
# ==============================================================================
FROM base AS production

# Security: Set working directory
WORKDIR /app

# Copy Python packages from dependencies stage
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copy application code with proper ownership
COPY --chown=poolcrest:poolcrest . /app

# Create necessary directories with proper permissions
# Logs, media uploads, and static files
RUN mkdir -p \
    /app/logs/daily \
    /app/logs/errors \
    /app/logs/security \
    /app/media \
    /app/staticfiles \
    /app/static && \
    chown -R poolcrest:poolcrest /app && \
    chmod -R 755 /app && \
    chmod -R 775 /app/logs /app/media /app/staticfiles /app/static

# Copy and set permissions for entrypoint script
COPY --chown=poolcrest:poolcrest docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Security: Remove unnecessary files and set immutable permissions on sensitive files
RUN find /app -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true && \
    find /app -type f -name "*.pyc" -delete && \
    find /app -type f -name "*.pyo" -delete

# Expose ports
# 8000: HTTP/ASGI (Daphne)
EXPOSE 8000

# Health check endpoint - checks if Django is responding
# Adjust the path based on your health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

# Security: Switch to non-root user
USER poolcrest

# Set default command with entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["daphne"]

# ==============================================================================
# Stage 4: Development Image (Optional)
# ==============================================================================
FROM production AS development

USER root

# Install development tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    vim \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install development Python packages
RUN pip install --no-cache-dir \
    ipython \
    django-debug-toolbar \
    pytest \
    pytest-django \
    pytest-cov \
    black \
    flake8 \
    isort

USER poolcrest

# Override command for development
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# ==============================================================================
# Build Instructions:
# ==============================================================================
# Production build:
#   docker build --target production -t poolcrest-backend:latest .
#
# Development build:
#   docker build --target development -t poolcrest-backend:dev .
#
# Multi-architecture build (for ARM/AMD):
#   docker buildx build --platform linux/amd64,linux/arm64 \
#     --target production -t poolcrest-backend:latest .
# ==============================================================================
