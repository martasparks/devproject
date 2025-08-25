import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "martas-mebeles-dev.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
};
 
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);