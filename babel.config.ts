import { createConfigItem } from '@babel/core';

export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "version": "2018-09", "decoratorsBeforeExport": false }],
    ["@babel/plugin-proposal-class-properties", { loose: false }],
    ["@babel/plugin-transform-private-methods", { loose: false }],
    "@babel/plugin-transform-class-static-block",
    "@babel/plugin-syntax-jsx"
  ],
};