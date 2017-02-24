'use strict';
module.exports.bodyClasses = function () {
    var pageSlug = this.context.src.name,
        classes = [];

        if (this.context.parent) {
            pageSlug = this.context.parent + '-' + pageSlug;
        }

        classes.push(pageSlug);

        if (this.context.layout) {
            classes.push(this.context.layout);
        } else {
            classes.push(this.context.options.layout);
        }

    return classes.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    }).join(' ');
};
