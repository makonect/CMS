#!/bin/bash

echo "Starting deployment..."

# Build frontends
cd /e/FALIS/Makonect/CMS/leledumbo/client
npm run build
cd ../rumanabastala-client
npm run build

# Copy to production
sudo cp -r /e/FALIS/Makonect/CMS/leledumbo/client/build /var/www/leledumbo/client/
sudo cp -r /e/FALIS/Makonect/CMS/leledumbo/rumanabastala-client/build /var/www/leledumbo/rumanabastala-client/

# Copy backend
sudo cp -r /e/FALIS/Makonect/CMS/shared/server /var/www/leledumbo/

# Install backend dependencies
cd /var/www/leledumbo/server
npm install --production

# Setup environment variables
cp /e/FALIS/Makonect/CMS/.env.production .env

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "Deployment completed!"