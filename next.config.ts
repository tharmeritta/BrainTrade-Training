import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['framer-motion'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'braintrade-training-cb55d.web.app', 'braintrade-training-cb55d.firebaseapp.com'],
    },
  },
};

export default withNextIntl(nextConfig);
