'use strict';
module.exports.withCategory = function (array, category, options) {
    var filtered = array.filter(function (item) {
        return item.data.category === category;
    }),
        result = '';

    filtered = filtered.reverse();

    for (var i = 0; i < filtered.length; i++) {
        result += options.fn({item: filtered[i], index: i});
    }

    return result;
};
