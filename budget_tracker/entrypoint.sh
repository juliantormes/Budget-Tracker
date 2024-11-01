#!/bin/sh

# Ensure the templates directory exists
mkdir -p /app/templates

# Copy the index.html to templates (optional: in case it didn't get copied in the build)
cp /app/build/index.html /app/templates/index.html

# Run migrations
python manage.py migrate

# Load initial data
python manage.py loaddata initial_data.json

# Collect static files
python manage.py collectstatic --noinput

# Start the server with Gunicorn
gunicorn budget_tracker.wsgi:application --bind 0.0.0.0:8000
