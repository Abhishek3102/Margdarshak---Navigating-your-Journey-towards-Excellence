#!/bin/bash
# Deployment script to deploy the app

# Build frontend
cd ../frontend
npm install
npm run build

# Deploy frontend to S3
aws s3 sync build/ s3://my-bucket --delete

# Deploy backend
cd ../backend
npm install
pm2 start app.js
