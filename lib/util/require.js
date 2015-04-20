'use strict';

var Err = require('./error');

module.exports = function (mod) {
  var loadModule = null;
  try {
    loadModule = 'sprity-' + mod;
    require.resolve('sprity-' + mod);
  }
  catch(e) {
    loadModule = null;
  }

  if (!loadModule) {
    try {
      loadModule = mod;
      loadModule = require.resolve(mod);
    }
    catch(e) {
      loadModule = null;
    }
  }

  try {
    return require(loadModule);
  }
  catch (e) {
    throw new Err.PluggableError(mod + ' not found.', mod);
  }
};
