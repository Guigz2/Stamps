// Script to copy PDF.js worker to public folder
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const source = join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const dest = join(__dirname, 'public', 'pdf.worker.min.mjs');

try {
  // Ensure public directory exists
  const publicDir = join(__dirname, 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // Copy worker file
  copyFileSync(source, dest);
  console.log('✓ PDF.js worker copied to public folder');
} catch (error) {
  console.error('Failed to copy PDF.js worker:', error);
  process.exit(1);
}
