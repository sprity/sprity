'use strict';

var _ = require('lodash');
var layout = require('layout');
var through2 = require('through2');
var path = require('path');
var Err = require('./util/error');

var layouts;

var getOrientation = function (opt) {
  if (opt.orientation === 'vertical') {
    return 'top-down';
  }
  else {
    return opt.orientation === 'horizontal' ? 'left-right' : 'binary-tree';
  }
};

var getClassName = function (name, opt) {
  var sep = '';
  if (name === 'default') {
    name = '';
  }
  if (name.length > 0) {
    sep = '-';
  }
  if (opt.prefix) {
    return opt.prefix + sep + name;
  }
  else {
    return 'icon' + sep + name;
  }
};

var addTile = function (opt) {
  return function (tile, enc, cb) {
    if (tile instanceof Error) {
      cb(tile);
    }
    else {
      if (tile && tile.base && tile.width && tile.height) {
        var name = opt.split ? path.basename(tile.base) : 'default';
        if (!layouts[name]) {
          layouts[name] = layout(getOrientation(opt), {'sort': opt.sort});
        }
        var height = tile.height + 2 * opt.margin;
        var width = tile.width + 2 * opt.margin;
        layouts[name].addItem({
          height: height,
          width: width,
          meta: tile
        });
      }
      cb();
    }
  };
};

var pushLayouts = function (opt) {
  return function (cb) {
    var stream = this;
    if (_.keys(layouts).length === 0) {
      var e = new Err.LayoutError();
      stream.emit('error', e);
    }
    else {
      _.each(layouts, function (l, key) {
        stream.push({
          name: key,
          classname: getClassName(key, opt),
          layout: l.export()
        });
      });
    }
    cb();
  };
};

module.exports = function (opt) {
  layouts = {};

  return through2.obj(addTile(opt), pushLayouts(opt));
};
