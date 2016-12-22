'use strict';
module.exports['item-type'] = function () {
    var base = 'http://schema.org/';

        // Specified schema type
        if (this.schemaType) {
            return base + this.schemaType;
        }

        // Blog posts
        if (this.metaType === 'article') {
            return base + 'BlogPosting';
        }

        // Tags & categories, Blog index
        if (this.type || this.posts) {
            return base + 'Blog';
        }

        return 'http://schema.org/WebPage';
};
