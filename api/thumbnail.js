const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
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

  const { filename, size = '300' } = req.query;
  
  if (!filename) {
    res.status(400).json({ error: 'Filename is required' });
    return;
  }

  try {
    // For Vercel deployment, we'll use a different approach
    // Since we can't easily access the file system in serverless functions
    // We'll redirect to a CDN or return a placeholder
    
    // For now, let's just return the original image path
    // In production, you'd want to use a proper image optimization service
    const originalPath = `/images/${filename}`;
    
    // Set appropriate headers for image
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // For development, redirect to original
    res.redirect(302, originalPath);
    
  } catch (err) {
    console.error('Error generating thumbnail:', err);
    res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
};