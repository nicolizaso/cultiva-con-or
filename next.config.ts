import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Permite cualquier subdominio de Supabase
      },
    ],
  },
};

export default nextConfig;
