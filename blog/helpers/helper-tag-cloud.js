'use strict';
module.exports['tag-cloud'] = function () {
    var tagCloud = require('tag-cloud');

    return tagCloud.tagCloud(this.tags, function (err, data) {
        return data;
    },
    {
        htmlTag: 'a',
        additionalAttributes: {
            href: '{{url}}'
        }
    });
};
