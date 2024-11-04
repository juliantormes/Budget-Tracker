from .base import *

# Set DEBUG to False for production
DEBUG = env.bool('DEBUG', default=False)

# Security settings specific to production
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# Ensure only trusted hosts are allowed (customize this for your production environment)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['your-production-domain.com'])

# Use the production database URL from environment variables
DATABASES = {
    'default': env.db('DATABASE_URL')
}

# Static and media files configuration for production
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
