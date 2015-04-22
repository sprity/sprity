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
  this.pluggable = pluggable;
}
PluggableError.prototype = Object.create(Error.prototype);
PluggableError.prototype.constructor = PluggableError;

function LayoutError (message) {
  this.name = 'LayoutError';
  this.message = message || 'No layouts created';
}
LayoutError.prototype = Object.create(Error.prototype);
LayoutError.prototype.constructor = LayoutError;


module.exports = {
  TileError: TileError,
  PluggableError: PluggableError,
  LayoutError: LayoutError
};
