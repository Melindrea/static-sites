'use strict';
module.exports.taxonomies = function () {
    var slugify = require('underscore.string/slugify'),
        ret = [],
        data = this.data;

    if (data) {
        ret.push('t-category-' + slugify(data.category));

        data.tags.forEach(function (tag) {
            ret.push('t-tag-' + slugify(tag));
        });
    } else {
        if (this.category) {
            ret.push('t-category-' + slugify(this.category));
        }

        if (this.tags) {
            this.tags.forEach(function (tag) {
                ret.push('t-tag-' + slugify(tag));
            });
        }
    }



    return ret.join(' ');
};
