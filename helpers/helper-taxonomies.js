'use strict';
module.exports.taxonomies = function () {
    var slugify = require('underscore.string/slugify'),
        category,
        ret = [],
        data = this.data;

    if (data) {
        ret.push('category-' + slugify(data.category));

        data.tags.forEach(function (tag) {
            ret.push('tag-' + slugify(tag));
        });
    } else {
        if (this.category) {
            ret.push('category-' + slugify(this.category));
        }

        if (this.tags) {
            this.tags.forEach(function (tag) {
                ret.push('tag-' + slugify(tag));
            });
        }
    }



    return ret.join(' ');
};
