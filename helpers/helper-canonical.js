'use strict';
module.exports.canonical = function () {
    var site = this.options.pkg.homepage,
        buildDir = this.options.pkg.config.buildDir,
        canonical = this.options.permalink
            .replace(buildDir, site)
            .replace('index.html', '');

    return canonical;
};
