/**
 * Assemble plugin to add a gallery from `media.yaml`.
 *
 * @return {Function}
 */

function plugin(name) {
    return function(app) {
        var files = app.getViews(name),
            config = require('./../config'),
            gallery, size, items = [], sizes, images, image;

        for (var file in files) {
            if (files[file].data.gallery) {
                gallery = config.media.galleries[files[file].data.gallery];
                size = gallery.size,
                sizes = config.media.sizes,
                images = config.media.images;

                gallery.items.forEach(function (imageId) {
                    if (imageId in images) {
                        image = images[imageId];
                        var newItem = {
                            id: imageId,
                            alt: image.alt,
                            caption: image.caption,
                            url: sizes[size] + image.src,
                            thumbnailUrl: sizes.thumbnail + image.src
                        };

                        items.push(newItem);
                    }
                });

                files[file].data.gallery = items;
            }

        }
    };
}

/**
 * Expose `plugin`.
 */

module.exports = plugin;
