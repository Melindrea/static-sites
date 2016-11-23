/**
 * Assemble plugin to add a gallery from `media.yaml`.
 *
 * @return {Function}
 */
var Fiber = require('fibers');

function plugin(name) {
    return function(app) {
        var files = app.getViews(name),
            config = require('./../config'),
            gallery, size, items = [], image;

        for (var file in files) {
            // Fiber(function () {
            if (files[file].data.gallery) {
                gallery = config.media.galleries[files[file].data.gallery].items;
                files[file].data.gallery = {};

                loadImageList(gallery, files[file].data.gallery, 'thumbnail');
            }

            if (files[file].data.images) {
                gallery = files[file].data.images;
                files[file].data.images = {};

                loadImageList(gallery, files[file].data.images, 'prop');
            }

            if (files[file].data.featuredImage) {
                if (typeof files[file].data.featuredImage === 'string') {
                    // Fiber(function () {
                        files[file].data.featuredImage = parseImage(files[file].data.featuredImage, 'original');
                    // }).run();
                } else {
                    console.log(files[file].data.featuredImage);
                }
            }
        // }).run();
        }
    };
}

function loadImageList(gallery, images, size)
{
        var imageSize = size,
            imageId;
        for (var imageKey in gallery) {
    // Fiber(function () {
            if (gallery instanceof Array) {
                imageId = gallery[imageKey];
            } else {
                imageId = gallery[imageKey].id;
                if (size === 'prop') {
                    imageSize = gallery[imageKey].size;
                }
            }

            images[imageId] = parseImage(imageId, imageSize);
            // console.log(images);
    // }).run();
        }
}

function parseImage(imageId, size)
{
    var config = require('./../config'),
        path = require('path'),
        gm = require('gm').subClass({imageMagick: true}),
        sizes = config.media.sizes,
        manifest = require('./../data/rev-manifest.json'),
        parsedImage = {},
        fileUrl;

    if (imageId in config.media.images) {
        image = config.media.images[imageId];
        parsedImage.revSrc = '';
        fileUrl = sizes[size] + image.src;
        parsedImage.url = sizes[size] + image.src;
        parsedImage.size = {
            width: 0,
            height: 0
        };

        var src = path.resolve(__dirname + '/..' + parsedImage.url.replace('assets', 'processed'));
        // var fiber = Fiber.current;
        gm(src).size(function (err, value) {
                // console.log(src);
            if (err) {
                console.log(err);
            } else {
                // console.log(value);
                // fiber.run(value);
            }
        });
        // parsedImage.size = Fiber.yield();

        if (fileUrl.substring(1) in manifest) {
            parsedImage.revSrc = manifest[fileUrl.substring(1)].replace(sizes.original.substring(1), '');

        }
        parsedImage.id = imageId;
        parsedImage.alt = image.alt;

        if (image.caption) {
            parsedImage.caption = image.caption;
        }

        for (var key in sizes) {
            parsedImage[key + 'Url'] = sizes[key] + image.src;
        }
    }

    return parsedImage;
}

/**
 * Expose `plugin`.
 */

module.exports = plugin;
