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
      // Embed image
      const imageBytes = await fetch(config.stampImage).then(res => res.arrayBuffer());
      
      if (config.stampImage.includes('png')) {
        stampImage = await pdfDoc.embedPng(imageBytes);
      } else {
        stampImage = await pdfDoc.embedJpg(imageBytes);
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
