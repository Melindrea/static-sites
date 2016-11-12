'use strict';
module.exports.siteTitle = function (title) {
    var siteTitle = this.site.title,
        titleSeparator = this.site.titleSeparator,
        pageName = this.context.view.basename.split('.'),
        pageSlug = pageName[0];

    if (pageSlug === 'index' || title === undefined) {
        return 'Welcome to ' + siteTitle;
    }

    return title + ' ' + titleSeparator + ' ' + siteTitle;
};
