from .base import *
import dj_database_url
import os
from dotenv import load_dotenv
from pathlib import Path

# Define BASE_DIR and load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env.production"))  # Load .env in production

# Ensure DEBUG is set to False in production
DEBUG = env.bool('DEBUG', default=False)

# Allowed hosts for production
ALLOWED_HOSTS = ['budget-tracker-production-c5da.up.railway.app']

# Database configuration using dj_database_url
DATABASES = {
    'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
}

# Static files configuration
STATIC_ROOT = BASE_DIR.parent / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Add the custom RestrictAPIAccessMiddleware to the MIDDLEWARE setting
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Ensure Whitenoise middleware is included for static files
    'budget_tracker.middleware.restrict_api_middleware.RestrictAPIAccessMiddleware',  # Add custom middleware here
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS and CSRF settings for production
CORS_ALLOWED_ORIGINS = [
    "https://budget-tracker-production-c5da.up.railway.app",
    "http://localhost:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "https://budget-tracker-production-c5da.up.railway.app",
    "http://localhost:3000",
]

# Logging configuration (optional but recommended for debugging in production)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'