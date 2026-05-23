from django.apps import AppConfig


class AppointmentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.appointments'
    verbose_name = 'Appointments'
    
    def ready(self):
        """Import signal handlers when Django starts"""
        try:
            from . import signals
        except ImportError:
            pass
