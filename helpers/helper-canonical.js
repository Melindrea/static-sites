'use strict';
module.exports.canonical = function (fullUrl) {
    var site = this.context.site.url,
        buildDir = this.context.pkg.config.buildDir,
        canonical = this.permalink
            .replace(buildDir, site)
            .replace('index.html', '');

    if (fullUrl === false) {
        canonical = canonical.replace(site, '');
    }

    return canonical;
};
