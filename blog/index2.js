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
        console.log('hrmm?');
        app.define(
            'loadWidgets',
            function (posts)
            {
                console.log(posts);
            }
        );
    };
};
