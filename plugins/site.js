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

        // var createConfd = function (domain, alias) {

        // }
        app.task('create-conf.d', function () {
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
                    }
                ],
                function (err, result) {
                    var fs = require('fs');

                    if (err) {
                        return app.logError(err);
                    }

                    if (! result.domainAlias) {
                        result.domainAlias = 'www.' + result.domain;
                    }

                    fs.readFile( __dirname + '/../templates/misc/nginx-conf.hbs', function (err, file) {
                        if (err) {
                            throw err;
                        }

                        var Handlebars = require('handlebars'),
                            template = Handlebars.compile(file.toString()),
                            text = template(result),
                            filename = __dirname + '/../../nginx/conf.d/' + result.domain.replace('.', '-')+ '.conf';

                        console.log(filename);
                        if (fs.existsSync(filename)) {
                            app.logError('The file with name ' + filename + ' already exists');
                        } else {
                            fs.writeFile(filename, text, function (err) {
                                if (err) {
                                    return app.logError(err);
                                }
                                app.logSuccess('Created new conf.d at ' + filename);
                            });
                        }
                    });
                }
            );
        });
    };
};
