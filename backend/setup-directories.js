// backend/setup-directories.js
const fs = require('fs');
const path = require('path');

// Create necessary directories for file uploads
const directories = [
  'uploads',
  'uploads/images',
  'uploads/avatars',
  'uploads/documents',
  'uploads/misc'
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('Directory setup complete!');