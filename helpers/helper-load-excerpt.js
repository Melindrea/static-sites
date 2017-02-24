'use strict';
module.exports.loadExcerpt = function (key) {
    var Handlebars = require('handlebars'),
        fs = require('fs'),
        sprintf = require('sprintf-js').sprintf,
        Remarkable = require('remarkable'),
        md = new Remarkable(),
        file = sprintf('%s/../../%s/excerpts/%s.md', __dirname, this.options.contentDir, key),
        excerpt = fs.readFileSync(file, 'utf8');

    return new Handlebars.SafeString(md.render(excerpt));
};
