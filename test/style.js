'use strict';

var should = require('chai').should();
var style = require('../lib/style');
var spy = require('through2-spy').obj;
var layout = require('layout');
var os = require('object-stream');
var noop = function () {};

require('mocha');

var opts = {}, layouts;

beforeEach(function () {
  opts = {
    'style-indent-char': 'space',
    'style-indent-size': 2,
    'processor': 'css-sprite-css'
  };

  var l = layout('top-down');
  l.addItem({height: 50, width: 50, meta: {}});
  layouts = {
    name: 'default',
    classname: 'icon',
    layout: l.export(),
    sprites: [{
      name: 'sprite',
      url: '../images/sprite.png',
      type: 'png',
      dpi: null,
      ratio: null,
      width: 50,
      height: 300
    }, {
      name: 'sprite@1.5x',
      url: '../images/sprite@1.5x.png',
      type: 'png',
      dpi: 144,
      ratio: 1.5,
      width: 50,
      height: 300
    }, {
      name: 'sprite@2x',
      url: '../images/sprite@2x.png',
      type: 'png',
      dpi: 192,
      ratio: 2,
      width: 50,
      height: 300
    }]
  };
});

describe('css-sprite style (lib/style.js)', function () {

  it('should return a stream with one style object', function (done) {
    var count = 0;
    os.fromArray([layouts])
      .pipe(style(opts))
      .pipe(spy(function (res) {
        if (res.style) {
          res.style.should.match(/.icon.*/);
          count++;
        }
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should load template and return a stream with one style object', function (done) {
    var count = 0;
    opts.template = 'test/template/template.hbs';
    os.fromArray([layouts])
      .pipe(style(opts))
      .pipe(spy(function (res) {
        if (res.style) {
          res.style.should.match(/.testClass.*/);
          count++;
        }
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

});
