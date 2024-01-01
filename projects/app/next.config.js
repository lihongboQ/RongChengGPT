/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');
const path = require('path');

const nextConfig = {
  i18n,
  output: 'standalone',
  reactStrictMode: process.env.NODE_ENV === 'development' ? false : true,
  compress: true,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false
        }
      };
    }
    Object.assign(config.resolve.alias, {
      '@mongodb-js/zstd': false,
      '@aws-sdk/credential-providers': false,
      snappy: false,
      aws4: false,
      'mongodb-client-encryption': false,
      kerberos: false,
      'supports-color': false,
      'bson-ext': false,
      'pg-native': false
    });
    config.module = {
      ...config.module,
      rules: config.module.rules.concat([
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack']
        }
      ]),
      exprContextCritical: false,
      unknownContextCritical: false
    };

    return config;
  },
  // async devServer({ proxy }) {
  //   return {
  //     // 启用代理  
  //     proxy: {
  //       // 匹配请求路径的模式  
  //       // 在这里，我们将所有以 "/api" 开头的请求都代理到 "<你的本地开发服务器地址>:<端口>"  
  //       '/RongChengGPT': {
  //         target: 'http://localhost:3000',
  //         changeOrigin: true,
  //         pathRewrite: {
  //           '/RongChengGPT': 'http://18.221.12.198:5003/chatgpt', // 将所有代理请求的路径从 "/api" 改为 ""  
  //         },
  //       },
  //     },
  //   };
  // },
  transpilePackages: ['@fastgpt/*'],
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'pg'],
    outputFileTracingRoot: path.join(__dirname, '../../')
  },
};

module.exports = nextConfig;
