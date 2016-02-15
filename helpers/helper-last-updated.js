'use strict';
module.exports.lastUpdated = function () {
    var fs = require('fs'),
        moment = require('moment'),
        file = this.context.view.path,
        fileStats = fs.statSync(file),
        lastUpdated = moment(fileStats.mtime);

        return lastUpdated.format();
};
