# Use the official Node.js image as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build the Vite application
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Define the command to run your app
CMD ["npm", "run", "start"]