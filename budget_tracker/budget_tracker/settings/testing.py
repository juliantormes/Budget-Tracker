from .base import *
import dj_database_url
import os
from dotenv import load_dotenv
from pathlib import Path

# Define BASE_DIR and load environment variables from .env.testing
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env.testing"))  # Load variables from .env.testing

# Set DEBUG for testing purposes
DEBUG = os.getenv("DEBUG", "True") == "True"

# Database configuration using dj_database_url, pulling DATABASE_URL from .env.testing
DATABASES = {
    'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
}

# Load SECRET_KEY from .env.testing
SECRET_KEY = os.getenv("SECRET_KEY")

MIDDLEWARE += ['budget_tracker.middleware.redirect_to_api.RedirectToApiMiddleware']

ALLOWED_HOSTS += ['testserver']