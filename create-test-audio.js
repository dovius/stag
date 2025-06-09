const fs = require('fs');

// Create a proper WAV file instead of MP3 for testing
// WAV header for 1 second of silence at 44.1kHz, 16-bit, mono
const wavHeader = Buffer.from([
  0x52, 0x49, 0x46, 0x46, // "RIFF"
  0x2C, 0xAC, 0x00, 0x00, // File size - 8 (44136 bytes)
  0x57, 0x41, 0x56, 0x45, // "WAVE"
  0x66, 0x6D, 0x74, 0x20, // "fmt "
  0x10, 0x00, 0x00, 0x00, // Subchunk1Size (16)
  0x01, 0x00,             // AudioFormat (PCM)
  0x01, 0x00,             // NumChannels (1)
  0x44, 0xAC, 0x00, 0x00, // SampleRate (44100)
  0x88, 0x58, 0x01, 0x00, // ByteRate (88200)
  0x02, 0x00,             // BlockAlign (2)
  0x10, 0x00,             // BitsPerSample (16)
  0x64, 0x61, 0x74, 0x61, // "data"
  0x08, 0xAC, 0x00, 0x00  // Subchunk2Size (44040)
]);

// Add 1 second of silence (44100 samples * 2 bytes each)
const silenceData = Buffer.alloc(44100 * 2, 0);

const wavFile = Buffer.concat([wavHeader, silenceData]);

// Update HTML to use WAV instead of MP3
const htmlContent = fs.readFileSync('./public/index.html', 'utf8');
const updatedHtml = htmlContent.replace(
  '<source src="./bobr.mp3" type="audio/mpeg">',
  '<source src="./test-audio.wav" type="audio/wav">'
);

fs.writeFileSync('./public/test-audio.wav', wavFile);
fs.writeFileSync('./public/index.html', updatedHtml);

console.log('Created test-audio.wav file and updated HTML');