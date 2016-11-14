'use strict';
module.exports.withCategory = function (array, category, options) {
    var filtered = array.filter(function (item) {
        return item.data.category === category;
    }),
        result = '';


    var alen = filtered.length, j = -1;
    while (++j < alen) {
        result += options.fn(filtered[j]);
    }

    return result;
};
