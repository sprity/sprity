'use strict';

var _ = require('lodash');
var vfs = require('vinyl-fs');
var ifStream = require('ternary-stream');

var tile = require('./lib/tile');
var layout = require('./lib/layout');
var sprite = require('./lib/sprite');
var style = require('./lib/style');
var toVinyl = require('./lib/to-vinyl');
var noop = function () {};

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

module.exports = {
  /*
   *  creates sprite and style file and save them to disk
   */
  create: function (o, cb) {
    this.src(o)
      .pipe(vfs.dest(o.out))
      .on('error', function (err) {
        if (_.isFunction(cb)) {
          cb(err);
        }
      })
      .on('end', function () {
        if (_.isFunction(cb)) {
          cb();
        }
      });
  },
  /*
   *  returns a Readable/Writable stream of vinyl objects with sprite and style files
   */
  src: function (o) {
    if (!o.src) {
      throw new Error('glob missing');
    }

    if (!o.out) {
      throw new Error('output dir missing');
    }

    var opts = _.extend({}, defaults, o);

    var hasStyle = function () {
      return !!opts.style;
    };

    return vfs.src(opts.src)
      .pipe(tile(opts))
      .pipe(layout(opts))
      .pipe(sprite(opts))
      .pipe(ifStream(hasStyle, style(opts)))
      .pipe(toVinyl(opts));
  }
};
