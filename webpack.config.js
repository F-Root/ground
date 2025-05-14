const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const entries = {
  main: './src/views/main/main.js',
  signin: './src/views/signin/signin.js',
  signup: './src/views/signup/signup.js',
  'ground.board': './src/views/ground/board/board.js',
  // 'ground.view': './src/views/ground/view/view.js',
  'ground.create': './src/views/ground/create/create.js',
  'ground.update': './src/views/ground/update/update.js',
  'settings.profile': './src/views/settings/profile/profile.js',
  'settings.grounds': './src/views/settings/grounds/grounds.js',
  'settings.account': './src/views/settings/account/account.js',
  'settings.password': './src/views/settings/password/password.js',
  'settings.notificate': './src/views/settings/notificate/notificate.js',
  'post.new': './src/views/post/new/new.js',
  'post.update': './src/views/post/update/update.js',
  'post.view': './src/views/post/view/view.js',
};

module.exports = {
  mode: 'development',
  // mode: 'production',
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].[contenthash].bundle.js',
    // filename: '[name].[contenthash].min.js',
    chunkFilename: '[name].[contenthash].bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(?:js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true },
          /* babel.config.json 에 작성됨
            options: {
            presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
            plugins: ['@babel/plugin-transform-runtime'],
          },*/
        },
      },
      /* 단순정적자산을 사용하기 때문에 Asset Modules가 아닌 CopyWebpackPlugin 사용
      {
        test: /\.svg$/,
        type: 'asset/resource',
      },*/
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/views/asset', to: 'asset' }],
    }),
    ...Object.entries(entries).map(
      ([name, entryPath]) =>
        new HtmlWebpackPlugin({
          filename: `${name}.html`,
          template: `${entryPath.slice(0, -2)}html`,
          chunks: [name],
        })
    ),
    // new CopyWebpackPlugin({
    //   patterns: [{ from: 'src/views/asset', to: 'asset' }],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'main.html',
    //   template: './src/views/main/main.html',
    //   chunks: ['main'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'signin.html',
    //   template: './src/views/signin/signin.html',
    //   chunks: ['signin'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'signup.html',
    //   template: './src/views/signup/signup.html',
    //   chunks: ['signup'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'ground.board.html',
    //   template: './src/views/ground/board/board.html',
    //   chunks: ['ground.board'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'ground.view.html',
    //   template: './src/views/ground/view/view.html',
    //   chunks: ['ground.view'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'ground.create.html',
    //   template: './src/views/ground/create/create.html',
    //   chunks: ['ground.create'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'ground.update.html',
    //   template: './src/views/ground/update/update.html',
    //   chunks: ['ground.update'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'settings.profile.html',
    //   template: './src/views/settings/profile/profile.html',
    //   chunks: ['settings.profile'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'settings.grounds.html',
    //   template: './src/views/settings/grounds/grounds.html',
    //   chunks: ['settings.grounds'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'settings.account.html',
    //   template: './src/views/settings/account/account.html',
    //   chunks: ['settings.account'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'settings.password.html',
    //   template: './src/views/settings/password/password.html',
    //   chunks: ['settings.password'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'settings.notificate.html',
    //   template: './src/views/settings/notificate/notificate.html',
    //   chunks: ['settings.notificate'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'post.new.html',
    //   template: './src/views/post/new/new.html',
    //   chunks: ['post.new'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'post.update.html',
    //   template: './src/views/post/update/update.html',
    //   chunks: ['post.update'],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'post.view.html',
    //   template: './src/views/post/view/view.html',
    //   chunks: ['post.view'],
    // }),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        default: {
          minChunks: 2,
          reuseExistingChunk: true,
          // enforce: true,
        },
      },
    },
  },
  devtool: 'eval-source-map',
  // devtool: 'source-map', -> production debugging
};
