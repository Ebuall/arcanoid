const webpack = require('webpack')

module.exports = {
  entry: './index.ts',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/public'
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader"
      }
    ]
  },
  devServer: {
    contentBase: './public',
    historyApiFallback: true,
    stats: 'errors-only',
    port: 8000
  }
}