#!/usr/bin/env node
'use strict';

var sprite = require('../index');
var log = require('../lib/util/log').cli;
var fs = require('vinyl-fs');

var opts = require('nomnom')
  .option('out', {
    position: 0,
    required: true,
    metavar: 'DIR',
    default: process.cwd(),
    help: 'path of directory to write sprite file to'
  })
  .option('src', {
    position: 1,
    required: true,
    list: true,
    metavar: 'GLOB',
    help: 'glob strings to find source images to put into the sprite'
  })
  .option('base64', {
    abbr: 'b',
    flag: true,
    help: 'create css with base64 encoded sprite (css file will be written to <out>)'
  })
  .option('cssPath', {
    abbr: 'c',
    full: 'css-image-path',
    default: '../images',
    help: 'http path to images on the web server (relative to css path or absolute path)'
  })
  .option('dimension', {
    abbr: 'd',
    list: true,
    default: [{ratio: 1, dpi: 72}],
    transform: function (value) {
      value = value.split(':');
      return {
        ratio: Number(value[0]),
        dpi: Number(value[1])
      };
    },
    help: 'the used dimensions for the sprite. A combination of ratio and dpi. For example -d 2:192 would generate a sprite for device-pixel-ratio:2 and min-resolution: 192dpi. Multiple dimensions are allowed. Defaults to 1:72'
  })
  .option('engine', {
    abbr: 'e',
    default: 'lwip',
    help: 'image processing engine'
  })
  .option('format', {
    abbr: 'f',
    choices: ['png', 'jpg'],
    default: 'png',
    help: 'output format of the sprite (png or jpg)'
  })
  .option('name', {
    abbr: 'n',
    default: 'sprite',
    help: 'name of sprite file without file extension '
  })
  .option('processor', {
    abbr: 'p',
    default: 'css',
    help: 'style processing module'
  })
  .option('template', {
    abbr: 't',
    help: 'output template file, overrides processor option'
  })
  .option('style', {
    abbr: 's',
    help: 'file to write css to, if omitted no css is written'
  })
  .option('watch', {
    abbr: 'w',
    flag: true,
    help: 'continuously create sprite'
  })
  .option('background', {
    default: '#FFFFFF',
    help: 'background color of the sprite in hex'
  })
  .option('cachebuster', {
    flag: true,
    default: false,
    help: 'appends a "cache buster" to the background image in the form "?<...>" (random)'
  })
  .option('margin', {
    default: 4,
    help: 'margin in px between tiles'
  })
  .option('interpolation', {
    choices: ['nearest-neighbor', 'moving-average', 'linear', 'grid', 'cubic', 'lanczos'],
    dedault: 'grid',
    help: 'Interpolation algorithm used when scaling retina images (nearest-neighbor|moving-average|linear|grid|cubic|lanczos)'
  })
  .option('opacity', {
    default: 0,
    help: 'background opacity (0 - 100) of the sprite. defaults to 0 when png or 100 when jpg'
  })
  .option('orientation', {
    choices: ['vertical', 'horizontal', 'binary-tree'],
    default: 'vertical',
    help: 'orientation of the sprite image (vertical|horizontal|binary-tree)'
  })
  .option('prefix', {
    help: 'prefix for the class name used in css (without .)'
  })
  .option('no-sort', {
    flag: true,
    help: 'disable sorting of layout'
  })
  .option('split', {
    flag: true,
    default: false,
    help: 'create sprite images for every sub folder'
  })
  .option('style-indent-char', {
    choices: ['space', 'tab'],
    default: 'space',
    help: 'Character used for indentation of styles (space|tab)'
  })
  .option('style-indent-size', {
    default: 2,
    help: 'Number of characters used for indentation of styles'
  })
  .script('sprity')
  .parse();

opts.logger = log;
opts.cli = true;

if (opts.watch) {
  if (opts['no-sort']) {
    opts.sort = false;
  }
  log('Watching for file changes ...');
  fs.watch(opts.src, function () {
    sprite.create(opts, function () {
      log.success('Sprite created in ' + opts.out);
    });
  });
}
else {
  if (opts['no-sort']) {
    opts.sort = false;
  }

  sprite.create(opts, function () {
    log.success('Sprite created in ' + opts.out);
  });
}
