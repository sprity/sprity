'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var through2 = require('through2');
var Handlebars = require('handlebars');
var path = require('path');
var fs = Promise.promisifyAll(require('fs-extra'));
var cssesc = require('cssesc');
var prettydiff = require('prettydiff');

var moduleRequire = require('./util/require');
var layouts = [], processor, log, ratio;

Handlebars.registerHelper('cssesc', function (value) {
  return value && value.length > 0 ? cssesc(value, {isIdentifier: true}) : '';
});

Handlebars.registerHelper('escimage', function (img) {
  return img.replace(/['"\(\)\s]/g, function encodeCssUri (chr) {
    return '%' + chr.charCodeAt(0).toString(16);
  });
});

Handlebars.registerHelper('baseDim', function (size) {
  return Math.round(size * ratio);
});

var sortByDim = function (a, b) {
  return a.ratio - b.ratio;
};

var getTemplate = function (opt) {
  var templatePath = path.join(process.cwd(), opt.template);
  return fs.readFileAsync(templatePath, 'utf8');
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
    if (_.isString(opt.processor)) {
      processor = moduleRequire(opt.processor);
    }
    else {
      processor = opt.processor;
    }
  }
  catch (e) {
    log.error(e.message);
    if (opt.cli) {
      log.debug('Install the style processor with `npm install <processor-name> -g`');
    }
    else {
      log.debug('Install the style processor with `npm install <processor-name>`');
    }
    throw e;
  }
});

var queue = function (layout, enc, cb) {
  if (layout instanceof Error) {
    cb(layout);
  }
  else {
    if (layout) {
      layouts.push(layout);
      cb(null, layout);
    }
    else {
      cb();
    }
  }
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
          })
          .then(beautify(opt));
      }

      style
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
  log = opt.logger;
  layouts = [];
  if (opt.dimension) {
    opt.dimension.sort(sortByDim).reverse();
    opt.dimension[opt.dimension.length - 1].default = true;
    ratio = opt.dimension[opt.dimension.length - 1].ratio / opt.dimension[0].ratio;
  }
  else {
    ratio = 1;
  }
  return through2.obj(queue, createStyle(opt));
};
