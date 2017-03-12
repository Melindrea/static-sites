'use strict';

function parseImage(image, size)
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

        images[imageId] = parseImage(imagesSource[imageId], imageSize);
    }

    return images;
}

function plugin()
{
    return function (app)
    {
        var config = require('./../config'),
            each = require('async-each'),
            path = require('path'),
            gm = require('gm').subClass({
                imageMagick: true
            }),
            sizes = config.data.media.sizes,
            manifest = config.data['rev-manifest'] || [],
            types = config.data.site.types;

        app.define(
            'loadImages',
            function ()
            {
                types.forEach(function (name) {
                    var files = app.getViews(name),
                        config = require('./../config'),
                        gallery, imageId,
                        dataImages = app.cache.data.images;

                    for (var file in files) {
                        if (files[file].data.gallery) {
                            gallery = config.data.media.galleries[files[file].data.gallery].items;

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
                                        files[file].data.featuredImage = parseImage(dataImages[imageId], 'original');
                                    }
                            } else {
                                app.logError(files[file].data.featuredImage, file);
                            }
                        }
                    }
                });
            }
        );

        app.define(
            'processImages',
            function (cb)
            {
                var images = [],
                    image, sizeNames = [],
                    url;

                function newImage(size) {
                    image.size = size;
                    images.push(JSON.parse(JSON.stringify(image)));
                }

                for (var key in sizes) {
                    sizeNames.push(key);
                }

                for (var imageId in config.data.media.images) {

                    image = config.data.media.images[imageId];
                    image.id = imageId;

                    for (key in sizes) {
                        url = sizes[key].replace('<type>',
                            'gallery');
                        image[key + 'Url'] = url + image.src;
                    }

                    sizeNames.forEach(newImage);
                }

                for (imageId in config.data.media.covers) {
                    image = config.data.media.covers[imageId];
                    image.id = 'cover-' + imageId;

                    for (key in sizes) {
                        url = sizes[key].replace('<type>', 'covers');

                        image[key + 'Url'] = url + image.src;
                    }

                    sizeNames.forEach(newImage);
                }

                each(images, function(parsedImage, next) {
                        var fileUrl = parsedImage[parsedImage.size +
                                'Url'],
                            src;
                        parsedImage.revSrc = '';

                        if (fileUrl.substring(1) in manifest) {
                            parsedImage.revSrc = manifest[
                                fileUrl.substring(1)].replace(
                                sizes.original.substring(1),
                                ''
                            );
                        } else {
                            app.logError('Revised source missing for ' + fileUrl);
                        }
                        src = path.resolve(__dirname + '/..' +
                            fileUrl.replace(
                                'assets',
                                'assets/processed/' + config.site
                            ));

                        gm(src).size(function(err, value) {
                            if (err) {
                                next(err);
                            } else {
                                var dataImages = app.cache
                                    .data.images || {};
                                parsedImage.sizes = {};
                                var currentSize =
                                    parsedImage.size;

                                if (parsedImage.id in
                                    dataImages) {
                                    var existingImage =
                                        dataImages[
                                            parsedImage
                                            .id];
                                    parsedImage.sizes =
                                        existingImage.sizes;

                                    if (existingImage.size ===
                                        'original') {
                                        parsedImage.size =
                                            existingImage
                                            .size;
                                        parsedImage.revSrc =
                                            existingImage
                                            .revSrc;
                                    }
                                }

                                parsedImage.sizes[
                                        currentSize] =
                                    value;
                                dataImages[parsedImage.id] =
                                    parsedImage;
                                app.data({
                                    images: dataImages
                                });
                                next();
                            }
                        });
                    },
                    cb
                );
            }
        );
    };
}


/**
 * Expose `plugin`.
 */

module.exports = plugin;
