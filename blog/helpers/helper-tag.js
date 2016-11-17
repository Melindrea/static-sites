'use strict';
module.exports.withTag = function (array, tag, options) {
    var filtered = array.filter(function (item) {
        return (item.data.tags.indexOf(tag.toLowerCase()) > -1);
    }),
        result = '';

    filtered = filtered.reverse();

    for (var i = 0; i < filtered.length; i++) {
        result += options.fn({item: filtered[i], index: i});
    }

    return result;
};
