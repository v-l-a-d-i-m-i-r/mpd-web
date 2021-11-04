// https://medium.com/the-andela-way/how-to-set-up-an-express-api-using-webpack-and-typescript-69d18c8c4f52

import path from 'path';
import { Configuration } from 'webpack';

module.exports = (): Configuration => ({
  entry: path.join(__dirname, './src/index.ts'),
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'index.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
});
