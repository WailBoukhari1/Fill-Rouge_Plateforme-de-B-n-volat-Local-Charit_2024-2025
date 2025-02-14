const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'node_modules', 'leaflet', 'dist', 'images');
const targetDir = path.join(__dirname, 'src', 'assets');

console.log('Source directory:', sourceDir);
console.log('Target directory:', targetDir);

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  console.log('Creating target directory...');
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('Target directory created successfully');
} else {
  console.log('Target directory already exists');
}

// Copy marker images
const images = ['marker-icon.png', 'marker-icon-2x.png', 'marker-shadow.png'];
console.log('Images to copy:', images);

images.forEach(image => {
  const sourcePath = path.join(sourceDir, image);
  const targetPath = path.join(targetDir, image);
  
  console.log(`\nProcessing ${image}:`);
  console.log('Source path:', sourcePath);
  console.log('Target path:', targetPath);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Successfully copied ${image} to assets folder`);
    } else {
      console.error(`Source file not found: ${sourcePath}`);
    }
  } catch (error) {
    console.error(`Error copying ${image}:`, error.message);
  }
}); 

console.log('\nLeaflet assets copy process completed'); 