/** @type {import('next').NextConfig} */

const { webpack } = require('next/dist/compiled/webpack/webpack');

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true
});

const nextConfig = {
    reactStrictMode: true,
    experimental: { serverActions: true },
    webpack: (config) => {
        config.externals = [...config.externals, { canvas: 'canvas' }];

        return config;
    }
};

module.exports = withPWA(nextConfig);
