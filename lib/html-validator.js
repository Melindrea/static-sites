'use strict';

module.exports = (function () {
    var fs = require('fs'),
    html5Lint = require('html5-lint'),
    path = require('path'),
    config = require('../config'), dir = config.pkg.config.buildDir,
    walk = require('walk'), walker, data = [];

    walker = walk.walk(dir, {filters: ['assets']});

    walker.on('file', function (root, fileStats, next) {
        var fileName = root + '/' + fileStats.name;

        fs.readFile(fileName, 'utf-8', function (err, content) {
            if (err) {
                throw err;
            }

            html5Lint(content, function (err, results) {
                var messages = [];

                if (results !== undefined) {
                    results.messages.forEach(function (msg) {
                        messages.push({type: msg.type, message: msg.message});
                    });

                    if (messages.length > 0 && path.extname(fileName) === '.html') {
                        data.push({name: fileName, messages: messages});
                    }
                }
                next();
            });
        });
    });

    walker.on('end', function () {
        var dataLength = data.length, object, messageLength, message, type;

        for (var i = 0; i < dataLength; i++) {
            if (i > 0) {
                console.log('-----');
            }

            object = data[i];
            console.log('HTML5 Lint [File]: %s', config.info(object.name));
            console.log('====');

            messageLength = object.messages.length;
            for (var j = 0; j < messageLength; j++) {
                message = object.messages[j];
                if (message.type === 'error') {
                    type = config.error(message.type);
                } else {
                    type = config.warning(message.type);
                }
                console.log('HTML5 Lint [%s]: %s', type, message.message);
            }
        }

        if (dataLength > 0) {
            process.exit(1);
        } else {
            console.log(config.success('HTML5 valid!'));
        }
    });
}());
