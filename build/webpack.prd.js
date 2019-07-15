const path = require('path')
const webpack = require('webpack')
module.exports = {
  mode: 'production',
  entry: {
    eye: './page/index.js',
    watch: './page/test.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, `../dist/${process.env.NODE_ENV}`),
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
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.CK_ENV': JSON.stringify(process.env.CK_ENV)
    })
  ]
}
