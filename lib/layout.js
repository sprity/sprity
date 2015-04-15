'use strict';

var _ = require('lodash');
var layout = require('layout');
var through2 = require('through2');
var path = require('path');
var log = require('./util/log').nolog;

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
    var name = opt.split ? path.basename(tile.base) : 'default';
    if (!layouts[name]) {
      layouts[name] = layout(getOrientation(opt), {'sort': opt.sort});
    }
    layouts[name].addItem({
      height: tile.height + 2 * opt.margin,
      width: tile.width + 2 * opt.margin,
      meta: tile
    });
    cb();
  };
};

var pushLayouts = function (opt) {
  return function (cb) {
    var stream = this;
    if (layouts.length === 0) {
      log.error('no layouts created.');
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
  if (opt.logger) {
    log = opt.logger;
  }
  layouts = {};
  return through2.obj(addTile(opt), pushLayouts(opt));
};
