'use strict';

var colors = require('colors');

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
  console.log(colors.bold('[sprity] ') + msg[level]);
};

module.exports = {
  cli: {
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
    log: function () {},
    warn: function () {},
    debug: function () {},
    error: function () {},
    success: function () {}
  }
};
