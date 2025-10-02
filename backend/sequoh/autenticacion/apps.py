from django.apps import AppConfig


class AutenticacionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'autenticacion'

    def ready(self):
        from . import signals  # noqa: F401

    def ready(self):
        from . import signals  # noqa: F401
