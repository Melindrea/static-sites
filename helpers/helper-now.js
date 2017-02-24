'use strict';
module.exports.now = function () {
    var moment = require('moment');
    return moment().format('MMMM Do YYYY');
};
