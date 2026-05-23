"""
Simplified Redis configuration for caching and session storage.
"""

import os
from typing import Dict, Any

def get_redis_config() -> Dict[str, Any]:
    """
    Get Redis configuration based on environment.
    
    Returns:
        Dictionary with Redis configuration for Django cache backend.
    """
    
    # Get Redis connection details from environment
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    
    # Build Redis URL
    if REDIS_PASSWORD:
        REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"
    else:
        REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"
    
    return {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 50,
                    'retry_on_timeout': True,
                    'socket_connect_timeout': 5,
                    'socket_timeout': 5,
                },
                'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
                'IGNORE_EXCEPTIONS': True,  # Continue if Redis is down
            },
            'KEY_PREFIX': 'poolcrest',
            'VERSION': 1,
            'TIMEOUT': 300,  # 5 minutes default timeout
        },
        'session': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': f"redis://{REDIS_HOST}:{REDIS_PORT}/1",  # Use DB 1 for sessions
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 50,
                    'socket_connect_timeout': 5,
                    'socket_timeout': 5,
                },
            },
            'KEY_PREFIX': 'session',
            'TIMEOUT': 86400,  # 24 hours for sessions
        },
        'api': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': f"redis://{REDIS_HOST}:{REDIS_PORT}/2",  # Use DB 2 for API cache
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'socket_connect_timeout': 5,
                    'socket_timeout': 5,
                },
            },
            'KEY_PREFIX': 'api',
            'TIMEOUT': 60,  # 1 minute for API responses
        }
    }


def get_fallback_cache_config() -> Dict[str, Any]:
    """
    Get fallback cache configuration when Redis is not available.
    
    Returns:
        Dictionary with local memory cache configuration.
    """
    return {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'unique-snowflake',
        },
        # Important: DO NOT include 'session' cache in fallback
        # because we'll use database sessions instead
    }


def get_celery_config() -> Dict[str, Any]:
    """
    Get Celery configuration for async task processing.
    
    Returns:
        Dictionary with Celery configuration.
    """
    
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
    
    # Celery uses DB 3 for broker and DB 4 for results
    if REDIS_PASSWORD:
        BROKER_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/3"
        RESULT_BACKEND = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/4"
    else:
        BROKER_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/3"
        RESULT_BACKEND = f"redis://{REDIS_HOST}:{REDIS_PORT}/4"
    
    return {
        'CELERY_BROKER_URL': BROKER_URL,
        'CELERY_RESULT_BACKEND': RESULT_BACKEND,
        'CELERY_ACCEPT_CONTENT': ['json'],
        'CELERY_TASK_SERIALIZER': 'json',
        'CELERY_RESULT_SERIALIZER': 'json',
        'CELERY_TIMEZONE': 'America/New_York',
        'CELERY_ENABLE_UTC': True,
        'CELERY_TASK_TRACK_STARTED': True,
        'CELERY_TASK_TIME_LIMIT': 30 * 60,  # 30 minutes
        'CELERY_TASK_SOFT_TIME_LIMIT': 25 * 60,  # 25 minutes
    }


# Cache timeout settings for different types of data
CACHE_TIMEOUTS = {
    'user_profile': 300,  # 5 minutes
    'service_list': 600,  # 10 minutes
    'quote_details': 180,  # 3 minutes
    'property_info': 300,  # 5 minutes
    'statistics': 900,  # 15 minutes
    'api_response': 60,  # 1 minute
}
