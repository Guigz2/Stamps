'use client';

import { useEffect, useState, useRef } from 'react';
import { stampPdf } from '@/lib/pdfProcessor';

interface PreviewZoneProps {
  pdfFile: File;
  config: {
    stampType: 'text' | 'image';
    initials: string;
    stampImage: string | null;
    font: string;
    size: number;
    xOffset: number;
    yOffset: number;
    opacity: number;
  };
  onClose: () => void;
  onPdfInfoChange?: (info: { currentPage: number; numPages: number; isProcessing: boolean }) => void;
  onRegisterProcessHandler?: (handler: () => void) => void;
  externalCurrentPage?: number;
  onConfigChange: (newConfig: Partial<PreviewZoneProps['config']>) => void;
}

export default function PreviewZone({ 
  pdfFile, 
  config, 
  onClose,
  onPdfInfoChange,
  onRegisterProcessHandler,
  externalCurrentPage,
  onConfigChange
}: PreviewZoneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const pdfjsLibRef = useRef<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Interactive stamp positioning
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [stampPosition, setStampPosition] = useState({ x: 0, y: 0 }); // Position relative to canvas (top-left)
  const [stampDimensions, setStampDimensions] = useState({ width: 0, height: 0 });
  const [stampSize, setStampSize] = useState(config.size);
  
  // Sync with external page changes (from Sidebar navigation)
  useEffect(() => {
    if (externalCurrentPage !== undefined && externalCurrentPage !== currentPage) {
      setCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage]);
  
  // Calculate stamp dimensions and position from config
  useEffect(() => {
    if (canvasRef.current && scale) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const fontSize = config.size * scale;
      
      if (config.stampType === 'text') {
        // Measure text dimensions
        const fontFamily = {
          handwritten: 'Caveat, cursive',
          helvetica: 'Helvetica, Arial, sans-serif',
          courier: 'Courier New, monospace',
          times: 'Times New Roman, serif',
        }[config.font] || 'Arial';
        
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'alphabetic'; // Use alphabetic baseline to match pdf-lib
        
        const metrics = ctx.measureText(config.initials);
        const textWidth = metrics.width;
        
        // Get accurate text height from metrics
        const actualBoundingBoxAscent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
        const actualBoundingBoxDescent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
        
        // Caveat font has extra space and slanted characters - adjust for handwritten font only
        const extraHeight = config.font === 'handwritten' ? fontSize * 0 : 0;
        const extraWidth = config.font === 'handwritten' ? fontSize * 0.12 : 0;
        const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent + extraHeight;
        const adjustedWidth = textWidth + extraWidth;
        
        // Position where text baseline will be (bottom-right origin)
        // pdf-lib uses alphabetic baseline by default
        const baselineX = canvas.width - config.xOffset * scale;
        const baselineY = canvas.height - config.yOffset * scale;
        
        // Calculate top-left corner of the text bounding box
        const x = baselineX - textWidth;
        const y = baselineY - actualBoundingBoxAscent;
        
        setStampPosition({ x, y });
        setStampDimensions({ width: adjustedWidth, height: textHeight });
      } else if (config.stampType === 'image' && config.stampImage) {
        // For images, load and calculate dimensions based on aspect ratio
        const img = new Image();
        img.src = config.stampImage;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const stampWidth = config.size * scale * aspectRatio;
          const stampHeight = config.size * scale;
          
          const bottomRightX = canvas.width - config.xOffset * scale;
          const bottomRightY = canvas.height - config.yOffset * scale;
          
          const x = bottomRightX - stampWidth;
          const y = bottomRightY - stampHeight;
          
          setStampPosition({ x, y });
          setStampDimensions({ width: stampWidth, height: stampHeight });
        };
      }
      
      setStampSize(config.size);
    }
  }, [config.xOffset, config.yOffset, config.size, config.stampType, config.initials, config.font, config.stampImage, scale, canvasRef.current?.width, canvasRef.current?.height]);

  // Initialize PDF.js library
  useEffect(() => {
    const initPdfJs = async () => {
      if (!pdfjsLibRef.current) {
        const pdfjs = await import('pdfjs-dist');
        // Use local worker file from public directory
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        pdfjsLibRef.current = pdfjs;
        setIsLoading(false);
      }
    };
    initPdfJs();
  }, []);

  // Notify parent of state changes
  useEffect(() => {
    if (onPdfInfoChange) {
      onPdfInfoChange({ currentPage, numPages, isProcessing });
    }
  }, [currentPage, numPages, isProcessing, onPdfInfoChange]);
  
  // Register process handler with parent
  useEffect(() => {
    if (onRegisterProcessHandler) {
      onRegisterProcessHandler(() => handleProcess);
    }
  }, [onRegisterProcessHandler, config, pdfFile]);

  // Load PDF
  useEffect(() => {
    if (!pdfjsLibRef.current) return;
    
    const loadPdf = async () => {
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const loadingTask = pdfjsLibRef.current.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Failed to load PDF');
      }
    };

    loadPdf();
  }, [pdfFile, pdfjsLibRef.current]);

  // Calculate scale to fit entire page in viewport (both width and height)
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    const calculateScale = async () => {
      try {
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const containerWidth = containerRef.current!.clientWidth - 100;
        const containerHeight = containerRef.current!.clientHeight - 100;
        
        // Scale to fit BOTH width AND height - use the smaller scale to ensure entire page is visible
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        const optimalScale = Math.min(scaleX, scaleY, 1.5); // Max 1.5x, min of both dimensions
        
        setScale(optimalScale);
      } catch (error) {
        console.error('Error calculating scale:', error);
      }
    };

    calculateScale();

    // Recalculate on window resize
    const handleResize = () => calculateScale();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !scale) return;

    let renderTask: any = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Cancel previous render if it exists
        if (renderTask) {
          renderTask.cancel();
        }

        renderTask = page.render(renderContext as any);
        await renderTask.promise;

        // Draw stamp preview
        await drawStampPreview(context, viewport.width, viewport.height, scale);
      } catch (error: any) {
        if (error?.name === 'RenderingCancelledException') {
          // Render was cancelled, this is normal
          return;
        }
        console.error('Error rendering page:', error);
      }
    };

    renderPage();

    // Cleanup function to cancel render on unmount
    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, config, scale]);

  const drawStampPreview = async (ctx: CanvasRenderingContext2D, pageWidth: number, pageHeight: number, currentScale: number) => {
    ctx.save();
    ctx.globalAlpha = config.opacity / 100;

    // Calculate position (0,0 is bottom-right in PDF coordinates)
    const x = pageWidth - config.xOffset * currentScale;
    const y = pageHeight - config.yOffset * currentScale;

    if (config.stampType === 'text') {
      // Draw text stamp
      const fontFamily = {
        handwritten: 'Caveat, cursive',
        helvetica: 'Helvetica, Arial, sans-serif',
        courier: 'Courier New, monospace',
        times: 'Times New Roman, serif',
      }[config.font] || 'Arial';

      const fontSize = config.size * currentScale;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'alphabetic'; // Use alphabetic baseline to match pdf-lib
      ctx.fillText(config.initials, x, y);
    } else if (config.stampType === 'image' && config.stampImage) {
      // Draw image stamp - wait for image to load
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = config.stampImage!;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const stampWidth = config.size * currentScale * aspectRatio;
          const stampHeight = config.size * currentScale;
          ctx.drawImage(img, x - stampWidth, y - stampHeight, stampWidth, stampHeight);
          ctx.restore();
          resolve();
        };
        img.onerror = () => {
          ctx.restore();
          resolve();
        };
      });
    }

    ctx.restore();
  };

  // Handle stamp dragging
  const handleStampMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - stampPosition.x,
      y: e.clientY - stampPosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;
      
      // Constrain within canvas bounds
      newX = Math.max(0, Math.min(canvas.width - stampDimensions.width, newX));
      newY = Math.max(0, Math.min(canvas.height - stampDimensions.height, newY));
      
      setStampPosition({ x: newX, y: newY });
      
      // Update config with new offsets (convert from top-left to bottom-right baseline)
      if (config.stampType === 'text') {
        // For text, calculate the baseline position
        // The overlay top is at baseline - ascent, so baseline = top + ascent
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          const fontSize = config.size * scale;
          const fontFamily = {
            handwritten: 'Caveat, cursive',
            helvetica: 'Helvetica, Arial, sans-serif',
            courier: 'Courier New, monospace',
            times: 'Times New Roman, serif',
          }[config.font] || 'Arial';
          
          ctx.font = `${fontSize}px ${fontFamily}`;
          const metrics = ctx.measureText(config.initials);
          const actualBoundingBoxAscent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
          
          const baselineX = newX + stampDimensions.width; // Right edge
          const baselineY = newY + actualBoundingBoxAscent; // Baseline
          
          const xOffset = Math.round((canvas.width - baselineX) / scale);
          const yOffset = Math.round((canvas.height - baselineY) / scale);
          onConfigChange({ xOffset, yOffset });
        }
      } else {
        // For images, use bottom-right corner
        const bottomRightX = newX + stampDimensions.width;
        const bottomRightY = newY + stampDimensions.height;
        
        const xOffset = Math.round((canvas.width - bottomRightX) / scale);
        const yOffset = Math.round((canvas.height - bottomRightY) / scale);
        onConfigChange({ xOffset, yOffset });
      }
    }
    
    if (isResizing && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const centerX = stampPosition.x + stampDimensions.width / 2;
      const centerY = stampPosition.y + stampDimensions.height / 2;
      
      const distX = e.clientX - rect.left - centerX;
      const distY = e.clientY - rect.top - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);
      
      const newSize = Math.max(10, Math.min(200, Math.round(dist / scale)));
      setStampSize(newSize);
      onConfigChange({ size: newSize });
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const stampedPdfBytes = await stampPdf(pdfFile, config);
      
      // Download the stamped PDF
      const blob = new Blob([stampedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stamped_${pdfFile.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state
  if (isLoading || !pdfDoc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0E27]">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-[#FF6B2C] mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-lg">Loading PDF viewer...</p>
          <p className="text-[#8B92B0] text-sm">Initializing rendering engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-[#0D1128] border-b border-[#2A3148] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-bold tracking-wider">{pdfFile.name}</h2>
          <span className="text-[#8B92B0] text-sm">
            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#8B92B0] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview Area - Full Page PDF Display */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-auto bg-[#0A0E27] p-8"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="mx-auto flex justify-center">
          <div className="bg-white rounded-lg shadow-2xl relative">
            <canvas ref={canvasRef} />
            
            {/* Interactive Stamp Overlay */}
            {canvasRef.current && stampDimensions.width > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${stampPosition.x}px`,
                  top: `${stampPosition.y}px`,
                  width: `${stampDimensions.width}px`,
                  height: `${stampDimensions.height}px`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  border: '2px dashed #FF6B2C',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 107, 44, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  zIndex: 10,
                }}
                onMouseDown={handleStampMouseDown}
              >
                {/* Stamp Preview - Only show image preview, not text (text is already on canvas) */}
                {config.stampType === 'image' && config.stampImage && (
                  <img 
                    src={config.stampImage} 
                    alt="Stamp preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      opacity: 0.7,
                      pointerEvents: 'none',
                    }}
                  />
                )}
                
                {/* Resize Handle */}
                <div
                  style={{
                    position: 'absolute',
                    right: '-6px',
                    bottom: '-6px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#FF6B2C',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'nwse-resize',
                    zIndex: 11,
                  }}
                  onMouseDown={handleResizeMouseDown}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
