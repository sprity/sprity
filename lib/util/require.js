'use strict';

var Err = require('./error');

module.exports = function (mod) {
  var loadModule = null;

  try {
    loadModule = 'sprity-' + mod;
    return require('sprity-' + mod);
  }
  catch(e) {
    loadModule = null;
  }

  if (!loadModule) {
    try {
      loadModule = mod;
      return require(mod);
    }
    catch(e) {
      throw new Err.PluggableError(mod + ' not found.', mod);
    }
  }

};
