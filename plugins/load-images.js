'use strict';

function plugin() {
   return function(app) {
       var config = require('./../config'),
           each = require('async-each'),
           path = require('path'),
           gm = require('gm').subClass({imageMagick: true}),
           sizes = config.media.sizes,
           manifest = require('./../data/rev-manifest.json');

         app.define('processImages', function(cb) {
            var images = [], image, sizeNames = [], url;
            function newImage(size)
            {
                image.size = size;
                images.push(JSON.parse(JSON.stringify(image)));
            }

           for (var key in sizes) {
                sizeNames.push(key);
            }

           for (var imageId in config.media.images) {

               image = config.media.images[imageId];
               image.id = imageId;

               for (key in sizes) {
                    url = sizes[key].replace('<type>', 'gallery');
                    image[key + 'Url'] = url + image.src;
              }

              sizeNames.forEach(newImage);
           }

           for (imageId in config.media.covers) {
               image = config.media.covers[imageId];
               image.id = 'cover-' + imageId;

               for (key in sizes) {
                    url = sizes[key].replace('<type>', 'covers');

                    image[key + 'Url'] = url + image.src;
              }

              sizeNames.forEach(newImage);
           }


           each(images, function(parsedImage, next) {
               var fileUrl = parsedImage[parsedImage.size + 'Url'],
                   src;
               parsedImage.revSrc = '';

               if (fileUrl.substring(1) in manifest) {
                  parsedImage.revSrc = manifest[fileUrl.substring(1)].replace(sizes.original.substring(1), '');

               }
               src = path.resolve(__dirname + '/..' + fileUrl.replace(
                   'assets',
                   'processed'
               ));

               gm(src).size(function (err, value) {
                   if (err) {
                       next(err);
                   } else {
                        var dataImages = app.cache.data.images || {};
                        parsedImage.sizes = {};
                        var currentSize = parsedImage.size;

                        if (parsedImage.id in dataImages) {
                            var existingImage = dataImages[parsedImage.id];
                            parsedImage.sizes = existingImage.sizes;

                            if (existingImage.size === 'original') {
                                parsedImage.size = existingImage.size;
                                parsedImage.revSrc = existingImage.revSrc;
                            }
                        }

                        parsedImage.sizes[currentSize] = value;
                        dataImages[parsedImage.id] = parsedImage;
                        app.data({images: dataImages});
                        next();
                   }
               });
           }, cb);
       });
   };
}


/**
 * Expose `plugin`.
 */

module.exports = plugin;
