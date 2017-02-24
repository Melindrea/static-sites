'use strict';

// Based on http://blog.codehatcher.com/node-js-alternate-config-file
module.exports = (function () {
    var fs = require('fs'),
        path = require('path'),
        pkg = require('./package.json'),
        YAML = require('yamljs'),
        argv = require('yargs')
            .default({
                env: process.env.NODE_ENV || 'local',
                site: pkg.name || 'antoniusm.se',
                dataDir: 'data'
            })
            .argv;

        var data = {},
            dir = __dirname + '/' + argv.dataDir + '/' + argv.site + '/';

        fs.readdirSync(dir).forEach(function (file) {
            if (path.extname(file) === '.yaml') {
                data[file.replace(/\.yaml$/, '')] = YAML.load(dir + file);
            } else if (path.extname(file) === '.json') {
                data[file.replace(/\.json$/, '')] = require(dir + file);
            }
        });

        data.global =  YAML.load(__dirname + '/' + argv.dataDir + '/global.yaml');

    switch (argv.env) {
        case 'local':
            return {
                env: 'local',
                site: argv.site,
                pkg: pkg,
                gtm: data.site.gtm.local,
                data: data
            };
        case 'prod':
        case 'production':
            return {
                env: 'prod',
                site: argv.site,
                pkg: pkg,
                gtm: data.site.gtm.production,
                data: data
            };
        default:
            throw new Error('Environment Not Recognized');
    }
}());
