#!/usr/bin/env node

'use strict';

var argv = require('yargs')
    .default('env', 'dev')
    .help('h')
    .alias('h', 'help')
    .epilog('Copyright 2017')
    .example('$0 SKU', 'Creates a QR-code from the specified SKU')
    .usage('Usage: $0 <SKU> [medium]')
    .demand(1)
    .argv,

    sku = argv._[0],
    medium = argv._[1] || 'notebook',
    id = new Date().valueOf(),
    name = 'qr-codes/' + id + '.svg',

    qr = require('qr-image'),
    fs = require('fs'),
    url = 'https://blaukatter.se/?utm_source=etsy&utm_medium=' + medium + '&utm_content=' + sku,

    code = qr.image(url, { type: 'svg' }),
    output;

    output = fs.createWriteStream(name);

    fs.appendFileSync('qr-codes/key.txt', url + '\t' + name + '\n');
code.pipe(output);
