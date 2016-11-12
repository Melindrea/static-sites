'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var through = require('through2');
var typogr = require('typogr');

module.exports = function (options) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) return cb(null, file);
    if (file.isStream()) return cb(new gutil.PluginError('typogr.js', 'Streaming not supported'));

    try {
      file.contents = new Buffer(typogr.typogrify(file.contents.toString()));
      this.push(file);
    } catch (err) {
      this.emit('error', new gutil.PluginError('typogr.js', err));
    }

    cb();
  });
};
