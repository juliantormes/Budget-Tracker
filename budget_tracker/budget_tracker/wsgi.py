import os
from pathlib import Path
import environ
from django.core.wsgi import get_wsgi_application

# Initialize environment variables
env = environ.Env()
BASE_DIR = Path(__file__).resolve().parent.parent  # Adjusted to point to the project root

# Check the ENVIRONMENT variable and load the corresponding .env file
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")  # Default to production if not set

if ENVIRONMENT == "production":
    env.read_env(os.path.join(BASE_DIR, '.env.production'))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "budget_tracker.settings.production")
elif ENVIRONMENT == "testing":
    env.read_env(os.path.join(BASE_DIR, '.env.testing'))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "budget_tracker.settings.testing")
elif ENVIRONMENT == "docker":
    env.read_env(os.path.join(BASE_DIR, '.env.docker'))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "budget_tracker.settings.docker_development")
else:
    env.read_env(os.path.join(BASE_DIR, '.env.development'))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "budget_tracker.settings.development")

# Assign the WSGI application to the `application` variable
application = get_wsgi_application()
