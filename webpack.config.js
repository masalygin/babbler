const path = require('path');


module.exports = {

  context: path.join(__dirname, 'src'),
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'build'),
    library: 'Babbler',
    filename: 'babbler.js'
  },
  module: {
    loaders: [{
      test: /.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel'
    }]
  }

};
