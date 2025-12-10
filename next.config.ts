import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack explicitly
  turbopack: {},
  
  // Optimize external packages
  experimental: {
    optimizePackageImports: ['pdfjs-dist'],
  },
  
  // Webpack configuration for fallback
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle pdfjs-dist on the server
      config.externals = config.externals || [];
      config.externals.push('pdfjs-dist');
      config.externals.push('canvas');
    }
    
    // Disable DOMMatrix on server-side
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
