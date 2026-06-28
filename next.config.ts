import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // Static export para Cloudflare Pages
  output: "export",

  // Imagens: loader custom → Cloudflare Image Transformations (/cdn-cgi/image/).
  // Gera srcset multi-largura REAL mesmo com output: "export" (default loader
  // lançaria erro; loader custom é permitido). NÃO reativar `unoptimized: true`:
  // no Next 15.5 ele é OR'd em toda <Image> e zera o srcSet (ver cf-image-loader.ts).
  // O loader faz pass-through de SVG / data: / externos / R2 já-transformadas.
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cf-image-loader.ts",
    // Imagens-fonte são menores que 4K — dropar 3840 evita upscaling desperdiçado.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
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
