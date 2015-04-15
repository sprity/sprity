'use strict';

var colors = require('colors');
var spy = require('through2-spy').obj;

colors.setTheme({
  debug: 'blue',
  log: 'reset',
  warn: 'yellow',
  error: 'red',
  success: 'green'
});

var out = function (msg, level) {
  if (!level) {
    level = 'log';
  }
  console.log(colors.bold('[css-sprite] ') + msg[level]);
};

module.exports = {
  cli: {
    logStream: spy(function (obj) {
      module.exports.cli.debug('Stream object:');
      console.log(obj);
    }),
    log: function (msg) {
      out(msg);
    },
    warn: function (msg) {
      out(msg, 'warn');
    },
    debug: function (msg) {
      out(msg, 'debug');
    },
    error: function (msg) {
      out(msg, 'error');
    },
    success: function (msg) {
      out(msg, 'success');
    }
  },
  nolog: {
    logStream: spy(function () {}),
    log: function () {},
    warn: function () {},
    debug: function () {},
    error: function () {},
    success: function () {}
  }
};
