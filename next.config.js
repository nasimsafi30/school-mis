/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: 'utfs.io' },
    ],
  },
}

module.exports = nextConfig
