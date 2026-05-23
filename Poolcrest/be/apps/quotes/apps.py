from django.apps import AppConfig


class QuotesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.quotes'
    verbose_name = 'Quote Management'
    
    def ready(self):
        """Import signal handlers when Django starts"""
        try:
            from . import signals
        except ImportError:
            pass
