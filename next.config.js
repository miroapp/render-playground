/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: [
        'raw-loader',
        'glslify-loader'
      ]
    })

    return config
  }
};
