/**
 * Assemble plugin to remove files marked as `draft` from a collection.
 *
 * @return {Function}
 */
'use strict';

function plugin(name) {
    return function(app) {
        var files = app.getViews(name),
            count = require('word-count');

        for (var file in files) {
            files[file].data.wordCount = count(files[file].content);
        }

    };
}

/**
 * Expose `plugin`.
 */

module.exports = plugin;
