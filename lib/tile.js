'use strict';

var Promise = require('bluebird');
var through2 = require('through2');
var imageinfo = require('imageinfo');
var parsePath = require('parse-filepath');
var fs = Promise.promisifyAll(require('fs-extra'));

var Err = require('./util/error');
var log;

var createTileObj = function (image) {
  return function (stats) {
    if (stats.isFile()) {
      var info = imageinfo(image.contents);
      if (info) {
        var tileObj = {
          base: image.base,
          contents: image.contents,
          fileName: image.relative,
          height: info.height,
          name: parsePath(image.relative.replace(/\/|\\|\ /g, '-')).name,
          path: image.path,
          type: info.format.toLowerCase(),
          width: info.width
        };
        return Promise.resolve(tileObj);
      }
      else {
        throw new Err.TileError(image.path + ' is not an image', image);
      }
    }
    else {
      throw new Err.TileError(image.path + ' does not exist', image);
    }
  };
};

module.exports = function (opt) {
  log = opt.logger;

  return through2.obj(function (image, enc, cb) {
    fs.statAsync(image.path)
      .then(createTileObj(image))
      .then(function (tile) {
        cb(null, tile);
      })
      .catch(Err.TileError, function (err) {
        log.warn('Ignoring ' + err.image.path);
        cb(null, null);
      });
  });
};
