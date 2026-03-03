import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
};

const sentryConfig = withSentryConfig(withNextIntl(nextConfig), {
  // Suppress source map upload warnings when no auth token is set
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps for better stack traces in production
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Hide source maps from the browser
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});

export default sentryConfig;
