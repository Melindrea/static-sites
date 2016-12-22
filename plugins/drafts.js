/**
 * Assemble plugin to remove files marked as `draft` from a collection.
 *
 * @return {Function}
 */
'use strict';

function plugin(name) {
    return function(app) {
        var files = app.getViews(name);

        for (var file in files) {
            if (files[file].data.draft) {
                delete files[file];
            }
        }

    };
}

/**
 * Expose `plugin`.
 */

module.exports = plugin;
