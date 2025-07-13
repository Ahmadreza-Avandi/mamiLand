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
    DB_HOST: process.env.DB_HOST || '217.144.107.147',
    DB_USER: process.env.DB_USER || 'hxkxytfs_ahmad',
    DB_PASSWORD: process.env.DB_PASSWORD || 'Avan.1386',
    DB_NAME: process.env.DB_NAME || 'hxkxytfs_mami',
    JWT_SECRET: process.env.JWT_SECRET || 'mamiland_secret_key_2024',
    LANGCHAIN_API_URL: process.env.LANGCHAIN_API_URL || 'https://mine-gpt-alpha.vercel.app/proxy',
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
