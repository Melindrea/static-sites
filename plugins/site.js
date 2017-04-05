'use strict';

/**
 * Expose `plugin`.
 */


/**
 * Assemble plugin to remove files marked as `draft` from a collection.
 *
 * @return {Function}
 */
module.exports = function () {
    return function(app) {

        app.task('create-site', function () {
            var prompt = require('prompt');

            prompt.start();

            prompt.get(
                [
                    {
                        name: 'domain',
                        description: 'Canon Domain',
                        required: true
                    }, {
                        name: 'domainAlias',
                        description: 'Domain Alias'
                    },
                    {
                        name: 'hasBlog',
                        type: 'boolean',
                        description: 'Site with posts?'
                    }
                ],
                function (err, result) {
                    // var fs = require('fs');

                    if (err) {
                        return app.logError(err);
                    }

                    if (! result.domainAlias) {
                        result.domainAlias = 'www.' + result.domain;
                    }

                    result.domainSlug = result.domain.replace('.', '-');

                    if (result.hasBlog) {
                        console.log('Site with blog');
                    } else {
                        console.log('Site without blog');
                    }
                    // fs.readFile( __dirname + '/../templates/misc/nginx-conf.hbs', function (err, file) {
                    //     if (err) {
                    //         throw err;
                    //     }

                    //     var Handlebars = require('handlebars'),
                    //         template = Handlebars.compile(file.toString()),
                    //         text = template(result),
                    //         filename = __dirname + '/../../nginx/conf.d/' + result.domainSlug + '.conf';

                    //     console.log(filename);
                    //     if (fs.existsSync(filename)) {
                    //         app.logError('The file with name ' + filename + ' already exists');
                    //     } else {
                    //         fs.writeFile(filename, text, function (err) {
                    //             if (err) {
                    //                 return app.logError(err);
                    //             }
                    //             app.logSuccess('Created new conf.d at ' + filename);
                    //         });
                    //     }
                    // });

                    console.log('/home/marie/certbot-auto certonly -a webroot --webroot-path=/srv/web/' + result.domain + ' -d ' + result.domain + ' -d ' + result.domainAlias);
                }
            );
        });
    };
};
