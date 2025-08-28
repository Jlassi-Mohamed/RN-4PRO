/** @type {import('next').NextConfig} */
const config = {
  // REQUIRED for Docker deployment
  output: 'standalone',
  
  // Optional but recommended optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Image optimization (set to true if you use next/image)
  images: {
    unoptimized: true, // Better for Docker
  },
  
  // Enable if you need CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  // Environment variables (optional)
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
};

export default config;
