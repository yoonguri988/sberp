from django.apps import AppConfig


class SalaryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "salary"
    
    def ready(self):
        from django.db.backends.oracle.base import DatabaseWrapper

        DatabaseWrapper.check_database_version_supported = lambda self: None