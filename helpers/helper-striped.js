'use strict';
module.exports.striped = function (index) {
    return (index%2 === 0) ? 'even' : 'odd';
};
