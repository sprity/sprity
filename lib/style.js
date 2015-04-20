'use strict';

var Promise = require('bluebird');
var through2 = require('through2');
var Handlebars = require('handlebars');
var path = require('path');
var fs = Promise.promisifyAll(require('fs-extra'));
var cssesc = require('cssesc');
var prettydiff = require('prettydiff');

var log = require('./util/log').nolog;
var moduleRequire = require('./util/require');
var layouts = [], processor;

Handlebars.registerHelper('cssesc', function (value) {
  return value && value.length > 0 ? cssesc(value, {isIdentifier: true}) : '';
});

Handlebars.registerHelper('escimage', function (img) {
  return img.replace(/['"\(\)\s]/g, function encodeCssUri (chr) {
    return '%' + chr.charCodeAt(0).toString(16);
  });
});

var getTemplate = function (opt) {
  return fs.readFileAsync(path.join(__dirname, 'templates', opt.processor + '.hbs'), 'utf8');
};

var beautify = function (opt) {
  return Promise.method(function (style) {
    if (!opt.template && processor.isBeautifyable(opt)) {
      return prettydiff.api({
        source: style,
        lang: 'css',
        mode: 'beautify',
        inchar: opt['style-indent-char'] === 'space' ? ' ' : '\t',
        insize: opt['style-indent-size']
      })[0];
    }
    else {
      return style;
    }
  });
};

var processTemplate = Promise.method(function (source) {
  var template = Handlebars.compile(source);
  return template({
    layouts: layouts
  });
});

var prepareProcessor = Promise.method(function (opt) {
  try {
    processor = moduleRequire(opt.processor);
  }
  catch (e) {
    log.error(e.message);
    if (opt.cli) {
      log.debug('Install the style processor with `npm install ' + opt.processor + ' -g`');
    }
    else {
      log.debug('Install the style processor with `npm install ' + opt.processor + '`');
    }
    throw e;
  }
});

var queue = function (layout, enc, cb) {
  layouts.push(layout);
  cb(null, layout);
};

var createStyle = function (opt) {
  return function (cb) {
    var stream = this, style;

    if (opt.style) {
      if (opt.template) {
        style = getTemplate(opt).then(processTemplate);
      }
      else {
        style = prepareProcessor(opt)
          .catch(function (err) {
            stream.emit('error', err);
          })
          .then(function () {
            return processor.process(layouts, opt, Handlebars);
          });
      }

      style
        .then(beautify(opt))
        .then(function (res) {
          stream.push({
            extension: opt.template ? '' : '.' + processor.extension(opt),
            style: new Buffer(res, 'utf-8')
          });
          cb();
        });
    }
    else {
      cb();
    }
  };
};

module.exports = function (opt) {
  if (opt.logger) {
    log = opt.logger;
  }

  layouts = [];

  return through2.obj(queue, createStyle(opt));
};
