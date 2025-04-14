#!/bin/bash
# Setup script to initialize the project

# Setup backend
cd backend
npm install

# Setup frontend
cd ../frontend
npm install

echo "Setup complete"
