"""
Apps configuration for users app.
"""

from django.apps import AppConfig
import os


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    verbose_name = 'User Management'
    
    def ready(self):
        """
        Import signals when app is ready.
        Uses defensive loading to prevent initialization issues.
        """
        # Skip signals during migrations or if explicitly disabled
        if os.environ.get('SKIP_USER_SIGNALS') == '1':
            return
            
        # Check if we're running migrations
        import sys
        if 'migrate' in sys.argv or 'makemigrations' in sys.argv:
            return
            
        # Try to import signals, but don't fail if there's an issue
        try:
            from apps.users import signals
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not import user signals: {e}")
