#!/bin/sh

# Run migrations
python manage.py migrate

# Load initial data
python manage.py loaddata initial_data.json

# Collect static files
python manage.py collectstatic --noinput

# Start the server with Gunicorn
gunicorn budget_tracker.wsgi:application --bind 0.0.0.0:8000
