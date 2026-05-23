#!/bin/bash
# ==============================================================================
# Poolcrest Backend - Docker Entrypoint Script
# ==============================================================================
# This script handles initialization, health checks, and graceful startup
# of the Django application in production and development environments.
# ==============================================================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==============================================================================
# Environment Variables Validation
# ==============================================================================
log_info "Starting Poolcrest Backend..."
log_info "Validating environment variables..."

# Check critical environment variables
if [ -z "$SECRET_KEY" ]; then
    log_warning "SECRET_KEY not set. Using default (NOT RECOMMENDED for production)"
fi

if [ -z "$DOCKER_DB_HOST" ] && [ -z "$SUPABASE_DB_HOST" ]; then
    log_error "No database host configured. Set DOCKER_DB_HOST or SUPABASE_DB_HOST"
    exit 1
fi

log_success "Environment variables validated"

# ==============================================================================
# Database Connection Wait
# ==============================================================================
log_info "Waiting for database connection..."

# Debug: Print environment variables (safely)
log_info "Environment check:"
log_info "  DOCKER_DB_HOST=${DOCKER_DB_HOST:-<not set>}"
log_info "  DOCKER_DB_PORT=${DOCKER_DB_PORT:-<not set>}"
log_info "  SUPABASE_DB_HOST=${SUPABASE_DB_HOST:-<not set>}"

# Determine which database to use
if [ -n "$DOCKER_DB_HOST" ]; then
    DB_HOST="${DOCKER_DB_HOST}"
    DB_PORT="${DOCKER_DB_PORT:-5432}"
    log_info "Using Docker PostgreSQL: ${DB_HOST}:${DB_PORT}"
elif [ -n "$SUPABASE_DB_HOST" ]; then
    DB_HOST="${SUPABASE_DB_HOST}"
    DB_PORT="${SUPABASE_DB_PORT:-5432}"
    log_info "Using Supabase PostgreSQL: ${DB_HOST}:${DB_PORT}"
else
    log_error "No database host configured!"
    log_error "Please set either DOCKER_DB_HOST or SUPABASE_DB_HOST"
    log_error "Current environment variables:"
    env | grep -i db | grep -v PASSWORD | grep -v PSWD || log_error "  No DB variables found"
    exit 1
fi

# Wait for database with timeout
TIMEOUT=60
ELAPSED=0
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null || [ $ELAPSED -eq $TIMEOUT ]; do
    log_info "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}... (${ELAPSED}s/${TIMEOUT}s)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -eq $TIMEOUT ]; then
    log_error "Database connection timeout after ${TIMEOUT} seconds"
    exit 1
fi

log_success "Database is available at ${DB_HOST}:${DB_PORT}"

# ==============================================================================
# Redis Connection Check (Optional)
# ==============================================================================
if [ -n "$REDIS_HOST" ]; then
    log_info "Checking Redis connection..."
    REDIS_PORT="${REDIS_PORT:-6379}"
    
    if nc -z "$REDIS_HOST" "$REDIS_PORT" 2>/dev/null; then
        log_success "Redis is available at ${REDIS_HOST}:${REDIS_PORT}"
    else
        log_warning "Redis not available at ${REDIS_HOST}:${REDIS_PORT}. Continuing without Redis..."
    fi
fi

# ==============================================================================
# Database Migrations
# ==============================================================================
log_info "Running database migrations..."

# Check if migrations are needed
if python manage.py showmigrations --plan | grep -q "\[ \]"; then
    log_info "Pending migrations detected. Applying migrations..."
    python manage.py migrate --noinput
    log_success "Migrations applied successfully"
else
    log_info "No pending migrations"
fi

# ==============================================================================
# Static Files Collection (Production)
# ==============================================================================
if [ "$APP_ENV" = "production" ] || [ "$COLLECT_STATIC" = "true" ]; then
    log_info "Collecting static files..."
    
    # Ensure staticfiles directory exists
    mkdir -p /app/staticfiles
    
    # Fix permissions if needed (in case of volume mount issues)
    if [ -w /app/staticfiles ]; then
        # We have write permission, try to clean old files
        if [ "$(ls -A /app/staticfiles 2>/dev/null)" ]; then
            log_info "Cleaning old static files..."
            find /app/staticfiles -mindepth 1 -delete 2>/dev/null || {
                log_warning "Could not clean all static files, they may be owned by root"
                log_info "This is normal on first run with volume mounts"
            }
        fi
    else
        log_warning "/app/staticfiles is not writable by current user"
    fi
    
    # Collect static files
    python manage.py collectstatic --noinput 2>&1 || {
        log_warning "Static files collection had some issues (may be non-critical)"
        log_info "Continuing with startup..."
    }
    log_success "Static files collection completed"
else
    log_info "Skipping static files collection (not in production mode)"
fi

# ==============================================================================
# Create Superuser (Development Only)
# ==============================================================================
if [ "$APP_ENV" = "development" ] && [ "$CREATE_SUPERUSER" = "true" ]; then
    log_info "Creating superuser (development mode)..."
    python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@poolcrest.com', 'admin')
    print('Superuser created: username=admin, password=admin')
else:
    print('Superuser already exists')
EOF
fi

# ==============================================================================
# Health Check
# ==============================================================================
log_info "Running Django system checks..."
if python manage.py check --deploy 2>/dev/null; then
    log_success "Django system checks passed"
else
    log_warning "Django system checks had warnings (non-critical)"
fi

# ==============================================================================
# Application Startup
# ==============================================================================
log_success "Initialization complete. Starting application..."

# Determine which command to run
CMD="${1:-gunicorn}"

case "$CMD" in
    
    daphne)
        log_info "Starting Daphne ASGI server (for WebSockets)..."
        exec daphne \
            --bind 0.0.0.0 \
            --port 8000 \
            --proxy-headers \
            --access-log ${ACCESS_LOG:-/app/logs/access.log} \
            --verbosity ${DAPHNE_VERBOSITY:-1} \
            core.asgi:application
        ;;
    
    runserver)
        log_info "Starting Django development server..."
        log_warning "This is NOT recommended for production!"
        exec python manage.py runserver 0.0.0.0:8000
        ;;
    
    celery)
        log_info "Starting Celery worker..."
        exec celery -A core worker \
            --loglevel=${CELERY_LOG_LEVEL:-info} \
            --concurrency=${CELERY_CONCURRENCY:-4}
        ;;
    
    celery-beat)
        log_info "Starting Celery beat scheduler..."
        exec celery -A core beat \
            --loglevel=${CELERY_LOG_LEVEL:-info} \
            --scheduler django_celery_beat.schedulers:DatabaseScheduler
        ;;
    
    shell)
        log_info "Starting Django shell..."
        exec python manage.py shell
        ;;
    
    bash)
        log_info "Starting bash shell..."
        exec /bin/bash
        ;;
    
    *)
        log_info "Executing custom command: $@"
        exec "$@"
        ;;
esac
