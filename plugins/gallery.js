/**
 * Assemble plugin to add a gallery from `media.yaml`.
 *
 * @return {Function}
 */

function plugin(name) {
    return function(app) {
        var files = app.getViews(name),
            config = require('./../config'),
            gallery, size, items = [], image, imageId,
            dataImages = app.cache.data.images;

       for (var file in files) {
            if (files[file].data.gallery) {
                gallery = config.media.galleries[files[file].data.gallery].items;

                files[file].data.gallery = getImageList(gallery, 'thumbnail', app.cache.data.images);
            }

            if (files[file].data.images) {
                gallery = files[file].data.images;
                files[file].data.images = {};

                files[file].data.images = getImageList(gallery, 'prop', app.cache.data.images);
            }

            if (files[file].data.featuredImage) {
                if (typeof files[file].data.featuredImage === 'string') {
                        imageId = files[file].data.featuredImage;
                        if (imageId in dataImages) {
                            files[file].data.featuredImage = parseImageNew(dataImages[imageId], 'original');
                        }
                } else {
                    console.log(files[file].data.featuredImage);
                }
            }
        }
    };
}

function parseImageNew(image, size)
{
    image.url = image[size + 'Url'];
    image.size = {};
    image.size.height = image.sizes[size].height;
    image.size.width = image.sizes[size].width;

    return image;
}

function getImageList(gallery, size, imagesSource)
{
    var imageSize = size,
        imageId,
        images = {};

    for (var imageKey in gallery) {
        if (gallery instanceof Array) {
            imageId = gallery[imageKey];
        } else {
            imageId = gallery[imageKey].id;
            if (size === 'prop') {
                imageSize = gallery[imageKey].size;
            }
        }

        images[imageId] = parseImageNew(imagesSource[imageId], imageSize);
    }

    return images;
}


/**
 * Expose `plugin`.
 */

module.exports = plugin;
