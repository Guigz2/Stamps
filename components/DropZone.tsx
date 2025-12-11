'use client';

import { useCallback, useState, DragEvent, ChangeEvent } from 'react';

interface DropZoneProps {
  onPdfUpload: (file: File) => void;
}

export default function DropZone({ onPdfUpload }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        onPdfUpload(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, [onPdfUpload]);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        onPdfUpload(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, [onPdfUpload]);

  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="max-w-2xl w-full space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold text-white tracking-wider">
            INITIATE SEQUENCE
          </h1>
          <p className="text-[#8B92B0] text-lg">
            Upload a PDF document to begin the stamping process.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-16 transition-all ${
            isDragging
              ? 'border-[#FF6B2C] bg-[#FF6B2C]/5'
              : 'border-[#2A3148] hover:border-[#FF6B2C]/50'
          }`}
        >
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            
            {/* Upload Icon */}
            <div className={`mb-6 transition-colors ${
              isDragging ? 'text-[#FF6B2C]' : 'text-[#8B92B0]'
            }`}>
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xl font-bold text-white tracking-wider">
                DROP PDF FILE
              </p>
              <p className="text-[#6B7280] text-xs pt-4">
                or click to browse
              </p>
            </div>
          </label>

          {/* Animated border effect */}
          {isDragging && (
            <div className="absolute inset-0 rounded-lg bg-[#FF6B2C]/5 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Info */}
        <div className="text-center text-xs text-[#6B7280] space-y-1">
          <p>✓ Supports all standard PDF formats</p>
          <p>✓ Stamps will be applied to ALL pages automatically</p>
          <p>✓ Your files are processed locally and never uploaded</p>
        </div>
      </div>
    </div>
  );
}
