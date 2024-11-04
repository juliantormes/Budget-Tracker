# production.py

from .base import *

DEBUG = False
ALLOWED_HOSTS = env.list('PRODUCTION_ALLOWED_HOSTS', default=['.railway.app'])

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
