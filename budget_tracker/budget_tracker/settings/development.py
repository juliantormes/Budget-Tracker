# development.py

from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

MIDDLEWARE += ['budget_tracker.middleware.redirect_to_api.RedirectToApiMiddleware']