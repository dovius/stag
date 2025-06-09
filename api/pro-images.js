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
    // Read the photo list from foto.txt
    const photoList = [
      '_DSC0001.jpg', '_DSC0003.jpg', '_DSC0004.jpg', '_DSC0005.jpg', '_DSC0007.jpg', '_DSC0009.jpg', '_DSC0011.jpg', '_DSC0013.jpg', '_DSC0016.jpg', '_DSC0017.jpg', '_DSC0018.jpg', '_DSC0020.jpg', '_DSC0024.jpg', '_DSC0026.jpg', '_DSC0028.jpg', '_DSC0029.jpg', '_DSC0031.jpg', '_DSC0033.jpg', '_DSC0036.jpg', '_DSC0038.jpg', '_DSC0039.jpg', '_DSC0040.jpg', '_DSC0042.jpg', '_DSC0045.jpg', '_DSC0047.jpg', '_DSC0048.jpg', '_DSC0049.jpg', '_DSC0051.jpg', '_DSC0053.jpg', '_DSC0056.jpg', '_DSC0057.jpg', '_DSC0059.jpg', '_DSC0061.jpg', '_DSC0062.jpg', '_DSC0063.jpg', '_DSC0065.jpg', '_DSC0066.jpg', '_DSC0067.jpg', '_DSC0069.jpg', '_DSC0070.jpg', '_DSC0074.jpg', '_DSC0075.jpg', '_DSC0076.jpg', '_DSC0078.jpg', '_DSC0079.jpg', '_DSC0081.jpg', '_DSC0082.jpg', '_DSC0084.jpg', '_DSC0087.jpg', '_DSC0088.jpg', '_DSC0090.jpg', '_DSC0091.jpg', '_DSC0092.jpg', '_DSC0093.jpg', '_DSC0094.jpg', '_DSC0097.jpg', '_DSC0100.jpg', '_DSC0101.jpg', '_DSC0103.jpg', '_DSC0105.jpg', '_DSC0106.jpg', '_DSC0109.jpg', '_DSC0112.jpg', '_DSC0113.jpg', '_DSC0114.jpg', '_DSC0115.jpg', '_DSC0116.jpg', '_DSC0119.jpg', '_DSC0120.jpg', '_DSC0121.jpg', '_DSC0122.jpg', '_DSC0123.jpg', '_DSC0125.jpg', '_DSC0126.jpg', '_DSC0127.jpg', '_DSC0128.jpg', '_DSC0129.jpg', '_DSC0130.jpg', '_DSC0131.jpg', '_DSC0134.jpg', '_DSC0137.jpg', '_DSC0140.jpg', '_DSC0145.jpg', '_DSC0147.jpg', '_DSC0149.jpg', '_DSC0150.jpg', '_DSC0151.jpg', '_DSC0153.jpg', '_DSC0154.jpg', '_DSC0155.jpg', '_DSC0157.jpg', '_DSC0159.jpg', '_DSC0160.jpg', '_DSC0161.jpg', '_DSC0162.jpg', '_DSC0164.jpg', '_DSC0165.jpg', '_DSC0166.jpg', '_DSC0168.jpg', '_DSC0169.jpg', '_DSC0171.jpg', '_DSC0173.jpg', '_DSC0174.jpg', '_DSC0175.jpg', '_DSC0176.jpg', '_DSC0177.jpg', '_DSC0178.jpg', '_DSC0179.jpg', '_DSC0180.jpg', '_DSC0181.jpg', '_DSC0182.jpg', '_DSC0183.jpg', '_DSC0184.jpg', '_DSC0185.jpg', '_DSC0186.jpg', '_DSC0188.jpg', '_DSC0191.jpg', '_DSC0194.jpg', '_DSC0195.jpg', '_DSC0197.jpg', '_DSC0198.jpg', '_DSC0200.jpg', '_DSC0203.jpg', '_DSC0204.jpg', '_DSC0207.jpg', '_DSC0209.jpg', '_DSC0211.jpg', '_DSC0212.jpg', '_DSC0213.jpg', '_DSC0214.jpg', '_DSC0215.jpg', '_DSC0216.jpg', '_DSC0217.jpg', '_DSC0218.jpg', '_DSC0219.jpg', '_DSC0222.jpg', '_DSC0224.jpg', '_DSC0226.jpg', '_DSC0229.jpg', '_DSC0231.jpg', '_DSC0233.jpg', '_DSC0234.jpg', '_DSC0236.jpg', '_DSC0238.jpg', '_DSC0239.jpg', '_DSC0242.jpg', '_DSC0243.jpg', '_DSC0244.jpg'
    ];
    
    // Use the CDN URL from foto.txt
    const baseUrl = 'https://pub-3cddef61ee16411e9e008cf603d66ed6.r2.dev/';
    
    // Create image objects with CDN URLs and local thumbnails for preview
    const images = photoList.map((file, index) => {
      // Use local thumbnail for first 4 images (preview), CDN for the rest
      const hasLocalThumb = index < 4;
      return {
        src: `${baseUrl}${file}`,
        thumbnail: hasLocalThumb ? `./images/pro-thumbs/${file}` : `${baseUrl}${file}`,
        alt: `PRO nuotrauka ${index + 1}`,
        filename: file
      };
    });
    
    res.status(200).json(images);
  } catch (err) {
    console.error('Error loading PRO images:', err);
    res.status(500).json({ error: 'Failed to load PRO images' });
  }
};