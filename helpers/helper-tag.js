'use strict';
module.exports.withTag = function (array, tag, options) {
    var filtered = array.filter(function (item) {
        return (item.data.tags.indexOf(tag) > -1);
    }),
        result = '';


    var alen = filtered.length, j = -1;
    while (++j < alen) {
        console.log(filtered[j]);
        result += options.fn(filtered[j]);
    }

    return result;
};
