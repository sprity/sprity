# css-sprite

[![NPM version](https://badge.fury.io/js/css-sprite.svg)](http://badge.fury.io/js/css-sprite) [![Build Status](https://travis-ci.org/aslansky/css-sprite.svg?branch=1.0)](https://travis-ci.org/aslansky/css-sprite) [![Coverage Status](https://img.shields.io/coveralls/aslansky/css-sprite.svg)](https://coveralls.io/r/aslansky/css-sprite) [![Code Climate](https://codeclimate.com/github/aslansky/css-sprite/badges/gpa.svg)](https://codeclimate.com/github/aslansky/css-sprite) [![Dependencies](https://david-dm.org/aslansky/css-sprite.svg)](https://david-dm.org/aslansky/css-sprite)

> A css sprite generator.

> Generates sprites and proper css files out of a directory of images.

> Supports retina sprites.

> Can inline base64 encoded sprites.

## Requirements

Starting with version 0.9 `css-sprite` has no external dependencies

## Install

Install with [npm](https://npmjs.org/package/css-sprite)

```
npm install css-sprite --save
```

If you want to use `css-sprite` on your cli install with:

```
npm install css-sprite -g
```

## Command Line Interface

```sh
Usage: css-sprite <out> <src>... [options]

out     path of directory to write sprite file to
src     glob strings to find source images to put into the sprite

Options:
   -b, --base64           create css with base64 encoded sprite (css file will be written to <out>)
   -c, --css-image-path   http path to images on the web server (relative to css path or absolute path)  [../images]
   -d, --dimension        the used dimensions for the sprite. A combination of ratio and dpi. For example -d 2:192 would generate a sprite for device-pixel-ratio:2 and min-resolution: 192dpi.
                          Multiple dimensions are allowed. Defaults to 1:72
   -e, --engine           image processing engine  [css-sprite-lwip]
   -f, --format           output format of the sprite (png or jpg)  [png]
   -n, --name             name of sprite file without file extension   [sprite]
   -p, --processor        style processing module  [css-sprite-css]
   -t, --template         output template file, overrides processor option
   -s, --style            file to write css to, if omitted no css is written
   -w, --watch            continuously create sprite
   --background           background color of the sprite in hex  [#FFFFFF]
   --cachebuster          appends a "cache buster" to the background image in the form "?<...>" (random)  [false]
   --margin               margin in px between tiles  [4]
   --interpolation        Interpolation algorithm used when scaling retina images (nearest-neighbor|moving-average|linear|grid|cubic|lanczos)
   --opacity              background opacity (0 - 100) of the sprite. defaults to 0 when png or 100 when jpg  [0]
   --orientation          orientation of the sprite image (vertical|horizontal|binary-tree)  [vertical]
   --prefix               prefix for the class name used in css (without .)
   --no-sort              disable sorting of layout
   --split                create sprite images for every sub folder  [false]
   --style-indent-char    Character used for indentation of styles (space|tab)  [space]
   --style-indent-size    Number of characters used for indentation of styles  [2]
```

## Programatic usage
```
var sprite = require('css-sprite');
sprite.create(options, cb);
```

### Options
* **src:** Array or string of globs to find source images to put into the sprite.  [required]
* **out:** path of directory to write sprite file to  [process.cwd()]
* **base64:** when true instead of creating a sprite writes base64 encoded images to css (css file will be written to `<out>`)
* **cssPath:** http path to images on the web server (relative to css path or absolute)  [../images]
* **format** format of the generated sprite (png or jpg). By default uses png.
* **name:** name of the sprite file without file extension  [sprite]
* **processor:** output format of the css. one of css, less, sass, scss or stylus  [css]
* **template:** output template file, overrides processor option (must be a [mustache](http://mustache.github.io/) template)
* **retina:** generate both retina and standard sprites. src images have to be in retina resolution
* **background** background color of the sprite in hex. Defaults to #FFFFFF
* **cachebuster** appends a "cache buster" to the background image in the form "?<...>" (random)  [false]
* **style:** file to write css to, if omitted no css is written
* **margin:** margin in px between tiles.  (Use an even number if generating retina sprites).  [4]
* **opacity** background opacity of the sprite between 0 and 100. Defaults to 0 when png or 100 when jpg
* **orientation:** orientation of the sprite image (vertical|horizontal|binary-tree) [vertical]
* **prefix:** prefix for the class name used in css (without .) [icon]
* **sort:** enable/disable sorting of layout [true]
* **interpolation** Interpolation algorithm used when scaling retina images to standard definition. Possible values are `nearest-neighbor`,`moving-average`,`linear`,`grid`,`cubic`,`lanczos`. Defaults to `grid`.


### Example
```js
var sprite = require('css-sprite');
sprite.create({
  src: ['./src/img/*.png'],
  out: './dist/img'
  name: 'sprites',
  style: './dist/scss/_sprites.scss',
  cssPath: '../img',
  processor: 'scss'
}, function () {
  console.log('done');
});
```

## Usage with [Gulp](http://gulpjs.com)
```js
var gulp = require('gulp');
var gulpif = require('gulp-if');
var sprite = require('css-sprite');

// generate sprite.png and _sprite.scss
gulp.task('sprites', function () {
  return sprite.src({
    src: './src/img/*.png'
    name: 'sprite',
    style: 'sprite.css',
    cssPath: './img'
  })
  .pipe(gulpif('*.png', gulp.dest('./dist/img/'), gulp.dest('./dist/css/')))
});

## Usage with [Grunt](http://gruntjs.com)

You can use the [css-sprite grunt plugin](https://npmjs.org/package/css-sprite)

## Using your own template

To use your own [handlebars](http://handlebarsjs.com/) template for style file creation pass in the -t option followed by the template path. The following variables are available in the handlebars template:

* **items** -- array of objects with the sprite tiles
  * **name** -- name of the tile
  * **x** -- x position
  * **y** -- y position
  * **width**
  * **height**
  * **offset_x** -- x offset within the sprite
  * **offset_y** -- y offset within the sprite
  * **class** -- class name of the tile
  * **px** -- object with pixel values instead of raw data (e.g width: '250px')
      * **x**, **y**, **offset_x**, **offset_y**, **height**, **width**, **total_height**, **total_width**
* **sprite** -- object with information about the sprite itself
  * **name** -- name of the sprite
  * **image** -- css path to sprite or base64 encode string
  * **escaped_image** -- escaped css path to sprite or base64 encode string
  * **class** -- class name of the sprite
* **retina** -- object with information about the retina sprite
  * **name** -- name of the retina sprite
  * **image** -- css path to retina sprite
  * **escaped_image** -- escaped css path to retina sprite
  * **class** -- class name of the retina sprite
  * **total_width** -- height of the retina sprite (for background-size)
  * **total_height** -- width of the retina sprite (for background-size)
  * **px** -- object with pixel values
    * **total_width**, **total_height**

If you want to redistribute your template you can also write a custom style processor.
