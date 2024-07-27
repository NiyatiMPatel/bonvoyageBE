# Specify a base image
FROM node:18.12.0-alpine

WORKDIR /app/

# Install some depenendencies
COPY package.json .

RUN npm install

COPY . .

# # Expose the application port
# EXPOSE 5000

# Default command
CMD [ "npm", "run", "start"]