'use strict';
module.exports.lastUpdated = function (format) {
    var moment = require('moment'),
        file = this.view,
        time,
        lastUpdated;

        if (file.stat) {
            time = file.stat.mtime || file.stat.birthtime;
        }

        lastUpdated = moment(time);

        // console.log(file.path, lastUpdated.format());
        return lastUpdated.format(format);
};
