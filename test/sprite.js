'use strict';

var should = require('chai').should();
var sprite = require('../lib/sprite');
var layout = require('layout');
var spy = require('through2-spy').obj;
var os = require('object-stream');
var noop = function () {};

require('mocha');

var opts = {}, layouts, l;

beforeEach(function () {
  opts = {
    name: 'sprite',
    base64: false,
    format: 'png',
    cssPath: '../images',
    dimension: [{ratio: 1, dpi: 72}]
  };

  l = layout('top-down');
  l.addItem({
    height: 50,
    width: 50,
    meta: {
      width: 42,
      height: 42,
      x: 0,
      y: 0,
      type: 'png',
      offset: 4,
      contents: ''
    }
  });
  layouts = {
    name: 'default',
    layout: l.export()
  };
});

describe('css-sprite sprite (lib/sprite.js)', function () {

  it('should return a stream with one sprite object', function (done) {
    var count = 0;
    os.fromArray([layouts])
      .pipe(sprite(opts))
      .pipe(spy(function (res) {
        res.sprites.length.should.equal(1);
        res.should.have.deep.property('sprites[0].name', 'sprite');
        res.sprites[0].url.should.not.match(/data\:image\/png;base64.*/);
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should return a stream with one sprite object with base64 encoded url', function (done) {
    var count = 0;
    opts.base64 = true;
    os.fromArray([layouts])
      .pipe(sprite(opts))
      .pipe(spy(function (res) {
        res.sprites.length.should.equal(1);
        res.should.have.deep.property('sprites[0].name', 'sprite');
        res.sprites[0].url.should.match(/data\:image\/png;base64.*/);
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should return a stream with one sprite object with type jpg', function (done) {
    var count = 0;
    opts.format = 'jpg';
    os.fromArray([layouts])
      .pipe(sprite(opts))
      .pipe(spy(function (res) {
        res.sprites.length.should.equal(1);
        res.should.have.deep.property('sprites[0].type', 'jpg');
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should return a stream with two sprite objects', function (done) {
    var count = 0;
    opts.dimension = [{ratio: 1, dpi: 72}, {ratio: 2, dpi: 192}];
    os.fromArray([layouts])
      .pipe(sprite(opts))
      .pipe(spy(function (res) {
        res.sprites.length.should.equal(2);
        res.should.have.deep.property('sprites[0].dpi', null);
        res.should.have.deep.property('sprites[1].dpi', 192);
        res.should.have.deep.property('sprites[1].name', 'sprite@2x');
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should return a stream with two sprite objects and the appropriate nameing of sprites', function (done) {
    var count = 0;
    opts.dimension = [{ratio: 1, dpi: 72}, {ratio: 2, dpi: 192}];
    layouts.name = 'first';
    var l2 = layout('top-down');
    l2.addItem({height: 50, width: 50, meta: {}});
    var layouts2 = {
      name: 'second',
      layout: l.export()
    };
    os.fromArray([layouts, layouts2])
      .pipe(sprite(opts))
      .pipe(spy(function (res) {
        res.sprites.length.should.equal(2);
        if (count === 0) {
          res.should.have.deep.property('sprites[0].name', 'sprite-first');
          res.should.have.deep.property('sprites[1].name', 'sprite-first@2x');
        }
        if (count === 1) {
          res.should.have.deep.property('sprites[0].name', 'sprite-second');
          res.should.have.deep.property('sprites[1].name', 'sprite-second@2x');
        }
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(2);
        done();
      });
  });
});
