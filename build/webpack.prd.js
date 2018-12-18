const path = require('path')
module.exports = {
  mode: 'production',
  entry: {
    main: './page/index.js'
  },
  output: {
    filename: 'st.js',
    path: path.resolve(__dirname, '../dist'),
    library: 'st',
    libraryTarget: 'window'
  },
  module: {
    rules: [
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