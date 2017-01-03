'use strict';

var chalk = require('chalk'),
    growl = require('growl');

module.exports = function () {
    return function(app) {
        app.define(
            'logError',
            function (error) {
                console.log(chalk.bold.red(error));
                growl(error);
            }
        );

        app.define(
            'logWarning',
            function (warning) {
                console.log(chalk.yellow(warning));
            }
        );

        app.define(
            'logInfo',
            function (info) {
                console.log(chalk.cyan(info));
            }
        );

        app.define(
            'logDebug',
            function (debug) {
                console.log(chalk.blue(debug));
            }
        );

        app.define(
            'logSuccess',
            function (success) {
                console.log(chalk.bold(success));
            }
        );

        app.helper('log', function (debug) {
            console.log(chalk.blue(debug));
        });

    };
};
