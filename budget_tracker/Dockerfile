# Stage 1: Build React app
FROM node:14 as build

# Set the working directory
WORKDIR /app

# Install dependencies and build the React app
COPY my_budget_tracker_app/package*.json ./
RUN npm install
COPY my_budget_tracker_app/ .
RUN npm run build

# Stage 2: Set up Django app
FROM python:3.10

# Set working directory
WORKDIR /app

# Install Django dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy Django app files
COPY . .

# Copy built React files into Django’s template and static directories
COPY --from=build /app/build/index.html /app/templates/index.html
COPY --from=build /app/build/static /app/staticfiles

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port 8000 and run the entrypoint script
EXPOSE 8000
CMD ["sh", "/app/entrypoint.sh"]
