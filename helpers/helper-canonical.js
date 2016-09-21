'use strict';
module.exports.canonical = function (fullUrl) {
    var site = this.options.pkg.homepage,
        buildDir = this.options.pkg.config.buildDir,
        canonical = this.options.permalink
            .replace(buildDir, site)
            .replace('index.html', '');

    if (fullUrl === false) {
        canonical = canonical.replace(site, '');
    }

    return canonical;
};
