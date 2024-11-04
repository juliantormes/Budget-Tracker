#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path
import environ

def main():
    """Run administrative tasks."""
    env = environ.Env()
    BASE_DIR = Path(__file__).resolve().parent
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')  # Default to 'development' if not set

    # Load the correct .env file based on the ENVIRONMENT variable
    if ENVIRONMENT == 'production':
        env.read_env(os.path.join(BASE_DIR, '.env.production'))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budget_tracker.settings.production')
    elif ENVIRONMENT == 'testing':
        env.read_env(os.path.join(BASE_DIR, '.env.testing'))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budget_tracker.settings.testing')
    elif ENVIRONMENT == 'docker':
        env.read_env(os.path.join(BASE_DIR, '.env.docker'))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budget_tracker.settings.docker_development')
    else:
        env.read_env(os.path.join(BASE_DIR, '.env.development'))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budget_tracker.settings.development')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
