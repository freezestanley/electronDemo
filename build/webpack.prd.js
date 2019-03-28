const path = require('path')
module.exports = {
  mode: 'production',
  entry: {
    st: './page/eye.js',
    eye: './page/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
    library: '[name]',
    libraryTarget: 'window'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [path.resolve(__dirname, '../page')],
        options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true
        }
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}
