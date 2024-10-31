# Stage 1: Build React app
FROM node:14 as build

WORKDIR /app
COPY my_budget_tracker_app/package*.json ./
RUN npm install
COPY my_budget_tracker_app/ .
RUN npm run build

# Stage 2: Set up Django app
FROM python:3.10

WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy Django app
COPY . .

# Copy built React files to Django's static files directory
COPY --from=build /app/build /app/tracker/static

# Run migrations, load data, and start Django server
CMD ["sh", "-c", "python manage.py migrate && python manage.py loaddata initial_data.json && gunicorn budget_tracker.wsgi:application --bind 0.0.0.0:8000"]
