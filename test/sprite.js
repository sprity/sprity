'use strict';

var Promise = require('bluebird');
var should = require('chai').should();
var sprite = require('../lib/sprite');
var layout = require('layout');
var spy = require('through2-spy').obj;
var os = require('object-stream');
var fs = require('fs');
var noop = function () {};

require('mocha');

var opts = {}, mockLayout, mockLayouts;
var mockedImageProcessor = {
  create: function (tiles, opt) {
    return Promise.resolve({
      contents: new Buffer('test', 'utf-8'),
      type: 'png',
      mimeType: 'image/png',
      width: 50,
      height: 50
    });
  },
  scale: function (base, opt) {
    return Promise.resolve({
      contents: new Buffer('test', 'utf-8'),
      type: 'png',
      mimeType: 'image/png',
      width: 25,
      height: 25
    });
  }
};

beforeEach(function () {
  opts = {
    name: 'sprite',
    base64: false,
    format: 'png',
    cssPath: '../images',
    engine: mockedImageProcessor,
    dimension: [{ratio: 1, dpi: 72}],
    logger: {
      log: noop,
      warn: noop,
      debug: noop,
      error: noop,
      success: noop
    }
  };

  mockLayout = layout('top-down');
  mockLayout.addItem({
    height: 50,
    width: 50,
    meta: {
      width: 42,
      height: 42,
      x: 0,
      y: 0,
      type: 'png',
      offset: 4
    }
  });
  mockLayouts = {
    name: 'default',
    layout: mockLayout.export()
  };
});

describe('sprity sprite (lib/sprite.js)', function () {

  it('should return a stream with one sprite object', function (done) {
    var count = 0;
    os.fromArray([mockLayouts])
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

  it('should return a stream with one sprite object with base64 encoded png', function (done) {
    var count = 0;
    opts.base64 = true;
    os.fromArray([mockLayouts])
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

  it('should return a stream with two sprite objects', function (done) {
    var count = 0;
    opts.dimension = [{ratio: 1, dpi: 72}, {ratio: 2, dpi: 192}];
    os.fromArray([mockLayouts])
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
    mockLayouts.name = 'first';
    var l2 = layout('top-down');
    l2.addItem({height: 50, width: 50, meta: {}});
    var mockLayouts2 = {
      name: 'second',
      layout: mockLayout.export()
    };
    os.fromArray([mockLayouts, mockLayouts2])
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

  it('should return a url with cachebuster', function (done) {
    var count = 0;
    opts.cssPath = 'http://www.example.com/assets/';
    opts.cachebuster = true;
    os.fromArray([mockLayouts])
      .pipe(sprite(opts))
      .pipe(spy(function (res) {
        res.sprites[0].url.should.include('http://www.example.com/assets/sprite.png?');
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should throw an error when processor not found', function (done) {
    opts.engine = 'notpresent';
    try {
      os.fromArray([mockLayouts]).pipe(sprite(opts));
    }
    catch (e) {
      e.name.should.equal('PluggableError');
      done();
    }
  });

  it('should throw an error when processor not found', function (done) {
    opts.engine = 'notpresent';
    opts.cli = true;
    try {
      os.fromArray([mockLayouts]).pipe(sprite(opts));
    }
    catch (e) {
      e.name.should.equal('PluggableError');
      done();
    }
  });

  it('should return log an error when processor not found', function (done) {
    var msg = '', error = '';
    opts.engine = 'notpresent';
    opts.logger = {
      error: function (e) {
        error = e;
      },
      debug: function (m) {
        msg = m;
      }
    };
    try {
      os.fromArray([mockLayouts]).pipe(sprite(opts));
    }
    catch (e) {
      error.should.include('notpresent');
      msg.should.include('npm install');
      done();
    }
  });
});
