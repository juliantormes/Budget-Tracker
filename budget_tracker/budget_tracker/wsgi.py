"""
WSGI config for budget_tracker project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os
from pathlib import Path
import environ
from django.core.wsgi import get_wsgi_application

# Initialize environment variables
env = environ.Env()
BASE_DIR = Path(__file__).resolve().parent.parent  # Adjusted to point to the project root
env.read_env(os.path.join(BASE_DIR, '.env.production'))

# Set the default settings module for production
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "budget_tracker.settings.production")

application = get_wsgi_application()
