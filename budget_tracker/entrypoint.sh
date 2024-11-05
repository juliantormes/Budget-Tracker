#!/bin/sh

# Run migrations
python manage.py migrate --noinput

# Check for specific initial data before loading
check_data_script="
from django.contrib.auth.models import User
from tracker.models import ExpenseCategory, CreditCard

user_exists = User.objects.filter(username='julia').exists()
category_exists = ExpenseCategory.objects.filter(name='Groceries').exists()
credit_card_exists = CreditCard.objects.filter(last_four_digits='1111').exists()

if not (user_exists and category_exists and credit_card_exists):
    print('Initial data not fully loaded')
    exit(1)
else:
    print('Initial data already present')
    exit(0)
"

# Run the check script
if ! python -c "$check_data_script"; then
    echo "Loading initial data..."
    python manage.py loaddata initial_data.json
else
    echo "Skipping loading initial data; data already present."
fi

# Collect static files
if [ ! -d "$STATIC_ROOT" ] || [ "$FORCE_COLLECTSTATIC" = "true" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
else
    echo "Static files already collected."
fi

# Start the server with Gunicorn
exec gunicorn budget_tracker.wsgi:application --bind 0.0.0.0:8000
