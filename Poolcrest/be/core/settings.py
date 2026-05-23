"""
Django settings for Poolcrest LLC backend.
Production-ready configuration with comprehensive logging and database fallback.
"""

# Set up output capturing FIRST before anything else
try:
    from config.capture_output import setup_tee_output
    setup_tee_output()
except Exception:
    pass  # Continue without output capturing if it fails

from pathlib import Path
import os
import sys
from datetime import timedelta
from django.core.management.utils import get_random_secret_key
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
# Base directory is set
# Load environment variables
load_dotenv(BASE_DIR / '.env')

# Import our custom configurations
try:
    sys.path.append(str(BASE_DIR / 'config'))
    from config.database import get_database_configs, check_database_health
    from config.logging import setup_logging, log_startup
    CONFIG_IMPORTS_SUCCESS = True
except ImportError as e:
    import sys
    sys.stderr.write(f"Warning: Could not import custom configurations: {e}\n")
    CONFIG_IMPORTS_SUCCESS = False

# =============================================================================
# Core Django Settings
# =============================================================================

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', get_random_secret_key())

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Environment detection
APP_ENV = os.getenv('APP_ENV', 'development')
IS_PRODUCTION = APP_ENV == 'production'
IS_DEVELOPMENT = APP_ENV == 'development'
IS_STAGING = APP_ENV == 'staging'

# Allowed hosts
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
if DEBUG:
    ALLOWED_HOSTS.extend(['localhost', '127.0.0.1', '0.0.0.0'])

# =============================================================================
# Application Definition
# =============================================================================

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # For logout functionality
    'corsheaders',
    'django_filters',
    'drf_yasg',
    'channels',
]

# =============================================================================
# Middleware Configuration
# =============================================================================

LOCAL_APPS = [
    'apps.users',          # User management and authentication
    'apps.core',           # Core business logic
    'apps.properties',     # Property management  
    'apps.services',       # Service catalog
    'apps.appointments',   # Appointment scheduling
    'apps.quotes',         # Quote management
    'apps.payments',       # Payments and billing API
    'apps.promotions',     # Promotions API
    # 'apps.payments',       # Payment processing
    # 'apps.notifications',  # Notification system
    # 'apps.analytics',      # Analytics and reporting
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files in production
    'corsheaders.middleware.CorsMiddleware',       # CORS handling
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.core.middleware.security.SecureJWTCookieMiddleware',  # Extract JWT from cookies
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.security.SecurityHeadersMiddleware',  # Add security headers
    'apps.core.middleware.security.RateLimitSecurityMiddleware',  # Additional security checks
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

# =============================================================================
# Database Configuration (with fallback logic)
# =============================================================================
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }
if CONFIG_IMPORTS_SUCCESS:
    try:
        DATABASES = get_database_configs()
        log_startup()  # Log successful startup
    except Exception as e:
        import sys
        sys.stderr.write(f"❌ Database configuration failed: {e}\n")
        if IS_PRODUCTION:
            raise  # Fail fast in production
        else:
            # Fallback to SQLite in development if needed
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': BASE_DIR / 'db.sqlite3',
                }
            }
            sys.stderr.write("⚠️ Using SQLite fallback database\n")
else:
    # Use SQLite if config imports failed
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
    import sys
    sys.stderr.write("⚠️ Using SQLite database (config imports failed)\n")

# Database connection pooling (for PostgreSQL)
if DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
    # Connection pooling settings
    DATABASES['default'].setdefault('OPTIONS', {}).update({
        'connect_timeout': 10,
    })

# =============================================================================
# Redis and Caching Configuration
# =============================================================================

# Import Redis configuration
try:
    from config.redis_config import get_redis_config, get_fallback_cache_config, get_celery_config
    REDIS_CONFIG_IMPORTED = True
except ImportError as e:
    REDIS_CONFIG_IMPORTED = False
    print(f"❌ Could not import redis_config: {e}")

# Initialize with safe defaults
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Default session configuration (database sessions - always works)
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_COOKIE_SECURE = IS_PRODUCTION  # HTTPS only in production
SESSION_COOKIE_HTTPONLY = True  # Prevent XSS attacks
SESSION_COOKIE_NAME = 'poolcrest_sessionid'

"""
Redis configuration (safe by default)

Goal: Never crash the app if Redis settings are missing/invalid. We only
enable Redis when USE_REDIS=true and the constructed URL is valid and reachable.
"""

# Try to configure Redis if available and explicitly enabled
REDIS_CONFIGURED = False
USE_REDIS = os.getenv('USE_REDIS', 'False').lower() == 'true'

if REDIS_CONFIG_IMPORTED and USE_REDIS:
    try:
        import redis

        # Build the exact URL we intend to use everywhere (mirrors redis_config)
        _host = os.getenv('REDIS_HOST', 'localhost') or 'localhost'
        _port = int(os.getenv('REDIS_PORT', 6379) or 6379)
        _db = int(os.getenv('REDIS_DB', 0) or 0)
        _pwd = os.getenv('REDIS_PASSWORD', '') or ''

        if _pwd:
            _url = f"redis://:{_pwd}@{_host}:{_port}/{_db}"
        else:
            _url = f"redis://{_host}:{_port}/{_db}"

        # Validate URL format and connectivity using the same method the
        # backend will use (from_url). This also catches ValueError from
        # invalid URLs like an empty string or bad scheme.
        test_client = redis.from_url(
            _url,
            socket_connect_timeout=1,
            socket_timeout=1,
        )
        test_client.ping()
        test_client.close()

        # If we got here, URL is valid and Redis is reachable
        CACHES = get_redis_config()

        # IMPORTANT: Only switch to cache sessions if Redis is truly available
        # and the 'session' cache backend exists
        if 'session' in CACHES:
            SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
            SESSION_CACHE_ALIAS = 'session'
            REDIS_CONFIGURED = True

            if DEBUG:
                print("✅ Redis configured successfully")
                print("   - Using Redis for caching")
                print("   - Using Redis for sessions")
        else:
            if DEBUG:
                print("⚠️ Redis connected but session cache not configured")
                print("   - Using Redis for caching")
                print("   - Using database for sessions")

    except Exception as e:  # Catch ValueError from bad URL and connection errors
        # Any error -> fall back safely to local memory + DB sessions
        CACHES = get_fallback_cache_config() if REDIS_CONFIG_IMPORTED else CACHES
        if DEBUG:
            print(f"⚠️ Redis not used ({e})")
            print("   - Using local memory for caching")
            print("   - Using database for sessions")
            print("💡 Set USE_REDIS=true and REDIS_HOST/PORT (and optional REDIS_PASSWORD) to enable")
elif REDIS_CONFIG_IMPORTED and not USE_REDIS:
    # Explicitly disabled via env
    if DEBUG:
        print("ℹ️  USE_REDIS is False - using local memory cache and database sessions")
else:
    # Redis config not imported, use defaults
    if DEBUG:
        print("⚠️ Redis configuration module not available")
        print("   - Using local memory for caching")
        print("   - Using database for sessions")

# -----------------------------------------------------------------------------
# Channels configuration (WebSockets)
# -----------------------------------------------------------------------------
# Default to in-memory layer so the app still runs without Redis (no WS scaling)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}

# Use Redis for channel layer if Redis was successfully configured above
if REDIS_CONFIGURED:
    try:
        # Reuse the same validated Redis connection params from above
        _host = os.getenv('REDIS_HOST', 'localhost') or 'localhost'
        _port = int(os.getenv('REDIS_PORT', 6379) or 6379)
        _db = int(os.getenv('REDIS_DB', 0) or 0)
        _pwd = os.getenv('REDIS_PASSWORD', '') or ''

        if _pwd:
            _url = f"redis://:{_pwd}@{_host}:{_port}/{_db}"
        else:
            _url = f"redis://{_host}:{_port}/{_db}"

        CHANNEL_LAYERS = {
            'default': {
                'BACKEND': 'channels_redis.core.RedisChannelLayer',
                'CONFIG': {
                    'hosts': [_url],
                },
            }
        }
        if DEBUG:
            print("✅ Channels: Using Redis channel layer for WebSockets")
    except Exception as e:
        if DEBUG:
            print(f"⚠️ Channels: Could not configure Redis channel layer ({e}); using InMemory")

# Cache key prefixes
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 600
CACHE_MIDDLEWARE_KEY_PREFIX = 'poolcrest'

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
]

# Custom user model
AUTH_USER_MODEL = 'users.User'

# =============================================================================
# Django REST Framework Configuration
# =============================================================================

# Request throttling defaults -------------------------------------------------
DEFAULT_LOGIN_THROTTLE = os.getenv('LOGIN_THROTTLE_RATE', '5/minute')
DEFAULT_REGISTER_THROTTLE = os.getenv('REGISTER_THROTTLE_RATE', '10/hour')
DEFAULT_PASSWORD_RESET_THROTTLE = os.getenv('PASSWORD_RESET_THROTTLE_RATE', '3/hour')

if DEBUG:
    # Make development friendlier while keeping production defaults tight
    DEFAULT_LOGIN_THROTTLE = os.getenv('LOGIN_THROTTLE_RATE_DEBUG', '60/minute')
    DEFAULT_REGISTER_THROTTLE = os.getenv('REGISTER_THROTTLE_RATE_DEBUG', '120/hour')
    DEFAULT_PASSWORD_RESET_THROTTLE = os.getenv('PASSWORD_RESET_THROTTLE_RATE_DEBUG', '30/hour')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # For browsable API
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'PAGE_SIZE_QUERY_PARAM': 'page_size',
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.getenv('ANON_THROTTLE_RATE', '100/hour'),
        'user': os.getenv('USER_THROTTLE_RATE', '1000/hour'),
        'login': DEFAULT_LOGIN_THROTTLE,
        'register': DEFAULT_REGISTER_THROTTLE,
        'password_reset': DEFAULT_PASSWORD_RESET_THROTTLE,
    },
    # 'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',  # Uncomment when implemented
}

# Add browsable API renderer in development
if DEBUG:
    REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'].append(
        'rest_framework.renderers.BrowsableAPIRenderer'
    )


# =============================================================================
# JWT Configuration
# =============================================================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME', 60))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME', 7))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': os.getenv('JWT_ALGORITHM', 'HS256'),
    'SIGNING_KEY': os.getenv('JWT_SECRET_KEY', SECRET_KEY),
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': 'poolcrest-api',
    'JSON_ENCODER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',

    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# =============================================================================
# =============================================================================
# JWT Authentication Configuration
# =============================================================================

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME', 60))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME', 7))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DATETIME_FORMAT': '%Y-%m-%d %H:%M:%S',
    'DATE_FORMAT': '%Y-%m-%d',
    'TIME_FORMAT': '%H:%M:%S',
    # Enable rate limiting
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.ScopedRateThrottle',
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'login': '5/minute',
        'password_reset': '3/hour',
    },
}

# CORS Configuration
# =============================================================================

# CORS Configuration
# =============================================================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",      # React development server
    "http://127.0.0.1:3000",
    "http://localhost:4028",      # Vite development server
    "http://127.0.0.1:4028",
    "http://poolcrest-fe:4028", # Docker Compose Vite server alternative
    os.getenv('FRONTEND_URL', ''),  # Production frontend URL
]

# IMPORTANT: Must be True for cookie-based authentication
CORS_ALLOW_CREDENTIALS = True

# DO NOT use CORS_ALLOW_ALL_ORIGINS when using credentials
# It's a security risk and incompatible with CORS_ALLOW_CREDENTIALS
if DEBUG and not CORS_ALLOW_CREDENTIALS:
    CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-session-key',  # Custom header for session tracking
]

CORS_EXPOSE_HEADERS = [
    'content-type',
    'x-csrftoken',
]

# =============================================================================
# Security Settings
# =============================================================================

# CSRF Configuration
# Ensure local dev origin (Vite) is trusted to avoid "CSRF Failed: Origin checking failed"
# Note: Django expects origins without trailing slash
_default_csrf_origins = ['http://localhost:4028', 'http://127.0.0.1:4028']
CSRF_TRUSTED_ORIGINS = [origin for origin in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if origin]
for _o in _default_csrf_origins:
    if _o not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(_o)

# CSRF Cookie settings for enhanced security
# For SPA/AJAX, the CSRF token must be readable by JS to send X-CSRFToken header
CSRF_COOKIE_HTTPONLY = False  # Allow reading token; token is not sensitive
CSRF_COOKIE_SECURE = IS_PRODUCTION  # HTTPS only in production
CSRF_COOKIE_SAMESITE = 'Lax'  # Prevent CSRF attacks
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_USE_SESSIONS = False  # Use cookie-based CSRF
CSRF_HEADER_NAME = 'HTTP_X_CSRFTOKEN'

# Session Configuration
SESSION_COOKIE_AGE = int(os.getenv('SESSION_COOKIE_AGE', 86400))  # 24 hours
SESSION_COOKIE_SECURE = IS_PRODUCTION  # HTTPS only in production
SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access
SESSION_COOKIE_SAMESITE = 'Lax'  # Protect against CSRF
SESSION_COOKIE_NAME = 'poolcrest_sessionid'
SESSION_SAVE_EVERY_REQUEST = True  # Refresh session on each request

# Cookie-based JWT token settings (for enhanced security)
# These will be set by our custom auth views
JWT_AUTH_COOKIE = 'access_token'  # httpOnly cookie name for access token
JWT_AUTH_REFRESH_COOKIE = 'refresh_token'  # httpOnly cookie name for refresh token
JWT_AUTH_COOKIE_SECURE = IS_PRODUCTION  # HTTPS only in production
JWT_AUTH_COOKIE_HTTP_ONLY = True  # Prevent JavaScript access (XSS protection)
JWT_AUTH_COOKIE_SAMESITE = 'Lax'  # CSRF protection
JWT_AUTH_COOKIE_DOMAIN = None  # Use default domain

# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Content Security Policy (will be enhanced with middleware)
CSP_ENABLED = True  # Enable CSP middleware
CSP_REPORT_ONLY = DEBUG  # Only report violations in development

if IS_PRODUCTION:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
# Additional security settings
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'

# =============================================================================
# Email Configuration
# =============================================================================

EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'localhost').strip()
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '').strip()
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '').strip()
EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', 10))
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@poolcrest.com').strip()
EMAIL_FAIL_SILENTLY = os.getenv('EMAIL_FAIL_SILENTLY', 'False').lower() == 'true'

# Admin email settings
ADMINS = [
    ('Admin', 'admin@poolcrest.com'),
]
MANAGERS = ADMINS

# =============================================================================
# Internationalization
# =============================================================================

LANGUAGE_CODE = os.getenv('LANGUAGE_CODE', 'en-us')
TIME_ZONE = os.getenv('TIME_ZONE', 'America/New_York')
USE_I18N = True
USE_L10N = True
USE_TZ = True

# =============================================================================
# Static Files & Media
# =============================================================================

STATIC_URL = '/static/'
# print(f"Static URL: {STATIC_URL}")
STATIC_ROOT = BASE_DIR / 'staticfiles/'
STATICFILES_DIRS = [
    BASE_DIR / 'static/',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# WhiteNoise configuration for static files in production
if IS_PRODUCTION:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
else:
    # Use default storage in development
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv('MAX_UPLOAD_SIZE', 10485760))  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = FILE_UPLOAD_MAX_MEMORY_SIZE

# =============================================================================
# Logging Configuration
# =============================================================================
if CONFIG_IMPORTS_SUCCESS:
    LOGGING = setup_logging()
else:
    # Basic logging configuration if custom config not available
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'root': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    }

# =============================================================================
# API Documentation (Swagger)
# =============================================================================

SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False,
    'JSON_EDITOR': True,
    'SUPPORTED_SUBMIT_METHODS': [
        'get', 'post', 'put', 'delete', 'patch'
    ],
}

REDOC_SETTINGS = {
    'LAZY_RENDERING': False,
}

# =============================================================================
# Third-party Service Configuration
# =============================================================================

# Supabase configuration (for integration)
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')

# Stripe configuration
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')

# =============================================================================
# Application-specific Settings
# =============================================================================

# API Version
API_VERSION = os.getenv('API_VERSION', 'v1')


# Feature flags
ENABLE_API_DOCS = os.getenv('ENABLE_API_DOCS', 'True').lower() == 'true'
ENABLE_ADMIN_PANEL = os.getenv('ENABLE_ADMIN_PANEL', 'True').lower() == 'true'
ENABLE_RATE_LIMITING = os.getenv('ENABLE_RATE_LIMITING', 'True').lower() == 'true'

# Business configuration
COMPANY_NAME = os.getenv('COMPANY_NAME', 'Poolcrest LLC')
COMPANY_EMAIL = os.getenv('COMPANY_EMAIL', 'info@poolcrest.com')
COMPANY_PHONE = os.getenv('COMPANY_PHONE', '+1-555-123-POOL')

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =============================================================================
# Payments (Stripe) configuration
# =============================================================================
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

# Frontend origin for redirect URLs (success/cancel)
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost:4028')


# =============================================================================
# Development-specific Settings
# =============================================================================

# if DEBUG:
#     # Show SQL queries in console (careful in production)
#     LOGGING['loggers']['django.db.backends']['level'] = 'DEBUG'
    
#     # Email backend for development
#     if not EMAIL_HOST_USER:
#         EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# =============================================================================
# Health Check Configuration
# =============================================================================

def health_check():
    """Application health check for monitoring"""
    result = {
        'environment': APP_ENV,
        'debug': DEBUG,
        'version': API_VERSION,
    }
    
    if CONFIG_IMPORTS_SUCCESS:
        try:
            result['database'] = check_database_health()
        except:
            result['database'] = 'unavailable'
    else:
        result['database'] = 'config_error'
    
    return result

# Make health check available
HEALTH_CHECK = health_check

AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']