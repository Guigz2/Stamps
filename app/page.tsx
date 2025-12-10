'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import DropZone from '@/components/DropZone';
import Logo from '@/components/Logo';

// Import PreviewZone dynamically to avoid SSR issues with pdf.js
const PreviewZone = dynamic(() => import('@/components/PreviewZone'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-white">Loading PDF viewer...</div>
    </div>
  ),
});

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [config, setConfig] = useState({
    stampType: 'text' as 'text' | 'image',
    initials: 'ABC',
    stampImage: null as string | null,
    font: 'handwritten',
    size: 24,
    xOffset: 50,
    yOffset: 50,
    opacity: 100,
  });
  
  // PDF state from PreviewZone
  const [pdfInfo, setPdfInfo] = useState({
    currentPage: 1,
    numPages: 0,
    isProcessing: false,
  });
  
  // Handler for processing/downloading PDF
  const [processHandler, setProcessHandler] = useState<(() => void) | null>(null);

  const handlePdfUpload = useCallback((file: File) => {
    setPdfFile(file);
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const handleReset = useCallback(() => {
    setPdfFile(null);
    setConfig({
      stampType: 'text',
      initials: 'ABC',
      stampImage: null,
      font: 'handwritten',
      size: 24,
      xOffset: 50,
      yOffset: 50,
      opacity: 100,
    });
    setPdfInfo({
      currentPage: 1,
      numPages: 0,
      isProcessing: false,
    });
  }, []);
  
  const handlePageChange = useCallback((page: number) => {
    setPdfInfo(prev => ({ ...prev, currentPage: page }));
  }, []);
  
  const handleDownload = useCallback(() => {
    if (processHandler) {
      processHandler();
    }
  }, [processHandler]);

  return (
    <div className="flex h-screen bg-[#0A0E27] flex-col">
      {/* Header */}
      <header className="bg-[#0D1128] border-b border-[#2A3148] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <div>
            <h1 className="text-white font-bold text-xl tracking-wider">STAMP.OS</h1>
            <p className="text-[#8B92B0] text-xs">v1.0</p>
          </div>
        </div>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#8B92B0] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          config={config} 
          onConfigChange={handleConfigChange}
          onReset={handleReset}
          hasPdf={!!pdfFile}
          pdfFile={pdfFile}
          currentPage={pdfInfo.currentPage}
          numPages={pdfInfo.numPages}
          onPageChange={handlePageChange}
          onDownload={handleDownload}
          isProcessing={pdfInfo.isProcessing}
        />
        
        <main className="flex-1 flex flex-col">
          {!pdfFile ? (
            <DropZone onPdfUpload={handlePdfUpload} />
          ) : (
            <PreviewZone 
              pdfFile={pdfFile} 
              config={config}
              onClose={() => setPdfFile(null)}
              onPdfInfoChange={setPdfInfo}
              onRegisterProcessHandler={setProcessHandler}
              externalCurrentPage={pdfInfo.currentPage}
              onConfigChange={handleConfigChange}
            />
          )}
          
          <footer className="px-10 py-4 border-t border-[#2A3148] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider text-[#8B92B0]">SYSTEM_ONLINE</span>
          </div>
          <div className="text-xs text-[#8B92B0] tracking-wide">
            © 2025 STAMP.OS // PRECISION PDF TOOLS
          </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
