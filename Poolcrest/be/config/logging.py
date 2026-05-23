"""
Comprehensive logging configuration for Poolcrest backend.
Logs to both console and file with proper formatting and rotation.
"""

import os
import logging
import logging.handlers
from pathlib import Path
from datetime import datetime

def setup_logging():
    """
    Setup comprehensive logging configuration for the backend.
    ALL logs go to BOTH console AND file.
    """
    
    # Create logs directory
    log_dir = Path(__file__).parent.parent / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    # Create subdirectories for better organization
    (log_dir / 'daily').mkdir(exist_ok=True)
    (log_dir / 'errors').mkdir(exist_ok=True)
    (log_dir / 'security').mkdir(exist_ok=True)
    
    # Get log level from environment
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    
    # Create timestamped log file for current session
    timestamp = datetime.now().strftime('%Y-%m-%d')
    
    # Log file paths
    log_files = {
        'general': log_dir / f'poolcrest_{timestamp}.log',
        'all': log_dir / 'all.log',
        'errors': log_dir / 'errors' / f'errors_{timestamp}.log',
        'database': log_dir / 'database.log',
        'auth': log_dir / 'security' / 'auth.log',
        'api': log_dir / 'api.log',
        'security': log_dir / 'security' / 'security.log',
    }
    
    # Ensure log files exist
    for log_file in log_files.values():
        log_file.parent.mkdir(exist_ok=True)
        log_file.touch(exist_ok=True)
    
    # Base configuration
    config = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '[{levelname:8}] {asctime} | {name:20} | {funcName:15} | {message}',
                'style': '{',
                'datefmt': '%Y-%m-%d %H:%M:%S',
            },
            'standard': {
                'format': '[{levelname}] {asctime} | {name} | {message}',
                'style': '{',
                'datefmt': '%H:%M:%S',
            },
            'simple': {
                'format': '{levelname} | {message}',
                'style': '{',
            },
            'colored': {
                'format': '%(log_color)s[%(levelname)s]%(reset)s %(asctime)s | %(name)s | %(message)s',
                'datefmt': '%H:%M:%S',
            },
        },
        'filters': {
            'require_debug_false': {
                '()': 'django.utils.log.RequireDebugFalse',
            },
            'require_debug_true': {
                '()': 'django.utils.log.RequireDebugTrue',
            },
        },
        'handlers': {
            # Console handler - ALWAYS active
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
                'formatter': 'standard',
                'stream': 'ext://sys.stdout',
            },
            
            # General file - logs everything
            'general_file': {
                'level': 'DEBUG',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': str(log_files['general']),
                'maxBytes': 10 * 1024 * 1024,  # 10MB
                'backupCount': 5,
                'formatter': 'verbose',
                'encoding': 'utf-8',
            },
            
            # All logs file - never rotates (for debugging)
            'all_file': {
                'level': 'DEBUG',
                'class': 'logging.FileHandler',
                'filename': str(log_files['all']),
                'formatter': 'verbose',
                'encoding': 'utf-8',
            },
            
            # Error file
            'error_file': {
                'level': 'ERROR',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': str(log_files['errors']),
                'maxBytes': 10 * 1024 * 1024,
                'backupCount': 10,
                'formatter': 'verbose',
                'encoding': 'utf-8',
            },
            
            # Database file
            'database_file': {
                'level': 'DEBUG',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': str(log_files['database']),
                'maxBytes': 5 * 1024 * 1024,
                'backupCount': 3,
                'formatter': 'verbose',
                'encoding': 'utf-8',
            },
            
            # Security file
            'security_file': {
                'level': 'INFO',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': str(log_files['security']),
                'maxBytes': 5 * 1024 * 1024,
                'backupCount': 10,
                'formatter': 'verbose',
                'encoding': 'utf-8',
            },
        },
        'loggers': {
            # Root logger - catches everything
            '': {
                'handlers': ['console', 'general_file', 'all_file'],
                'level': 'DEBUG',
                'propagate': False,
            },
            
            # Django loggers
            'django': {
                'handlers': ['console', 'general_file'],
                'level': 'INFO',
                'propagate': False,
            },
            
            'django.db.backends': {
                'handlers': ['console', 'database_file'],
                'level': 'DEBUG' if log_level == 'DEBUG' else 'INFO',
                'propagate': False,
            },
            
            'django.security': {
                'handlers': ['console', 'security_file', 'error_file'],
                'level': 'INFO',
                'propagate': False,
            },
            
            # Config module logs (database.py)
            'config': {
                'handlers': ['console', 'general_file', 'database_file'],
                'level': 'DEBUG',
                'propagate': False,
            },
            
            'config.database': {
                'handlers': ['console', 'general_file', 'database_file'],
                'level': 'DEBUG',
                'propagate': False,
            },
            
            # Apps loggers
            'apps': {
                'handlers': ['console', 'general_file'],
                'level': 'DEBUG',
                'propagate': False,
            },
            
            'apps.users': {
                'handlers': ['console', 'general_file', 'security_file'],
                'level': 'DEBUG',
                'propagate': False,
            },
            
            # Custom logger namespace
            'poolcrest': {
                'handlers': ['console', 'general_file', 'all_file'],
                'level': 'DEBUG',
                'propagate': False,
            },
        },
    }
    
    # Try to add colorlog if available
    try:
        import colorlog
        config['formatters']['colored'] = {
            '()': 'colorlog.ColoredFormatter',
            'format': '%(log_color)s[%(levelname)s]%(reset)s %(asctime)s | %(name)s | %(message)s',
            'datefmt': '%H:%M:%S',
            'log_colors': {
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'red,bg_white',
            },
        }
        # Update console handler to use colored formatter
        config['handlers']['console']['formatter'] = 'colored'
    except ImportError:
        pass  # colorlog not installed, use standard formatting
    
    return config


class PoolcrestLogger:
    """Enhanced logger with structured logging methods."""
    
    def __init__(self, name):
        self.logger = logging.getLogger(name)
        # Force logger to use our configuration
        self.logger.setLevel(logging.DEBUG)
        
    def debug(self, message, **kwargs):
        """Log debug message."""
        self.logger.debug(message, extra=kwargs)
        
    def info(self, message, **kwargs):
        """Log info message."""
        self.logger.info(message, extra=kwargs)
        
    def warning(self, message, **kwargs):
        """Log warning message."""
        self.logger.warning(message, extra=kwargs)
        
    def error(self, message, **kwargs):
        """Log error message."""
        self.logger.error(message, extra=kwargs)
        
    def critical(self, message, **kwargs):
        """Log critical message."""
        self.logger.critical(message, extra=kwargs)
    
    def log_user_action(self, user_id, action, details=None, level='info'):
        """Log user actions for audit trail."""
        message = f"User {user_id} performed action: {action}"
        if details:
            message += f" | Details: {details}"
            
        getattr(self.logger, level)(message, extra={
            'user_id': user_id,
            'action': action,
            'details': details,
        })
    
    def log_database_operation(self, operation, table, record_id=None, details=None):
        """Log database operations."""
        message = f"DB {operation} on {table}"
        if record_id:
            message += f" | ID: {record_id}"
        if details:
            message += f" | {details}"
            
        self.logger.info(message, extra={
            'operation': operation,
            'table': table,
            'record_id': record_id,
            'details': details,
        })
    
    def log_security_event(self, event_type, details, severity='warning'):
        """Log security-related events."""
        message = f"SECURITY: {event_type} | {details}"
        
        getattr(self.logger, severity)(message, extra={
            'event_type': event_type,
            'details': details,
            'severity': severity,
        })


def get_logger(name):
    """Get a logger instance."""
    # Ensure the name uses our namespace
    if not name.startswith(('django', 'config', 'apps', 'poolcrest')):
        name = f'poolcrest.{name}'
    return PoolcrestLogger(name)


def log_startup():
    """Log application startup."""
    logger = get_logger('poolcrest')
    logger.info("="*60)
    logger.info("🚀 Poolcrest Backend Starting Up")
    logger.info(f"📁 Log files location: {Path(__file__).parent.parent / 'logs'}")
    logger.info(f"🔧 Log level: {os.getenv('LOG_LEVEL', 'INFO')}")
    logger.info("="*60)


def log_shutdown():
    """Log application shutdown."""
    logger = get_logger('poolcrest')
    logger.info("="*60)
    logger.info("🛑 Poolcrest Backend Shutting Down")
    logger.info("="*60)


# Test logging on import
if __name__ != '__main__':
    # When imported, ensure basic logging works
    _test_logger = get_logger('config.logging')
    _test_logger.debug("Logging configuration loaded successfully")
