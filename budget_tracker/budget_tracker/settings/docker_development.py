# docker_development.py

from .base import *

DEBUG = True
ALLOWED_HOSTS = env.list('DOCKER_ALLOWED_HOSTS', default=['*'])  # Allow all hosts in Docker for now

# Use the PostgreSQL database in Docker
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='budget_tracker_db'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default='6675'),
        'HOST': env('DB_HOST', default='postgres'),  # Points to the Docker service name for PostgreSQL
        'PORT': '5432',
    }
}

# Static files configuration (you may not need this if using Gunicorn)
STATIC_URL = '/static/'
STATIC_ROOT = '/app/staticfiles'
