const fs = require('fs');

// Create a minimal valid MP3 file header
// This creates a very short silent MP3 file
const mp3Header = Buffer.from([
  0xFF, 0xFB, 0x90, 0x00, // MP3 frame header
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  // Add some padding to make it a valid file
  ...Array(100).fill(0x00)
]);

fs.writeFileSync('./public/bobr.mp3', mp3Header);
console.log('Created dummy bobr.mp3 file');