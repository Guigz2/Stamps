import type { NextConfig } from "next";

/** 
const nextConfig: NextConfig = {
  /* config options here 
};

export default nextConfig;
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // ✅ Obligatoire pour Next.js 13+
  },
};

module.exports = nextConfig;
