# sprity

[![NPM version](https://badge.fury.io/js/sprity.svg)](http://badge.fury.io/js/sprity) [![Build Status](https://travis-ci.org/sprity/sprity.svg?branch=master)](https://travis-ci.org/sprity/sprity) [![Coverage Status](https://img.shields.io/coveralls/sprity/sprity.svg)](https://coveralls.io/r/sprity/sprity) [![Code Climate](https://codeclimate.com/github/sprity/sprity/badges/gpa.svg)](https://codeclimate.com/github/sprity/sprity) [![Dependencies](https://david-dm.org/sprity/sprity.svg)](https://david-dm.org/sprity/sprity)

> A modular image sprite generator.

> Generates sprites and proper style files out of a directory of images.

> Supports retina sprites.

> Can inline base64 encoded sprites.

> Supports different output formats

> Supports different image engines

## Install

Install with [npm](https://npmjs.org/package/sprity)

```
npm install sprity --save
```

If you want to use `sprity` on your cli install with:

```
npm install sprity -g
```

## Usage

### Programatic usage

```js
var sprity = require('sprity');
sprity.create(options, cb);
```

### CLI

See [sprity-cli](https://npmjs.org/package/sprity-cli) for how to use `sprity` on the command line.

### With [Gulp](http://gulpjs.com)

You can use the sprity.src method with gulp. It creates a gulp compatible vinyl stream. It takes an options object as its only argument.

```js
var gulp = require('gulp');
var gulpif = require('gulp-if');
var sprity = require('sprity');

// generate sprite.png and _sprite.scss
gulp.task('sprites', function () {
  return sprity.src({
    src: './src/images/**/*.{png,jpg}',
    style: './sprite.css',
    // ... other optional options
    // for example if you want to generate scss instead of css
    processor: 'sass', // make sure you have installed sprity-sass
  })
  .pipe(gulpif('*.png', gulp.dest('./dist/img/'), gulp.dest('./dist/css/')))
});
```

### With [Grunt](http://gruntjs.com)

See [grunt-sprity](https://npmjs.org/package/grunt-sprity) for how to use `sprity` with [Grunt](http://gruntjs.com).

## Options

* **src:**               Array or string of globs to find source images to put into the sprite. Read more about globs [here](https://github.com/isaacs/node-glob) [required]
* **out:**               path of directory to write sprite file to  [*Default:* process.cwd()]
* **base64:**            inlines base64 encoded sprites in the style file
* **cssPath:**           path or url of sprites on the web server used to reference the sprite in the styles (relative or absolute path or full url)  [*Default:* ../images]
* **dimension:**         used dimensions for the sprite. A combination of ratio and dpi. Read more about dimensions: [How to specify dimensions](#how-to-specify-dimensions)
* **engine**             image processing engine.  Read more about engines: [Image processing engines](#image-processing-engines) [*Default:* lwip]
* **format**             output format of the sprite (Depends on what engine is used) [*Default:* png when used with lwip]
* **name**               name of sprite file without file extension [*Default:* sprite]
* **processor**          style processing module. Read more about style processors: [Style processors](#style-processors) [css]
* **template**           output template file, overrides processor option. Read more about templates: [Templates](#templates)
* **style**              file to write css to, if omitted no css is written (relative to out path)
* **background**         background color of the sprite in hex  [*Default:* #FFFFFF]
* **cachebuster**        appends a "cache buster" to the background image in the form "?<...>" (Boolean)  [*Default:* false]
* **margin**             margin in px between tiles  [*Default:* 4]
* **opacity**            background opacity (0 - 100) of the sprite. defaults to 0 when png or 100 when jpg [*Default:* 0]
* **orientation**        orientation of the sprite image (vertical|horizontal|binary-tree)  [*Default:* vertical]
* **prefix**             prefix for the class name used in css (without .)
* **no-sort**            disable sorting of layout. Read more about: [Layout algorithms](https://github.com/twolfson/layout#algorithms)
* **split**              create sprite images for every sub folder [*Default:* false] [How to use split option](#how-to-use-split-option)
* **style-indent-char**  Character used for indentation of styles (space|tab) [*Default:* space]
* **style-indent-size**  Number of characters used for indentation of styles  [*Default:* 2]

## How to specify dimensions

Dimensions are used to specify different sizes of sprites. You can for example create a normal and a retina sprite by providing the following object to `sprity's` options:

```js
'dimension': [{
  ratio: 1, dpi: 72
}, {
  ratio: 2, dpi: 192
}],
```

On command line this would work as follows:

```sh
sprity out/ images/*.png -s style.css -d 1:72 -d 2:192
```

You can provide as many dimensions as you want. Just keep in mind that the source images you provide need to be for the biggest dimension. For the above example the images would need to have 192dpi.

## How to use split option

When you enable the split option `sprity` will look at sub directories of the src option and will generate a sprite per sub directory.
For example if you have the following directory structure:

```
src
 |- icons
      |- editor
      |- file
      |- maps
      |- navigation
      |- notification
```

and the options:

```javascript
var options = {
  out: './dist',
  src: './src/icons/**/*.png',
  split: true
}
```

`sprity` will generate the following sprites in ./dist:

* sprite-editor.png
* sprite-file.png
* sprite-maps.png
* sprite-navigation.png
* sprite-notification.png

With [sprity-cli](https://npmjs.org/package/sprity-cli) you would use the command:

```sh
sprity create "./dist" "src/sprites/**/*.png" --split
```

To change the name of the sprites to for example icons-editor.png use the name option:

```javascript
var options = {
  out: './dist',
  src: './src/icons/**/*.png',
  split: true,
  name: 'icons'
}
```

## Image processing engines

`sprity` can use different image processing engines. `sprity` uses the engine to create and manipulate the sprites. Image processing engines may have there specific requirements. So before installing one please have a look at the documentation of the engine.

### Installation

Since image engines are just node.js modules you can install them with npm.

```sh
npm install <engine-name>
```

### Usage

You can switch image engines with the engine option. If the image engine name starts with `sprity-` you can omit that. For example to use [sprity-canvas](https://npmjs.org/package/sprity-canvas):

```sh
sprity out/ images/*.png -s style.css --engine canvas
# or
sprity out/ images/*.png -s style.css --engine sprity-canvas
```

### Available image processing engines

* [sprity-lwip](https://npmjs.org/package/sprity-lwip) - the default engine. is automatically installed, when installing `sprity`
* [sprity-canvas](https://npmjs.org/package/sprity-canvas) - uses [node-canvas](https://github.com/Automattic/node-canvas) to create sprites. Has some non-nodejs requirements.
* [sprity-gm](https://npmjs.org/package/sprity-gm) - uses [gm](https://www.npmjs.com/package/gm) as its image processing library. Requires GraphicsMagick or ImageMagick.

### Write your own

You can find more about how to write an image processing engine for `sprity` in the [sprity wiki](https://github.com/sprity/sprity/wiki/How-to-write-a-sprity-image-processor-engine)

## Style processors

Style processors generate are used for the generation of the style files. By default `sprity` can create css files, but with the help of style processors it can generate a lot of different formats.

### Installation

Style processors are simple node modules, you can install them with npm:

```sh
npm install <processor-name>
```

### Usage

You can switch style processors with the processor option. If the processor name starts with `sprity-` you can omit that. For example to use [sprity-sass](https://npmjs.org/package/sprity-sass):

```sh
sprity out/ images/*.png -s style.scss --processor sass
# or
sprity out/ images/*.png -s style.scss --processor sprity-sass
```

### Available style processors

* [sprity-css](https://npmjs.org/package/sprity-css) - the default style processor. is automatically installed, when installing `sprity`
* [sprity-sass](https://npmjs.org/package/sprity-sass) - generates scss or sass files
* [sprity-less](https://npmjs.org/package/sprity-less) - generates less files
* [sprity-css-rollover](https://github.com/xErik/sprity-css-rollover) - generates css rollovers
### Write your own

You can find more about how to write your own style processor in the [sprity wiki](https://github.com/sprity/sprity/wiki/How-to-write-a-sprity-style-processor)

## Templates

If you don't want to write a processor module or you only need a simple template for one of you're projects you can use the templating system of `sprity`.

`sprity` uses [http://handlebarsjs.com/](Handlebars) to process your templates. To quickly start you can use the templates from [sprity-css](https://github.com/sprity/sprity-css/blob/master/template/css.hbs) as a starting point.

### Available variables

You can find more about the variables and functions available in the handlebars templates in the [sprity wiki](https://github.com/sprity/sprity/wiki/Available-variable-in-custom-templates)

---
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/sprity/sprity?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
