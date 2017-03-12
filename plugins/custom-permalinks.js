'use strict';

/**
 * Expose `plugin`.
 */


/**
 * Assemble plugin to remove files marked as `draft` from a collection.
 *
 * @return {Function}
 */
module.exports = function () {
    return function(app) {
        app.define(
            'pagePermalink',
            function (filename) {
                var path = require('path'),
                    filePath = path.dirname(filename),
                    lastDir = filePath.match(/([^\/]*)\/*$/)[1],
                    name = path.basename(filename, path.extname(filename)),
                    folder = (lastDir !== 'pages') ? lastDir + '/' : '';

                if (name === 'index') {
                    return folder + 'index.html';
                }

                return folder + name + '/index.html';
            }
        );

        app.define(
            'archivePermalink',
            function (filename) {
                var bits = filename.substr(5).split('&&'),
                    folder,
                    name = bits[0];
                if (name === 'index') {
                    if (bits.length > 1 && bits[1] > 1) {
                        return bits[1] + '/index.html';
                    }
                    return 'index.html';
                }

                folder = name.replace('::', '/');

                if (bits.length > 1 && bits[1] > 1) {
                    return folder + '/' + bits[1] + '/index.html';
                }
                return folder + '/index.html';
            }
        );

        app.define(
            'postPermalink',
            function (filename, dirname) {
                var bits = dirname.split('/'),
                    trimmed = filename.substring(4),
                    postsIndex = bits.indexOf('posts');

                if (postsIndex === bits.length - 1) {
                    return trimmed + '/index.html';
                }

                return bits.slice(postsIndex + 1).join('/') + '/' + trimmed + '/index.html';
            }

        );
    };
};
