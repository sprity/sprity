'use strict';

var should = require('chai').should();
var tile = require('../lib/tile');
var vfs = require('vinyl-fs');
var spy = require('through2-spy').obj;
var noop = function () {};

require('mocha');

var opts = {
  cssPath: '../images',
  name: 'sprite',
  logger: {
    log: noop,
    warn: noop,
    debug: noop,
    error: noop,
    success: noop
  }
};

describe('sprity tile (lib/tile.js)', function () {
  it('should return a stream with one tile object', function (done) {
    var count = 0;
    vfs.src('./test/fixtures/camera.png')
      .pipe(tile(opts))
      .pipe(spy(function (t) {
        t.should.have.property('width', 128);
        t.should.have.property('height', 128);
        t.should.have.property('name', 'camera');
        count++;
      }))
      .on('data', noop)
      .on('end', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should return a stream with two tile objects', function (done) {
    var count = 0;
    vfs.src('./test/fixtures/ca*.png')
      .pipe(tile(opts))
      .pipe(spy(function () {
        count++;
      }))
      .on('data', noop)
      .on('end', function () {
        count.should.equal(2);
        done();
      });
  });

  it('should return one tile object with image type png', function (done) {
    var count = 0;
    vfs.src('./test/fixtures/command.png')
      .pipe(tile(opts))
      .pipe(spy(function (t) {
        t.should.have.property('type', 'png');
        count++;
      }))
      .on('data', noop)
      .on('end', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should return one tile object with image type jpg', function (done) {
    var count = 0;
    vfs.src('./test/fixtures/jpg.jpg')
      .pipe(tile(opts))
      .pipe(spy(function (t) {
        t.should.have.property('type', 'jpg');
        count++;
      }))
      .on('data', noop)
      .on('end', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should ignore wrong file globs', function (done) {
    var count = 0;
    vfs.src('./test/fixtures')
      .pipe(tile(opts))
      .pipe(spy(function () {
        count++;
      }))
      .on('data', noop)
      .on('end', function () {
        count.should.equal(0);
        done();
      });
  });

  it('should ignore all files but images', function (done) {
    var count = 0;
    vfs.src('./test/fixtures/**')
      .pipe(tile(opts))
      .pipe(spy(function () {
        count++;
      }))
      .on('data', noop)
      .on('end', function () {
        count.should.equal(5);
        done();
      });
  });

  it('should show warning when image is ignored', function (done) {
    var warn = '';
    opts.logger = {
      warn: function (m) {
        warn = m;
      }
    };

    vfs.src('./test/fixtures/**')
      .pipe(tile(opts))
      .on('data', noop)
      .on('end', function () {
        warn.should.contain('Ignoring');
        warn.should.contain('fail.txt');
        done();
      });
  });
});
