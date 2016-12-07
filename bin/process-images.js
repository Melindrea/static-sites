#!/usr/bin/env node

'use strict';

// module.exports = (function () {
var gm = require('gm').subClass({
        imageMagick: true
    }),
    fs = require('fs'),
    path = require('path');

    var p = __dirname + '/../assets/raw/in-progress';
    fs.readdir(p, function (err, files) {
        if (err) {
            throw err;
        }

        files.map(function (file) {
            return path.join(p, file);
        }).filter(function (file) {
            return fs.statSync(file).isFile() && path.extname(file);
        }).forEach(function (file) {
            console.log('%s (%s)', file, path.extname(file));
        });
    });
// }());
