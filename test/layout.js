'use strict';

var should = require('chai').should();
var layout = require('../lib/layout');
var spy = require('through2-spy').obj;
var os = require('object-stream');
var noop = function () {};

require('mocha');

var opts = {
  margin: 4,
  orientation: 'vertical',
  split: false,
  sort: true
};

describe('sprity layout (lib/layout.js)', function () {

  it('should return a stream with one layout object', function (done) {
    var count = 0;
    os.fromArray([{
        base: '/mock/fixtures/',
        height: 100,
        width: 100
      }, {
        base: '/mock/fixtures2/',
        height: 100,
        width: 100
      }])
      .pipe(layout(opts))
      .pipe(spy(function (res) {
        var l = res.layout;
        l.items.length.should.equal(2);
        l.should.have.property('width', 108);
        l.should.have.property('height', 216);
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(1);
        done();
      });
  });

  it('should return a stream with two layout objects, when folder splitting is activted', function (done) {
    var count = 0;
    opts.split = true;
    require('object-stream').fromArray([{
        base: '/mock/fixtures/',
        height: 100,
        width: 100
      }, {
        base: '/mock/fixtures2/',
        height: 100,
        width: 100
      }])
      .pipe(layout(opts))
      .pipe(spy(function () {
        count++;
      }))
      .on('data', noop)
      .on('finish', function () {
        count.should.equal(2);
        done();
      });
  });

});
