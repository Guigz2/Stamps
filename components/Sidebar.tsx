'use client';

import { ChangeEvent, useState, useRef, useEffect } from 'react';

interface SidebarProps {
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
  onConfigChange: (config: Partial<SidebarProps['config']>) => void;
  onReset: () => void;
  hasPdf: boolean;
  pdfFile?: File | null;
  currentPage?: number;
  numPages?: number;
  onPageChange?: (page: number) => void;
  onDownload?: () => void;
  isProcessing?: boolean;
}

export default function Sidebar({ 
  config, 
  onConfigChange, 
  onReset, 
  hasPdf, 
  pdfFile, 
  currentPage = 1, 
  numPages = 1, 
  onPageChange, 
  onDownload, 
  isProcessing = false 
}: SidebarProps) {
  const [editingField, setEditingField] = useState<'size' | 'xOffset' | 'yOffset' | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onConfigChange({ stampImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = (field: 'size' | 'xOffset' | 'yOffset', currentValue: number) => {
    setEditingField(field);
    setEditValue(String(currentValue));
  };

  const finishEditing = (field: 'size' | 'xOffset' | 'yOffset', min: number, max: number) => {
    const numValue = Number(editValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onConfigChange({ [field]: clampedValue });
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'size' | 'xOffset' | 'yOffset', min: number, max: number) => {
    if (e.key === 'Enter') {
      finishEditing(field, min, max);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setEditValue('');
    }
  };

  return (
    <aside className="w-80 bg-[#0D1128] border-r border-[#2A3148] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#2A3148]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-bold text-lg tracking-wider">CONFIGURATION</h2>
          {hasPdf && (
            <button
              onClick={onReset}
              className="text-[#8B92B0] hover:text-red-400 transition-colors"
              title="Reset"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stamp Type */}
        <div>
          <label className="block text-[#8B92B0] text-xs font-semibold mb-3 tracking-wider">
            STAMP TYPE
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onConfigChange({ stampType: 'text' })}
              className={`px-4 py-3 border transition-all ${
                config.stampType === 'text'
                  ? 'bg-[#FF6B2C] border-[#FF6B2C] text-white'
                  : 'bg-[#1A1F3A] border-[#2A3148] text-[#8B92B0] hover:border-[#FF6B2C]'
              }`}
            >
              <span className="flex items-center justify-center gap-2 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                TEXT
              </span>
            </button>
            <button
              onClick={() => onConfigChange({ stampType: 'image' })}
              className={`px-4 py-3 border transition-all ${
                config.stampType === 'image'
                  ? 'bg-[#FF6B2C] border-[#FF6B2C] text-white'
                  : 'bg-[#1A1F3A] border-[#2A3148] text-[#8B92B0] hover:border-[#FF6B2C]'
              }`}
            >
              <span className="flex items-center justify-center gap-2 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                IMAGE
              </span>
            </button>
          </div>
        </div>

        {/* Text Configuration */}
        {config.stampType === 'text' && (
          <>
            <div>
              <label className="block text-[#8B92B0] text-xs font-semibold mb-3 tracking-wider">
                INITIALS
              </label>
              <input
                type="text"
                value={config.initials}
                onChange={(e) => onConfigChange({ initials: e.target.value })}
                className="w-full px-4 py-3 bg-[#1A1F3A] border border-[#2A3148] text-white focus:border-[#FF6B2C] focus:outline-none transition-colors font-mono"
                placeholder="ABC"
              />
            </div>

            <div>
              <label className="block text-[#8B92B0] text-xs font-semibold mb-3 tracking-wider">
                FONT
              </label>
              <select
                value={config.font}
                onChange={(e) => onConfigChange({ font: e.target.value })}
                className="w-full px-4 py-3 bg-[#1A1F3A] border border-[#2A3148] text-white focus:border-[#FF6B2C] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="handwritten" style={{ fontFamily: 'cursive' }}>Handwritten</option>
                <option value="helvetica" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Helvetica</option>
                <option value="courier" style={{ fontFamily: 'Courier, monospace' }}>Courier</option>
                <option value="times" style={{ fontFamily: 'Times New Roman, serif' }}>Times</option>
              </select>
            </div>
          </>
        )}

        {/* Image Configuration */}
        {config.stampType === 'image' && (
          <div>
            <label className="block text-[#8B92B0] text-xs font-semibold mb-3 tracking-wider">
              STAMP IMAGE
            </label>
            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="px-4 py-3 bg-[#1A1F3A] border border-[#2A3148] text-[#8B92B0] hover:border-[#FF6B2C] transition-colors cursor-pointer text-center text-sm font-semibold">
                  {config.stampImage ? '✓ Image Loaded' : '+ Upload Image'}
                </div>
              </label>
              {config.stampImage && (
                <div className="relative">
                  <img
                    src={config.stampImage}
                    alt="Stamp preview"
                    className="w-full h-24 object-contain bg-[#1A1F3A] border border-[#2A3148] p-2"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Size */}
        <div>
          <label className="flex justify-between items-center text-[#8B92B0] text-xs font-semibold mb-3 tracking-wider">
            <span>SIZE (Px/PT)</span>
            {editingField === 'size' ? (
              <input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => finishEditing('size', 6, 200)}
                onKeyDown={(e) => handleKeyDown(e, 'size', 6, 200)}
                className="w-16 px-2 py-1 bg-[#1A1F3A] border border-[#FF6B2C] text-[#FF6B2C] text-right focus:outline-none"
                min="6"
                max="200"
              />
            ) : (
              <span 
                className="text-[#FF6B2C] cursor-pointer hover:bg-[#FF6B2C] hover:text-white px-2 py-1 transition-colors"
                onDoubleClick={() => startEditing('size', config.size)}
                title="Double-click to edit"
              >
                {config.size}
              </span>
            )}
          </label>
          <input
            type="range"
            min="6"
            max="200"
            value={config.size}
            onChange={(e) => onConfigChange({ size: Number(e.target.value) })}
            className="w-full h-2 bg-[#1A1F3A] appearance-none cursor-pointer slider"
            style={{ '--value': `${((config.size - 6) / (200 - 6)) * 100}%` } as React.CSSProperties}
          />
        </div>

        {/* Coordinate System Info */}
        <div className="p-3 bg-[#1A1F3A] border border-[#2A3148] ">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[#FF6B2C] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-[#8B92B0]">
              <p className="font-semibold mb-1">Coordinate System:</p>
              <p className="text-[#6B7280]">Origin (0,0) is at <span className="text-[#FF6B2C]">bottom-right</span> corner</p>
            </div>
          </div>
        </div>

        {/* X Offset */}
        <div>
          <label className="flex justify-between items-center text-[#8B92B0] text-xs font-semibold mb-3 tracking-wider">
            <span>X OFFSET (RIGHT)</span>
            {editingField === 'xOffset' ? (
              <input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => finishEditing('xOffset', 5, 600)}
                onKeyDown={(e) => handleKeyDown(e, 'xOffset', 5, 600)}
                className="w-16 px-2 py-1 bg-[#1A1F3A] border border-[#FF6B2C] text-[#FF6B2C] text-right focus:outline-none"
                min="5"
                max="600"
              />
            ) : (
              <span 
                className="text-[#FF6B2C] cursor-pointer hover:bg-[#FF6B2C] hover:text-white px-2 py-1 transition-colors"
                onDoubleClick={() => startEditing('xOffset', config.xOffset)}
                title="Double-click to edit"
              >
                {config.xOffset}
              </span>
            )}
          </label>
          <input
            type="range"
            min="5"
            max="600"
            value={config.xOffset}
            onChange={(e) => onConfigChange({ xOffset: Number(e.target.value) })}
            className="w-full h-2 bg-[#1A1F3A] appearance-none cursor-pointer slider"
            style={{ '--value': `${((config.xOffset - 5) / (600 - 5)) * 100}%` } as React.CSSProperties}
          />
        </div>

        {/* Y Offset */}
        <div>
          <label className="flex justify-between items-center text-[#8B92B0] text-xs font-semibold mb-3 tracking-wider">
            <span>Y OFFSET (BOTTOM)</span>
            {editingField === 'yOffset' ? (
              <input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => finishEditing('yOffset', 5, 900)}
                onKeyDown={(e) => handleKeyDown(e, 'yOffset', 5, 900)}
                className="w-16 px-2 py-1 bg-[#1A1F3A] border border-[#FF6B2C] text-[#FF6B2C] text-right focus:outline-none"
                min="5"
                max="900"
              />
            ) : (
              <span 
                className="text-[#FF6B2C] cursor-pointer hover:bg-[#FF6B2C] hover:text-white px-2 py-1 transition-colors"
                onDoubleClick={() => startEditing('yOffset', config.yOffset)}
                title="Double-click to edit"
              >
                {config.yOffset}
              </span>
            )}
          </label>
          <input
            type="range"
            min="5"
            max="900"
            value={config.yOffset}
            onChange={(e) => onConfigChange({ yOffset: Number(e.target.value) })}
            className="w-full h-2 bg-[#1A1F3A] appearance-none cursor-pointer slider"
            style={{ '--value': `${((config.yOffset - 5) / (900 - 5)) * 100}%` } as React.CSSProperties}
          />
        </div>

        {/* Page Navigation - Only show if PDF is loaded */}
        {hasPdf && numPages > 1 && onPageChange && (
          <div className="pt-6 border-t border-[#2A3148]">
            <label className="block text-[#8B92B0] text-xs font-semibold mb-3 tracking-wider">
              PAGE NAVIGATION
            </label>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-[#1A1F3A] border border-[#2A3148] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FF6B2C] transition-colors flex-1 text-sm"
              >
                ← Prev
              </button>
              <span className="text-white font-mono text-sm px-2">
                {currentPage}/{numPages}
              </span>
              <button
                onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
                disabled={currentPage === numPages}
                className="px-3 py-2 bg-[#1A1F3A] border border-[#2A3148] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FF6B2C] transition-colors flex-1 text-sm"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Download Button - Only show if PDF is loaded */}
      {hasPdf && onDownload && (
        <div className="p-6 border-t border-[#2A3148]">
          <button
            onClick={onDownload}
            disabled={isProcessing || (config.stampType === 'image' && !config.stampImage)}
            className="w-full bg-[#FF6B2C] hover:bg-[#FF7A3D] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 transition-all flex items-center justify-center gap-3 tracking-wider shadow-lg"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                PROCESSING...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                DOWNLOAD PDF
              </>
            )}
          </button>
          {pdfFile && (
            <p className="text-[#6B7280] text-xs text-center mt-3">
              Stamps all {numPages} pages
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
