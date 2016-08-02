module.exports = function (config) {
  config.set({

    frameworks: ['mocha'],
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'test/index.js'
    ],

    preprocessors: {
      'test/index.js': ['webpack', 'coverage']
    },

    webpack: {
      module: {
        loaders: [{
          test: /.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel'
        }]
      }
    },

    webpackMiddleware: {
      noInfo: true
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
      subdir: '.'
    },

    plugins: [
      require("karma-webpack"),
      require("karma-phantomjs-launcher"),
      require('karma-mocha'),
      require('karma-coverage')
    ],

    browsers: ['PhantomJS'],

    singleRun: true

  })
};
