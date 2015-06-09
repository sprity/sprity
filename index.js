'use strict';

var _ = require('lodash');
var vfs = require('vinyl-fs');
var ifStream = require('ternary-stream');
var through2 = require('through2').obj;

var tile = require('./lib/tile');
var layout = require('./lib/layout');
var sprite = require('./lib/sprite');
var style = require('./lib/style');
var toVinyl = require('./lib/to-vinyl');
var noop = function () {};
var error = null;

var defaults = {
  'src': null,
  'out': '',
  'name': 'sprite',
  'style': null,
  'dimension': [{ratio: 1, dpi: 72}],
  'engine': 'lwip',
  'cssPath': '../images',
  'processor': 'css',
  'template': null,
  'orientation': 'vertical',
  'background': '#FFFFFF',
  'margin': 4,
  'opacity': 0,
  'sort': true,
  'split': false,
  'style-indent-char': 'space',
  'style-indent-size': 2,
  'logger': {
    log: noop,
    warn: noop,
    debug: noop,
    error: noop,
    success: noop
  }
};

var handleError = function () {
  return function (err) {
    error = true;
    this.push(err);
  };
};

var handleCallbackError = function (cb) {
  return function (err) {
    error = true;
    if (_.isFunction(cb)) {
      cb(err);
    }
  };
};

module.exports = {
  /*
   *  creates sprite and style file and save them to disk
   */
  create: function (o, cb) {
    if (!o.out) {
      throw new Error('output dir missing');
    }

    this.src(o)
      .on('error', handleCallbackError(cb))
      .pipe(vfs.dest(function (file) {
        return file.base;
      }))
      .on('error', handleCallbackError(cb))
      .on('end', function () {
        if (_.isFunction(cb) && !error) {
          cb();
        }
      });
  },
  /*
   *  returns a Readable/Writable stream of vinyl objects with sprite and style files
   */
  src: function (o) {
    if (!o.src) {
      throw new Error('src dir missing');
    }

    var opts = _.extend({}, defaults, o);

    var hasStyle = function () {
      return !!opts.style;
    };

    var stream = vfs.src(opts.src)
      .pipe(tile(opts))
      .on('error', handleError())
      .pipe(layout(opts))
      .on('error', handleError())
      .pipe(sprite(opts))
      .on('error', handleError())
      .pipe(ifStream(hasStyle, style(opts)))
      .on('error', handleError())
      .pipe(toVinyl(opts))
      .on('error', handleError())
      .pipe(through2(function (obj, enc, cb) {
        if (obj instanceof Error) {
          cb(obj, null);
        }
        else {
          cb(null, obj);
        }
      }));

    return stream;
  }
};
