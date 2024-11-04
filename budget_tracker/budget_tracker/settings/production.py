from .base import *
import dj_database_url
import os

# Ensure DEBUG is set to False in production
DEBUG = env.bool('DEBUG', default=False)

# Allowed hosts for production
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['your-production-domain.com'])

# Database configuration using dj_database_url
DATABASES = {
    'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
}

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# Static and media files configuration
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
