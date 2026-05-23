from django.apps import AppConfig


class ServicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.services'

    verbose_name = 'Service Management'

    def ready(self):
        # Import signals to register them
        try:
            from . import signals  # noqa: F401
        except Exception:
            pass