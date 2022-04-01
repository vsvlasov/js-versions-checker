'use strict';
const path = require('path')
const nodeExternals = require('webpack-node-externals')


module.exports = {
    externals: [nodeExternals({})],
    entry: './index.js',
    output: {
        iife: false,
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    target: 'node',
};
