/** @type {import('next').NextConfig} */
const nextConfig = {
  // تنظیمات برای Vercel
  trailingSlash: false,
  images: {
    unoptimized: true,
    domains: ['images.pexels.com']
  },
  experimental: {
    esmExternals: false
  },
  // Environment variables برای Vercel
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    LANGCHAIN_API_URL: process.env.LANGCHAIN_API_URL,
  },
  // Webpack config برای MySQL
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('mysql2')
    }
    return config
  }
}

module.exports = nextConfig