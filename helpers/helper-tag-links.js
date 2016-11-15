'use strict';

module.exports['tag-links'] = function (tags) {
    var tagLinks = [],
        helper = this.context.helpers['link-to-taxonomy'];

    tags.forEach(function (tag) {
        var link = '<a href="' + helper(tag) + '">' + tag + '</a>';
        tagLinks.push(link);
    });

    return tagLinks.join(', ');
};
