'use strict';
module.exports.copyright = function () {
    var site = this.context.pkg.homepage,
        copyright = this.context.site.copyright;

    return '<a href="' + site + '">' + copyright + '</a>';
};
