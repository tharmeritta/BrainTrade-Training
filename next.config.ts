import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['framer-motion'],
  // Firebase client config is public by design — security is enforced by Firebase Security Rules.
  // These values are baked into the client bundle at build time.
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? 'AIzaSyCFcOBpUmDe3Zz0vGHeS44xdBR3GQtCMtw',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? 'bt-training-firebase.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? 'bt-training-firebase',
    NEXT_PUBLIC_FIREBASE_DATABASE_URL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL       ?? 'https://bt-training-firebase-default-rtdb.asia-southeast1.firebasedatabase.app/',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? 'bt-training-firebase.firebasestorage.app',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '723552528953',
    NEXT_PUBLIC_FIREBASE_APP_ID:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? '1:723552528953:web:c033c03310682e3ce2bbe8',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID     ?? 'G-V82RGZ1M3C',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'braintrade-training-cb55d.web.app', 'braintrade-training-cb55d.firebaseapp.com'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
};

export default withNextIntl(nextConfig);
