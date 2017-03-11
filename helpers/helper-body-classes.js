'use strict';
module.exports.bodyClasses = function () {
    var pageSlug = 'c-page__' + this.view.filename,
        classes = [];

        classes.push(pageSlug);
        if (this.context.parent) {
            classes.push('c-parent__' + this.context.parent);
        }


        if (this.context.layout) {
            classes.push('o-layout__' + this.context.layout);
        } else {
            classes.push('o-layout__-' + this.context.options.layout);
        }

    var thing =  classes.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    }).join(' ');

    return thing;
};
