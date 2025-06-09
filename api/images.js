const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // In Vercel, we need to look in the public folder or use a different approach
    // For now, let's return the hardcoded list of images we know exist
    const imageFiles = [
      'CIMG4571.JPG', 'CIMG4572.JPG', 'CIMG4573.JPG', 'CIMG4574.JPG', 'CIMG4575.JPG',
      'CIMG4576.JPG', 'CIMG4577.JPG', 'CIMG4578.JPG', 'CIMG4579.JPG', 'CIMG4580.JPG',
      'CIMG4581.JPG', 'CIMG4582.JPG', 'CIMG4583.JPG', 'CIMG4584.JPG', 'CIMG4585.JPG',
      'CIMG4586.JPG', 'CIMG4587.JPG', 'CIMG4588.JPG', 'CIMG4589.JPG', 'CIMG4590.JPG',
      'CIMG4591.JPG', 'CIMG4592.JPG', 'CIMG4593.JPG', 'CIMG4594.JPG', 'CIMG4595.JPG',
      'CIMG4596.JPG', 'CIMG4597.JPG', 'CIMG4598.JPG', 'CIMG4599.JPG', 'CIMG4600.JPG',
      'CIMG4601.JPG', 'CIMG4602.JPG', 'CIMG4603.JPG', 'CIMG4604.JPG', 'CIMG4605.JPG',
      'CIMG4606.JPG', 'CIMG4607.JPG', 'CIMG4608.JPG', 'CIMG4609.JPG', 'CIMG4610.JPG',
      'CIMG4611.JPG', 'CIMG4612.JPG', 'CIMG4613.JPG', 'CIMG4614.JPG', 'CIMG4615.JPG',
      'CIMG4616.JPG', 'CIMG4618.JPG', 'CIMG4620.JPG', 'CIMG4621.JPG', 'CIMG4622.JPG',
      'CIMG4623.JPG', 'CIMG4624.JPG', 'CIMG4625.JPG', 'CIMG4626.JPG'
    ];
    
    // Create image objects with src, thumbnail, and alt
    const images = imageFiles.map((file, index) => ({
      src: `./images/${file}`,
      // Use optimized thumbnails for preview
      thumbnail: `./images/thumbs/${file}`,
      alt: `Bernvakario akimirka ${index + 1}`,
      filename: file
    }));
    
    res.status(200).json(images);
  } catch (err) {
    console.error('Error loading images:', err);
    res.status(500).json({ error: 'Failed to load images' });
  }
};