'use strict';

module.exports.navItems = function (level) {
    var sprintf = require('sprintf-js').sprintf,
        Handlebars = require('handlebars'),
        view = this.context.view,
        pageName = view.basename.split('.'),
        pageSlug = pageName[0],
        parentSlug = '', // [todo] - find
        navigationConfig = this.site.navigation,
        nav = {}, navItems = [], heading = '', slug;

    if (level === 'root') {
        nav = navigationConfig;
    } else if (level === 'submenu') {
        slug = (parentSlug) ? parentSlug : pageSlug;
        if (slug in navigationConfig && 'children' in navigationConfig[slug]) {
            nav = navigationConfig[slug].children;
            heading = '<h2>' + navigationConfig[slug].item + '</h2>\n';
        }
    }

    // Visit non-inherited enumerable keys
    Object.keys(nav).forEach(function (key) {
        var isCurrentPage = (key === pageSlug),
            isActiveParent = (key === parentSlug),
            url = (isCurrentPage) ? nav[key].path + '#content' : nav[key].path,
            aria = (isCurrentPage) ? ' aria-describedby="current"' : '',
            linkClass = (isActiveParent) ? ' class="active-parent"' : '';

        navItems.push(sprintf('<li><a href="%s"%s%s>%s</a></li>', url, aria, linkClass, nav[key].item));
    });

    return new Handlebars.SafeString(heading + '<ul>\n' + navItems.join('\n') + '\n</ul>');
};
