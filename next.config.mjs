import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  allowedDevOrigins: ['10.5.0.2', 'localhost'],
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: '/discharge-dashboard',
        destination: '/insurance',
        permanent: true,
      },
      {
        source: '/discharge-dashboard/:path*',
        destination: '/insurance/:path*',
        permanent: true,
      },
    ]
  },
};
export default nextConfig;

