'use strict';

module.exports = function () {
    return function (app) {
        function bumpAndTag(importance) {
            var git = require('gulp-git'),
                bump = require('gulp-bump'),
                filter = require('gulp-filter'),
                tagVersion = require('gulp-tag-version');

        // get all the files to bump version in
        return app.src(['./package.json', '/.bower.json'], {layout: null})
            // bump the version number in those files
            .pipe(bump({type: importance}))
            // save it back to filesystem
            .pipe(app.dest('./'))
            // commit the changed version number
            .pipe(git.commit('Bump site version'))

            // read only one file to get the version number
            .pipe(filter('package.json'))
            // **tag it in the repository**
            .pipe(tagVersion());
        }

        app.task('patch', function () { return bumpAndTag('patch'); });
        app.task('feature', function () { return bumpAndTag('minor'); });
        app.task('release', function () { return bumpAndTag('major'); });
    };
};
