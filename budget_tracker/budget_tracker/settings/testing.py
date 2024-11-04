# testing.py

from .base import *

DEBUG = False
ALLOWED_HOSTS = ['testserver']

# Use an in-memory SQLite database for testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}
