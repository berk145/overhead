import type { NextConfig } from 'next'
import path from 'node:path'
const nextConfig: NextConfig = {
  devIndicators: false,
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^\.\/wasm\/index\.js$/,
        (resource: { context?: string; request: string }) => {
          if (resource.context?.endsWith('satellite.js/dist'))
            resource.request = path.resolve('src/app/empty-wasm.ts')
        },
      ),
    )
    return config
  },
}
export default nextConfig
