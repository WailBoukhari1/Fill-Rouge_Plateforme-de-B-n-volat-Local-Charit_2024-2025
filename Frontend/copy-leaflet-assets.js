const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'node_modules', 'leaflet', 'dist', 'images');
const targetDir = path.join(__dirname, 'src', 'assets');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy marker images
const images = ['marker-icon.png', 'marker-icon-2x.png', 'marker-shadow.png'];
images.forEach(image => {
  const sourcePath = path.join(sourceDir, image);
  const targetPath = path.join(targetDir, image);
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`Copied ${image} to assets folder`);
}); 