/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    if (dev) {
      // Only apply watchOptions in development
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/C:/Users/**/Application Data/**',
          '**/C:/Users/**/AppData/**',
          '**/C:/Users/**/Local/**',
          '**/C:/Users/**/Roaming/**',
          '**/C:/ProgramData/**',
          '**/C:/Windows/**',
          '**/C:/Program Files/**',
          '**/C:/Program Files (x86)/**',
        ],
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay rebuild by 300ms
      }
    }
    
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }
    
    return config
  },
  // Disable webpack 5 warnings about fallbacks
  experimental: {
    webpackBuildWorker: false,
  },
}

export default nextConfig
