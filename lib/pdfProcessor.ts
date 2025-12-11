import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

interface StampConfig {
  stampType: 'text' | 'image';
  initials: string;
  stampImage: string | null;
  font: string;
  size: number;
  xOffset: number;
  yOffset: number;
  opacity: number;
}

// Convert any image to PNG ArrayBuffer using Canvas
async function convertImageToPng(dataUrl: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas with image dimensions
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to blob'));
            return;
          }
          
          // Convert blob to ArrayBuffer
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as ArrayBuffer);
          };
          reader.onerror = () => reject(new Error('Failed to read blob'));
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

export async function stampPdf(file: File, config: StampConfig): Promise<Uint8Array> {
  try {
    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Register fontkit to support custom fonts
    pdfDoc.registerFontkit(fontkit);
    
    // Get all pages
    const pages = pdfDoc.getPages();
    
    // Prepare stamp based on type
    let stampImage;
    let stampFont;
    
    if (config.stampType === 'text') {
      // Select font
      switch (config.font) {
        case 'helvetica':
          stampFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          break;
        case 'courier':
          stampFont = await pdfDoc.embedFont(StandardFonts.Courier);
          break;
        case 'times':
          stampFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
          break;
        case 'handwritten':
          // Load custom handwritten font
          try {
            console.log('Loading handwritten font...');
            const response = await fetch('/fonts/Caveat-Regular.ttf');
            console.log('Font fetch response:', response.ok, response.status);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch font: ${response.status}`);
            }
            
            const fontBytes = await response.arrayBuffer();
            console.log('Font bytes loaded:', fontBytes.byteLength, 'bytes');
            
            stampFont = await pdfDoc.embedFont(fontBytes);
            console.log('Custom font embedded successfully!');
          } catch (error) {
            console.error('Failed to load custom font, using fallback:', error);
            stampFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
          }
          break;
        default:
          stampFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
    } else if (config.stampType === 'image' && config.stampImage) {
      // Embed image - Convert to clean PNG format for maximum compatibility
      try {
        console.log('Processing image stamp...');
        console.log('Original image data URL length:', config.stampImage.length);
        
        // Convert any image format to PNG using Canvas (works on all browsers/devices)
        console.log('Converting image to PNG format...');
        const imageBytes = await convertImageToPng(config.stampImage);
        console.log('Converted to PNG ArrayBuffer:', imageBytes.byteLength, 'bytes');
        
        // Embed PNG into PDF
        console.log('Embedding PNG into PDF...');
        stampImage = await pdfDoc.embedPng(imageBytes);
        console.log('PNG embedded successfully');
      } catch (imageError) {
        console.error('Failed to embed image:', imageError);
        throw new Error(`Failed to embed stamp image: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
      }
    }
    
    // Apply stamp to ALL pages
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Calculate position (0,0 is bottom-right for user, but bottom-left in PDF coordinates)
      const x = width - config.xOffset;
      const y = config.yOffset; // PDF.js uses bottom-left as origin
      
      const opacity = config.opacity / 100;
      
      if (config.stampType === 'text' && stampFont) {
        // Draw text stamp
        const textWidth = stampFont.widthOfTextAtSize(config.initials, config.size);
        
        page.drawText(config.initials, {
          x: x - textWidth, // Align to the right
          y: y,
          size: config.size,
          font: stampFont,
          color: rgb(0, 0, 0),
          opacity: opacity,
        });
      } else if (config.stampType === 'image' && stampImage) {
        // Draw image stamp
        const aspectRatio = stampImage.width / stampImage.height;
        const stampWidth = config.size * aspectRatio;
        const stampHeight = config.size;
        
        page.drawImage(stampImage, {
          x: x - stampWidth, // Align to the right
          y: y,
          width: stampWidth,
          height: stampHeight,
          opacity: opacity,
        });
      }
    }
    
    // Save the stamped PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error in stampPdf:', error);
    throw new Error('Failed to stamp PDF');
  }
}
