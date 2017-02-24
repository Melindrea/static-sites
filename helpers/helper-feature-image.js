'use strict';

module.exports.featuredImage = function (imageId) {
    var Handlebars = require('handlebars'),
        template, data, images = this.options.media.images,
        dir = '/' + this.options.media.directories.image + '/large/',
        imageSource;
    if (imageId && imageId in images) {
        imageSource = dir + images[imageId].source;

        data = {
            source: imageSource,
            size: images[imageId].sizes.large,
            alt: images[imageId].alt,
            classes: 'img-polaroid featured-image'
        };
        template = this.app.getPartial('image');
        return new Handlebars.SafeString(template.render(data));
    }
};
