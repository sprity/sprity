'use strict';

function TileError (message, image) {
  this.name = 'TileError';
  this.message = message || 'Error generating tile';
  this.image = image;
}
TileError.prototype = Object.create(Error.prototype);
TileError.prototype.constructor = TileError;

function PluggableError (message, pluggable) {
  this.name = 'PluggableError';
  this.message = message || 'Error finding module';
  this.reason = 'This error gets triggered when the used image engine or style processor is not installed. For example to use sass as the style processor install sprity-sass first.';
  this.pluggable = pluggable;
}
PluggableError.prototype = Object.create(Error.prototype);
PluggableError.prototype.constructor = PluggableError;

function LayoutError (message) {
  this.name = 'LayoutError';
  this.message = message || 'No layouts created';
  this.reason = 'This error is most likely triggered by a wrong src glob used. You need to give a glob that gets evaluated to image files. For example \'./src/images/*.png\' will work but \'./src/images/\' won\'t.\nYou can read more about globs here: https://github.com/isaacs/node-glob#glob-primer';
}
LayoutError.prototype = Object.create(Error.prototype);
LayoutError.prototype.constructor = LayoutError;


module.exports = {
  TileError: TileError,
  PluggableError: PluggableError,
  LayoutError: LayoutError
};
