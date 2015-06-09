'use strict';

var _ = require('lodash');
var File = require('vinyl');
var through2 = require('through2');
var path = require('path');
var parsePath = require('parse-filepath');

var transform = function (opt) {
  return function (obj, enc, cb) {
    var stream = this;
    if (obj instanceof Error) {
      cb(obj);
    }
    else {
      if (obj) {
        if (obj.style) {
          var filePath = parsePath(opt.style);
          if (filePath.extname === '') {
            filePath.extname = obj.extension;
          }
          stream.push(new File({
            base: path.join(opt.out, filePath.dirname),
            relative: path.join(filePath.dirname, filePath.name + filePath.extname),
            path: path.join(opt.out, filePath.dirname, filePath.name + filePath.extname.toLowerCase()),
            contents: obj.style
          }));
        }
        else {
          _.each(obj.sprites, function (sprite) {
            stream.push(new File({
              base: opt.out,
              relative: sprite.name + '.' + sprite.type,
              path: path.join(opt.out, sprite.name + '.' + sprite.type.toLowerCase()),
              contents: sprite.contents
            }));
          });
        }
      }
      cb();
    }
  };
};

module.exports = function (opt) {
  return through2.obj(transform(opt));
};
