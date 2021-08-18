import path from 'path';
import { Configuration as WebpackConfiguration, DefinePlugin } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const webpackConfig = (): Configuration => ({
  entry: path.join(__dirname, './src/index.tsx'),
  ...(process.env.production || !process.env.development
    ? {}
    : { devtool: 'eval-source-map' }),

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile: path.join(__dirname, './tsconfig.json') })],
  },
  output: {
    path: path.join(__dirname, '/build'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      // HtmlWebpackPlugin simplifies creation of HTML files to serve your webpack bundles
      template: path.join(__dirname, './src/public/index.html'),
    }),
    // DefinePlugin allows you to create global constants which can be configured at compile time
    new DefinePlugin({
      'process.env': process.env.production || !process.env.development,
    }),
    // Speeds up TypeScript type checking and ESLint linting (by moving each to a separate process)
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        enabled: true,
        files: './src/**/*.{ts,tsx,js,jsx}',
      },
    }),
  ],
});

export default webpackConfig;