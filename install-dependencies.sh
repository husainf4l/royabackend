#!/bin/bash
echo "Installing required dependencies for analytics module..."
npm install axios @nestjs/platform-express multer @nestjs/platform-multer
npm install --save-dev @types/multer
echo "Dependencies installed successfully!"
