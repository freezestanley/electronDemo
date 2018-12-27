const path = require("path"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  CleanWebpackPlugin = require("clean-webpack-plugin"),
  webpack = require("webpack"),
  baseConfig = require("./webpack.dev"),
  merge = require("webpack-merge");

const hotdev = {
  entry: {
    st: ["webpack-hot-middleware/client?noInfo=false&reload=true&quiet=false", "./page/index.js"],
    eye: ["webpack-hot-middleware/client?noInfo=false&reload=true&quiet=false", "./page/eye.js"]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
    library: '[name]',
    libraryTarget: 'window',
    publicPath: 'http://localhost:3000/'
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
};

module.exports = merge(baseConfig, hotdev)
// module.exports = function () {
//   let webpackconfig = merge(baseConfig, hotdev); // console.log(webpackconfig);

//   var compiler = webpack(webpackconfig); // console.log(compiler);
//   app.use(
//     devMiddleWare(compiler, {
//       publicPath: webpackconfig.output.publicPath,
//       stats: {
//         colors: true,
//         chunks: false
//       }
//     })
//   );
//   app.use(hotMiddleWare(compiler));
//   return app;
// }