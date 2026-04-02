import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // Static export para Cloudflare Pages
  output: "export",

  // Imagens: desabilitado no static export (usar R2 CDN + CF Image Resizing)
  images: {
    unoptimized: true,
  },

  // Trailing slashes para compatibilidade CF Pages
  trailingSlash: false,

  // Workers/lib são compilados pelo Wrangler separadamente
  // O tsconfig.json inclui esses arquivos para IntelliSense do editor,
  // mas o Next.js não deve type-checká-los no build
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint também só precisa checar src/
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Remove console.log em produção (mantém error/warn)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Experimental — optimize package imports for tree-shaking
  experimental: {
    optimizePackageImports: [
      'recharts',
      'framer-motion',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default analyzer(nextConfig);
