const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadAndCreateThumbnail(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      // Pipe to sharp for resizing
      const transformer = sharp()
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 75,
          progressive: true 
        });
      
      response.pipe(transformer).pipe(file);
      
      file.on('finish', () => {
        resolve();
      });
      
      file.on('error', reject);
      transformer.on('error', reject);
    }).on('error', reject);
  });
}

async function generateProThumbnails() {
  const baseUrl = 'https://pub-3cddef61ee16411e9e008cf603d66ed6.r2.dev/';
  const thumbsDir = './public/images/pro-thumbs';
  
  // Ensure thumbs directory exists
  if (!fs.existsSync(thumbsDir)) {
    fs.mkdirSync(thumbsDir, { recursive: true });
  }
  
  // Take first 4 PRO images for preview - use better representative images
  const previewImages = [
    '_DSC0001.jpg', '_DSC0003.jpg', '_DSC0004.jpg', '_DSC0005.jpg'
  ];
  
  console.log(`Generating ${previewImages.length} PRO thumbnails...`);
  
  for (const filename of previewImages) {
    const url = baseUrl + filename;
    const outputPath = path.join(thumbsDir, filename);
    
    // Skip if thumbnail already exists
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${filename} - thumbnail exists`);
      continue;
    }
    
    try {
      await downloadAndCreateThumbnail(url, outputPath);
      console.log(`✓ Generated PRO thumbnail for ${filename}`);
    } catch (err) {
      console.error(`✗ Error processing ${filename}:`, err.message);
    }
  }
  
  console.log('PRO thumbnail generation completed!');
}

// Run if called directly
if (require.main === module) {
  generateProThumbnails();
}

module.exports = generateProThumbnails;