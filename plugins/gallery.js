/**
 * Assemble plugin to add a gallery from `media.yaml`.
 *
 * @return {Function}
 */

function plugin(name) {
    return function(app) {
        var files = app.getViews(name),
            config = require('./../config'),
            gallery, size, items = [], sizes;

        for (var file in files) {
            if (files[file].data.gallery) {
                gallery = config.media.galleries[files[file].data.gallery];
                size = gallery.size,
                sizes = config.media.sizes;

                gallery.items.forEach(function (item) {
                    var newItem = {
                        id: item.id,
                        alt: item.alt,
                        caption: item.caption,
                        url: sizes[size] + item.src,
                        thumbnailUrl: sizes.thumbnail + item.src
                    };

                    items.push(newItem);
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
