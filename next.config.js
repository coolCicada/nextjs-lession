/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')()
const nextConfig = {
    https: true,
    images: {
        disableStaticImages: true, // 禁用静态图像优化
    },
    webpack(config) {
        // 处理 SVG 文件，将其作为普通图片导入，不转换为 React 组件
        config.module.rules.push({
            test: /\.svg$/, // 仅处理 SVG 文件
            type: 'asset/resource', // 使用 Webpack 5 的 asset module
            parser: {
                dataUrlCondition: {
                    maxSize: 8192, // 小于 8kb 的 SVG 将被内联为 base64
                },
            },
        });

        // 处理常规图片文件（PNG、JPG、GIF 等）
        config.module.rules.push({
            test: /\.(png|jpe?g|gif)$/i, // 匹配常规图片格式
            type: 'asset/resource', // 使用 Webpack 5 的 asset module
            parser: {
                dataUrlCondition: {
                    maxSize: 8192, // 小于 8kb 的图片会被内联为 base64，大于 8kb 的会被转换为 URL
                },
            },
        });

        return config;
    },
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

module.exports = withMDX(nextConfig);