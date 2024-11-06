import os
from pathlib import Path
import environ
from django.core.asgi import get_asgi_application

env = environ.Env()
BASE_DIR = Path(__file__).resolve().parent.parent

ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

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

application = get_asgi_application()
