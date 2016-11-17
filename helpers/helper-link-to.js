'use strict';

var path = require('path');

module.exports.linkTo = function (key, collectionName) {
    var name = collectionName,
        msg;

  if (typeof name === 'object') {
    name = null;
  }

  name = name || 'pages';

  if (! this || typeof this.app === 'undefined') {
    msg = '[helper-link-to]: Requires an "app" created with "templates".';
    console.error(msg);
    return '';
  }

  var collection = this.app[name];
  if (typeof collection === 'undefined') {
    msg = '[helper-link-to]: Unable to find collection "' + name + '".';
    console.error(msg);
    return '';
  }

  var target;
  try {
    target = collection.getView(key);
  } catch (err) {
    msg = '[helper-link-to]: Unable to find view "' + key + '" in collection "' + name + '".\n' + err.message;
    console.log(msg);
    return '';
  }

  if (! target || ! Object.keys(target).length) {
    msg = '[helper-link-to]: Unable to find view "' + key + '" in collection "' + name + '".';
    console.error(msg);
    return '';
  }

    var link = path.dirname(target.dest).replace(this.context.pkg.config.buildDir, '') + '/';

      return link;
};
