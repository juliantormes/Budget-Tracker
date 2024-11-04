from .base import *
import os

# Ensure DEBUG is set to False in production
DEBUG = env.bool('DEBUG', default=False)

# Allowed hosts for production
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['https://budget-tracker-production-c5da.up.railway.app'])

# Database configuration with explicit ENGINE
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # Explicitly specify the engine
        'DATABASE_URL': env('DATABASE_URL'),  # Use the DATABASE_URL environment variable
    }
}

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# Static and media files configuration
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
