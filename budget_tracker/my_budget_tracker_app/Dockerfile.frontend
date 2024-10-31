# Use an official Node.js image from Docker Hub
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app files into the container
COPY . .

# Expose port 3000 for React
EXPOSE 3000

# Command to start React app
CMD ["npm", "start"]
