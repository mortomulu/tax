const withTM = require('next-transpile-modules')([
  'antd',
  '@ant-design/icons',
  'rc-util',
  'rc-picker',
  'rc-pagination',
  'dayjs',
  'rc-tree', 
  '@babel/runtime',
  'rc-table',
  'rc-input',        
]);

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  swcMinify: true,
});

module.exports = nextConfig;
