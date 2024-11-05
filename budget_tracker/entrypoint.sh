#!/bin/sh

# Run migrations
python manage.py migrate --noinput

# Load initial data only if the database is empty (check the Income table in the tracker app)
if ! python manage.py shell -c "from tracker.models import Income; print(Income.objects.exists())"; then
    echo "Loading initial data..."
    python manage.py loaddata initial_data.json
fi

# Collect static files only if STATIC_ROOT is empty or explicitly needed
if [ ! -d "$STATIC_ROOT" ] || [ "$FORCE_COLLECTSTATIC" = "true" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
else
    echo "Static files already collected."
fi

# Start the server with Gunicorn
exec gunicorn budget_tracker.wsgi:application --bind 0.0.0.0:8000
