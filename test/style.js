'use strict';

var should = require('chai').should();
var Promise = require('bluebird');
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
    'processor': 'css',
    'style': 'style',
    'logger': {
      log: noop,
      warn: noop,
      debug: noop,
      error: noop,
      success: noop
    }
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

describe('sprity style (lib/style.js)', function () {

  it('should process layouts', function (done) {
    var count = 0;
    opts.processor = {
      process: function () {
        count++;
        return Promise.resolve('style');
      },
      isBeautifyable: function () {
        return false;
      },
      extension: function () {
        return 'css';
      }
    };
    os.fromArray([layouts])
      .pipe(style(opts))
      .pipe(spy(function (res) {
        if (res.style) {
          res.style.toString().should.equal('style');
        }
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should not process layouts', function (done) {
    var count = 0;
    opts.processor = {
      process: function () {
        count++;
        return Promise.resolve('style');
      }
    };
    opts.style = null;
    os.fromArray([layouts])
      .pipe(style(opts))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(0);
        done();
      });
  });

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
    opts.template = '/test/template/template.hbs';
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

  it('should css escaped sprite urls', function (done) {
    layouts.sprites.push({
      name: 'sprite@3x',
      url: '../images/tes"te/sprite@3x.png',
      type: 'png',
      dpi: 288,
      ratio: 3,
      width: 50,
      height: 300
    });
    os.fromArray([layouts])
      .pipe(style(opts))
      .pipe(spy(function (res) {
        if (res.style) {
          res.style.toString().should.include('tes%22te');
        }
      }))
      .on('data', noop)
      .on('finish', function () {
        done();
      });
  });

  it('should throw an error when processor not found', function (done) {
    opts.processor = 'notpresent';
    os.fromArray([layouts])
      .pipe(style(opts))
      .on('data', noop)
      .on('error', function (e) {
        e.should.have.property('name', 'PluggableError');
        done();
      });
  });

  it('should log an error when processor not found', function (done) {
    var msg = '', error = '';
    opts.processor = 'notpresent';
    opts.cli = true;
    opts.logger = {
      error: function (e) {
        error = e;
      },
      debug: function (m) {
        msg = m;
      }
    };
    os.fromArray([layouts])
      .pipe(style(opts))
      .on('data', noop)
      .on('error', function (e) {
        error.should.include('notpresent');
        msg.should.include('npm install');
        done();
      });
  });
});
