/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  transpilePackages: ['shared'],
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/pixel/components/*': path.resolve(__dirname, 'app/components/*'),
      '@/shadcn/ui/*': path.resolve(__dirname, 'components/ui/*'),
      '@/lib/*': path.resolve(__dirname, 'lib/*'),
      '@/shared/*': path.resolve(__dirname, '../shared/*'),
    };
    return config;
  },
};

export default nextConfig;