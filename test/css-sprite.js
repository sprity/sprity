'use strict';

var should = require('should');
var sprite = require('../lib/css-sprite');
var path = require('path');
var vfs = require('vinyl-fs');
var through2 = require('through2');
var Canvas = require('canvas');
var Image = Canvas.Image;
var noop = function () {};

require('mocha');

describe('css-sprite (lib/css-sprite.js)', function () {
  it('should return a object stream with a sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        var img = new Image();
        img.src = file.contents;
        file.path.should.equal('dist/img/sprites.png');
        file.relative.should.equal('sprites.png');
        img.width.should.equal(138);
        img.height.should.equal(552);
        cb();
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a bigger sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        margin: 20
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        var img = new Image();
        img.src = file.contents;
        img.width.should.equal(168);
        img.height.should.equal(672);
        cb();
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a horizontal sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        orientation: 'horizontal'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        var img = new Image();
        img.src = file.contents;
        file.path.should.equal('dist/img/sprites.png');
        file.relative.should.equal('sprites.png');
        img.width.should.equal(552);
        img.height.should.equal(138);
        cb();
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a sprite and a css file', function (done) {
    var png, css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        style: './dist/css/sprites.css'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('png') > -1) {
          png = file;
        }
        else {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        png.should.be.ok;
        png.path.should.equal('dist/img/sprites.png');
        png.relative.should.equal('sprites.png');
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.css');
        css.relative.should.equal('sprites.css');
        css.contents.toString('utf-8').should.containEql('.icon-camera');
        css.contents.toString('utf-8').should.containEql('.icon-cart');
        css.contents.toString('utf-8').should.containEql('.icon-command');
        css.contents.toString('utf-8').should.containEql('.icon-font');
        done();
      });
  });
  it('should return a object stream with retina sprite, normal sprite and css with media query', function (done) {
    var png = [], css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        style: './dist/css/sprites.css',
        retina: true
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('png') > -1) {
          png.push(file)
        }
        else {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        var normal = new Image();
        var retina = new Image();
        normal.src = png[0].contents;
        retina.src = png[1].contents;
        png.length.should.equal(2);
        png[0].relative.should.equal('sprites.png');
        png[1].relative.should.equal('sprites-x2.png');
        retina.width.should.equal(normal.width * 2);
        retina.height.should.equal(normal.height * 2);
        css.contents.toString('utf-8').should.containEql('@media');
        done();
      });
  });
  it('should return a object stream with a css file with custom class names', function (done) {
    var css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        style: './dist/css/sprites.css',
        prefix: 'test-selector'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('css') > -1) {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.css');
        css.relative.should.equal('sprites.css');
        css.contents.toString('utf-8').should.containEql('.test-selector');
        done();
      });
  });
  it('should return a object stream with a sprite and a scss file', function (done) {
    var png, css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        processor: 'scss',
        style: './dist/css/sprites.scss'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('png') > -1) {
          png = file;
        }
        else {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        png.should.be.ok;
        png.path.should.equal('dist/img/sprites.png');
        png.relative.should.equal('sprites.png');
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.scss');
        css.relative.should.equal('sprites.scss');
        css.contents.toString('utf-8').should.containEql('$camera');
        css.contents.toString('utf-8').should.containEql('$cart');
        css.contents.toString('utf-8').should.containEql('$command');
        css.contents.toString('utf-8').should.containEql('$font');
        done();
      });
  });
  it('should return a object stream with a css file with base64 encoded sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        base64: true,
        out: './dist/css'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.relative.should.equal('sprite.css');
        file.contents.toString('utf-8').should.containEql('data:image/png;base64');
        cb();
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a css with media query and base64 encoded sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        base64: true,
        retina: true
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.relative.should.equal('sprite.css');
        file.contents.toString('utf-8').should.containEql('@media');
        file.contents.toString('utf-8').should.containEql('data:image/png;base64');
        cb();
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should do nothing when no files match', function (done) {
    var file = false;
    vfs.src('./test/fixtures/empty/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png'
      }))
      .pipe(through2.obj(function (f, cb) {
        file = file;
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        file.should.not.ok;
        done();
      });
  });
  it('should throw error when file stream', function (done) {

    vfs.src('./test/fixtures/**', {buffer: false})
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png'
      }))
      .on('error', function (err) {
        err.toString().should.equal('Error: Streaming not supported');
        done();
      })
  });
});
