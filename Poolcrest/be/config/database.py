"""
Database connection configuration with fallback logic.
Tries local Docker database first, then falls back to Supabase cloud database.
"""

import logging
import time
import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured

# Import our custom logger
def get_configured_logger():
    """Get a properly configured logger that writes to both console and file."""
    import logging.handlers
    from pathlib import Path
    
    # Create logs directory
    log_dir = Path(__file__).parent.parent / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    # Create logger
    logger = logging.getLogger('config.database')
    logger.setLevel(logging.DEBUG)
    
    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # Console handler - ALWAYS outputs
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    console_formatter = logging.Formatter('[%(levelname)s] %(asctime)s | %(name)s | %(message)s')
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File handler - writes everything to database.log
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / 'database.log',
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter('[%(levelname)s] %(asctime)s | %(name)s | %(funcName)s | %(message)s')
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Also write to general log
    general_handler = logging.handlers.RotatingFileHandler(
        log_dir / 'all.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    general_handler.setLevel(logging.DEBUG)
    general_handler.setFormatter(file_formatter)
    logger.addHandler(general_handler)
    
    # Prevent propagation to avoid duplicate logs
    logger.propagate = False
    
    return logger

# Get configured logger
logger = get_configured_logger()
logger.info("="*60)
logger.info("Database configuration module loaded")
logger.info("="*60)

def load_environment():
    """Load environment variables from .env file"""
    # Look for .env in multiple locations
    env_paths = [
        Path(__file__).parent.parent / '.env',
        Path(__file__).parent.parent.parent / '.env',
        Path('.env'),
        Path('environment/.env'),
    ]
    
    for env_path in env_paths:
        if env_path.exists():
            load_dotenv(env_path)
            logger.info(f"Loaded environment from: {env_path}")
            break
    else:
        logger.warning("No .env file found in expected locations")

def test_database_connection(db_config, db_type="local"):
    """
    Test database connection with given configuration.
    
    Args:
        db_config (dict): Database configuration parameters
        db_type (str): Type of database (local/cloud) for logging
        
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        # Extract connection parameters based on config type
        if isinstance(db_config, dict) and 'ENGINE' in db_config:
            # Django-style config
            conn_params = {
                'host': db_config.get('HOST'),
                'port': db_config.get('PORT'),
                'database': db_config.get('NAME'),
                'user': db_config.get('USER'),
                'password': db_config.get('PASSWORD'),
            }
        else:
            # Direct connection params
            conn_params = db_config
            
        # Test connection
        connection = psycopg2.connect(**conn_params)
        connection.close()
        logger.info(f"✅ {db_type.capitalize()} database connection successful")
        return True
        
    except (psycopg2.OperationalError, Exception) as error:
        logger.warning(f"❌ {db_type.capitalize()} database connection failed: {error}")
        return False

def get_database_config(attempts=5, delay=2):
    """
    Get database configuration with fallback logic.
    
    Args:
        attempts (int): Maximum number of connection attempts
        delay (int): Base delay between attempts (progressive)
        
    Returns:
        dict: Django database configuration
    """
    load_environment()
    
    # Local Docker Database Configuration
    local_db_config = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DOCKER_DB_NAME', 'poolcrest_db'),
        'USER': os.getenv('DOCKER_DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DOCKER_DB_PSWD', 'postgres'),
        'HOST': os.getenv('DOCKER_DB_HOST', 'localhost'),
        'PORT': os.getenv('DOCKER_DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'disable',
            'connect_timeout': 10,
        },
        'CONN_MAX_AGE': 600,
        'CONN_HEALTH_CHECKS': True,
    }
    
    # Supabase Cloud Database Configuration
    cloud_db_config = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('SUPABASE_DB_NAME', 'postgres'),
        'USER': os.getenv('SUPABASE_DB_USER', 'postgres'),
        'PASSWORD': os.getenv('SUPABASE_DB_PASSWORD'),
        'HOST': os.getenv('SUPABASE_DB_HOST'),
        'PORT': os.getenv('SUPABASE_DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
            'connect_timeout': 30,
        },
        'CONN_MAX_AGE': 600,
        'CONN_HEALTH_CHECKS': True,
    }
    logger.debug(f"Cloud DB Config: {cloud_db_config}")
    # Alternative: Use Supabase URL if provided
    supabase_url = os.getenv('SUPABASE_DATABASE_URL')
    if supabase_url and not cloud_db_config['HOST']:
        cloud_db_config = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'postgres',  # Default for Supabase
            'USER': 'postgres',
            'PASSWORD': '',
            'HOST': '',
            'PORT': '',
            'OPTIONS': {
                'sslmode': 'require',
            },
            'CONN_MAX_AGE': 600,
        }
        # Parse URL (simplified - in production use dj-database-url)
        if supabase_url.startswith('postgresql://'):
            logger.info("Using Supabase DATABASE_URL for cloud connection")
    
    attempt = 1
    while attempt <= attempts:
        try:
            # Try local database first (attempts 1-3)
            if attempt <= 3:
                logger.info(f"🔄 Attempt {attempt}: Trying local Docker database...")
                if test_database_connection(local_db_config, "local"):
                    logger.info("🎯 Using LOCAL Docker database")
                    return local_db_config
                    
            # Try cloud database (attempts 4-5)
            else:
                logger.info(f"🔄 Attempt {attempt}: Trying Supabase cloud database...")
                
                # Validate cloud configuration
                if not cloud_db_config.get('HOST') and not supabase_url:
                    logger.error("❌ Cloud database configuration missing. Please set SUPABASE_DB_HOST or SUPABASE_DATABASE_URL")
                    break
                    
                if test_database_connection(cloud_db_config, "cloud"):
                    logger.info("🎯 Using SUPABASE cloud database")
                    return cloud_db_config
                    
        except Exception as error:
            logger.error(f"❌ Database connection attempt {attempt} failed: {error}")
            
        # Progressive delay before retry
        if attempt < attempts:
            sleep_time = delay ** attempt
            logger.info(f"⏳ Waiting {sleep_time} seconds before retry...")
            time.sleep(sleep_time)
            
        attempt += 1
    
    # All attempts failed
    logger.critical("🚨 Failed to connect to any database after all attempts")
    raise ImproperlyConfigured(
        "Unable to connect to any database. "
        "Please check your local Docker database or Supabase configuration."
    )

def get_database_configs():
    """
    Get all database configurations for Django settings.
    
    Returns:
        dict: Complete database configuration for Django
    """
    try:
        primary_config = get_database_config()
        
        return {
            'default': primary_config,
            # Add read replica or additional databases here if needed
            # 'read_replica': {...},
        }
        
    except ImproperlyConfigured as e:
        logger.critical(f"Database configuration failed: {e}")
        # In production, you might want to use a fallback SQLite for emergencies
        # But for development, we should fail fast
        raise

# Utility function for health checks
def check_database_health():
    """
    Check current database connection health.
    Used for monitoring and health endpoints.
    
    Returns:
        dict: Database health status
    """
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        return {
            'status': 'healthy',
            'database': connection.settings_dict.get('NAME'),
            'host': connection.settings_dict.get('HOST'),
            'engine': connection.settings_dict.get('ENGINE'),
        }
        
    except Exception as error:
        return {
            'status': 'unhealthy',
            'error': str(error),
            'database': 'unknown',
        }
