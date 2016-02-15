'use strict';

module.exports = (function () {
    var fs = require('fs'),
        cheerio = require('cheerio'),
        path = require('path'),
        config = require('../config'), dir = config.pkg.config.buildDir,
        walk = require('walk'), walker, data = [],
        descriptionMin = 130, descriptionMax = 156, titleMax = 65;

    walker = walk.walk(dir, {filters: ['assets']});

    walker.on('file', function (root, fileStats, next) {
        var fileName = root + '/' + fileStats.name;

        fs.readFile(fileName, 'utf-8', function (err, content) {
            if (err) {
                throw err;
            }

            if (path.extname(fileName) === '.html') {
                var $ = cheerio.load(content),
                    obj = {
                        name: fileName,
                        description: null,
                        title: $('title').html()
                    };
                $('meta').each(function () {
                    if ($(this).attr('name') === 'description') {
                        obj.description = $(this).attr('content');
                    }
                });

                data.push(obj);
            }

            next();
        });
    });

    walker.on('end', function () {
        var sprintf = require('sprintf-js').sprintf,
            dataLength = data.length, object, fileData, fileDataLength,
            errors = false;

        for (var i = 0; i < dataLength; i++) {
            fileData = [];

            object = data[i];
            fileData.push(sprintf('Meta Lint [File]: %s', config.info(object.name)));
            fileData.push('====');

            if (! object.description) {
                fileData.push(sprintf('* %s', config.error('No meta description')));
            } else {
                if (object.description.length > descriptionMax ||
                    object.description.length < descriptionMin) {
                    fileData.push(sprintf(
                        '* %s',
                        config.error(sprintf(
                            'Meta description should be %d-%d characters, is %d',
                            descriptionMin,
                            descriptionMax,
                            object.description.length
                        ))
                    ));
                }

                data.forEach(function (entry) {
                    if (entry.description === object.description &&
                        entry.name !== object.name) {
                        fileData.push(sprintf(
                            '* %s',
                            config.error(sprintf(
                                'Duplicate description found in %s',
                                entry.name
                            ))
                        ));
                    }
                });
            }

            if (object.title.length > titleMax) {
                fileData.push(sprintf(
                    '* %s',
                    config.error(sprintf(
                        'Title should be max %d characters, is %d',
                        titleMax,
                        object.title.length
                    ))
                ));
            }

            data.forEach(function (entry) {
                if (entry.title === object.title &&
                    entry.name !== object.name) {
                    fileData.push(sprintf(
                        '* %s',
                        config.error(sprintf(
                            'Duplicate title found in %s',
                            entry.name
                        ))
                    ));
                }
            });

            // [todo] - Add keywords for each page and check title + description

            fileDataLength = fileData.length;
            if (fileDataLength > 2) {
                errors = true;
                for (var j = 0; j < fileDataLength; j++) {
                    console.log(fileData[j]);
                }
                if (i > 0) {
                    console.log('-----');
                }
            }
        }

        if (errors) {
            process.exit(1);
        } else {
            console.log(config.success('Meta validated'));
        }
    });
}());
