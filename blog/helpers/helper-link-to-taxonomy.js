'use strict';

var path = require('path');

module.exports['link-to-taxonomy'] = function (taxonomyName) {
    var collectionName = 'archives',
        msg;

  if (typeof collectionName === 'object') {
    collectionName = null;
  }

  collectionName = collectionName || 'pages';

  if (! this || typeof this.app === 'undefined') {
    msg = '[helper-link-to]: Requires an "app" created with "templates".';
    console.error(msg);
    return '';
  }

  var collection = this.app[collectionName];
  if (typeof collection === 'undefined') {
    msg = '[helper-link-to]: Unable to find collection "' + collectionName + '".';
    console.error(msg);
    return '';
  }

    var target = false;
    for (var key in collection.views) {
        var view = collection.getView(key);

        if (view.data.name === taxonomyName) {
            target = view;
            break;
        }
    }

  if (! target || ! Object.keys(target).length) {
    msg = '[helper-link-to]: Unable to find view "' + taxonomyName + '" in collection "' + collectionName + '".';
    console.error(msg);
    return '';
  }
    var link = path.dirname(target.dest).replace(this.context.pkg.config.buildDir, '') + '/';

      return link;
};
