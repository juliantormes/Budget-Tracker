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

# Ensure the templates directory exists
RUN mkdir -p /app/templates

# Copy built React files to Django's template and static files directory
COPY --from=build /app/build/index.html /app/templates/index.html
COPY --from=build /app/build/static /app/staticfiles

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose the port and run the entrypoint script
CMD ["sh", "/app/entrypoint.sh"]
