'use strict';

var chalk = require('chalk');

// Based on http://blog.codehatcher.com/node-js-alternate-config-file
module.exports = (function () {
    var pkg = require('./package.json'),
        YAML = require('yamljs'),
        argv = require('yargs').argv,
        dataDir = argv.dataDir || 'data',
        siteConfig =  YAML.load(dataDir + '/site.yaml'),
        error = chalk.bold.red,
        warning = chalk.yellow,
        info = chalk.cyan,
        debug = chalk.blue,
        success = chalk.bold;

    switch (process.env.NODE_ENV) {
        case null:
        case undefined:
        case 'local':
            return {
                env: 'local',
                site: siteConfig,
                dataDir: dataDir,
                pkg: pkg,
                error: error,
                warning: warning,
                info: info,
                debug: debug,
                success: success,
                gtm: 'GTM-N2JHDQ'
            };
        case 'prod':
        case 'production':
            return {
                env: 'prod',
                site: siteConfig,
                dataDir: dataDir,
                pkg: pkg,
                error: error,
                warning: warning,
                info: info,
                debug: debug,
                success: success,
                gtm: 'GTM-PFTL8C'
            };
        default:
            throw new Error('Environment Not Recognized');
    }
}());
