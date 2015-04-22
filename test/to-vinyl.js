'use strict';

var should = require('chai').should();
var spy = require('through2-spy').obj;
var os = require('object-stream');
var toVinyl = require('../lib/to-vinyl');

var noop = function () {};

require('mocha');

var opts = {}, sprites = {}, style = {};

beforeEach(function () {
  opts = {
    out: 'test/out',
    style: 'style.css',
    processor: 'css'
  };

  sprites = {
    name: 'default',
    classname: 'icon',
    sprites: [{
      name: 'sprite',
      url: '../images/sprite.png',
      type: 'png',
      content: new Buffer('123')
    }, {
      name: 'sprite@1.5x',
      url: '../images/sprite@1.5x.png',
      type: 'png',
      content: new Buffer('123')
    }]
  };

  style = {
    style: new Buffer('.test {background: red}'),
    extension: '.css'
  };
});

describe('sprity to-vinyl (lib/to-vinyl.js)', function () {

  it('should return a stream of vinyl objects', function (done) {
    var count = 0;
    os.fromArray([sprites, style])
      .pipe(toVinyl(opts))
      .pipe(spy(function (res) {
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(3);
        done();
      });
  });

  it('should return a stream of vinyl objects and append file extension to style if not provided', function (done) {
    var count = 0;
    var cssCount = 0;
    opts.style = 'style';

    os.fromArray([sprites, style])
      .pipe(toVinyl(opts))
      .pipe(spy(function (res) {
        if (res.path === 'test/out/style.css') {
          cssCount++;
        }
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(3);
        cssCount.should.equal(1);
        done();
      });
  });
});
