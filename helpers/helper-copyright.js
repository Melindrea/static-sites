'use strict';
module.exports.copyright = function (className) {
    var site = this.context.site.url,
        copyright = this.context.site.copyright,
        htmlClass = '';

    if (typeof className !== 'object') {
        htmlClass = 'class="' + className + '" ';
    }
    return '<a ' + htmlClass + 'href="' + site + '">' + copyright + '</a>';
};
