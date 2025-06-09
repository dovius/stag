const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateThumbnails() {
  const imagesDir = './public/images';
  const thumbsDir = './public/images/thumbs';
  
  // Ensure thumbs directory exists
  if (!fs.existsSync(thumbsDir)) {
    fs.mkdirSync(thumbsDir, { recursive: true });
  }
  
  try {
    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && !file.startsWith('.')
    );
    
    console.log(`Found ${imageFiles.length} images to process...`);
    
    for (const file of imageFiles) {
      const inputPath = path.join(imagesDir, file);
      const outputPath = path.join(thumbsDir, file);
      
      // Skip if thumbnail already exists
      if (fs.existsSync(outputPath)) {
        console.log(`Skipping ${file} - thumbnail exists`);
        continue;
      }
      
      try {
        await sharp(inputPath)
          .resize(300, 300, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ 
            quality: 75,
            progressive: true 
          })
          .toFile(outputPath);
          
        console.log(`✓ Generated thumbnail for ${file}`);
      } catch (err) {
        console.error(`✗ Error processing ${file}:`, err.message);
      }
    }
    
    console.log('Thumbnail generation completed!');
  } catch (err) {
    console.error('Error reading images directory:', err);
  }
}

// Run if called directly
if (require.main === module) {
  generateThumbnails();
}

module.exports = generateThumbnails;