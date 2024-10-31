from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url

# Define base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment based on the ENVIRONMENT variable
if os.getenv('ENVIRONMENT') == 'production':
    load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"), override=True)
else:
    load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env.local"), override=True)

# Security and Debug settings
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG') == 'True'
ALLOWED_HOSTS = ['.railway.app', 'budget-tracker-production-52d0.up.railway.app']


# URL Redirection
LOGIN_REDIRECT_URL = '/home/'  # Redirect to home after login
LOGOUT_REDIRECT_URL = '/login/'  # Redirect to login after logout

# Message storage
MESSAGE_STORAGE = 'django.contrib.messages.storage.cookie.CookieStorage'

# Logging configuration
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
        'level': 'DEBUG',
    },
}

# Application definition
INSTALLED_APPS = [
    'tracker',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

# CORS and CSRF settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React app's local address
]
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", 'https://budget-tracker-production-52d0.up.railway.app']

# Authentication settings
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)

# Middleware configuration
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URL Configuration
ROOT_URLCONF = 'budget_tracker.urls'
WSGI_APPLICATION = 'budget_tracker.wsgi.application'

# Database configuration
DATABASES = {
    'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
}

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# Template settings
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates', 'static'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files configuration
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'tracker/static')]

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
