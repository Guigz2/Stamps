import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontDir = path.join(__dirname, 'public', 'fonts');
const fontPath = path.join(fontDir, 'Caveat-Regular.ttf');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
}

console.log('Fetching font URL from Google Fonts API...');

// First, get the CSS from Google Fonts to find the actual font URL
https.get('https://fonts.googleapis.com/css2?family=Caveat:wght@400&display=swap', (cssResponse) => {
  let cssData = '';
  
  cssResponse.on('data', (chunk) => {
    cssData += chunk;
  });
  
  cssResponse.on('end', () => {
    // Extract the font URL from the CSS
    const urlMatch = cssData.match(/url\((https:\/\/fonts\.gstatic\.com\/[^\)]+\.ttf)\)/);
    
    if (!urlMatch) {
      console.error('Could not find font URL in CSS');
      process.exit(1);
    }
    
    const fontUrl = urlMatch[1];
    console.log('Found font URL:', fontUrl);
    console.log('Downloading font...');
    
    // Download the actual font file
    https.get(fontUrl, (fontResponse) => {
      if (fontResponse.statusCode === 200) {
        const fileStream = fs.createWriteStream(fontPath);
        fontResponse.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(fontPath);
          console.log(`✓ Handwritten font downloaded successfully (${stats.size} bytes)`);
        });
      } else {
        console.error(`Error: HTTP ${fontResponse.statusCode}`);
        process.exit(1);
      }
    }).on('error', (err) => {
      console.error('Error downloading font:', err.message);
      process.exit(1);
    });
  });
}).on('error', (err) => {
  console.error('Error fetching CSS:', err.message);
  process.exit(1);
});
