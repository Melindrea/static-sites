'use strict';
module.exports.characterProfile = function (key) {
    var Handlebars = require('handlebars'),
        config = require('./../config'),
        characterData = config.data.characters,
        character = characterData.characters[key],
        partial = this.app.partials.getView('character-profile'),
        template = Handlebars.compile(partial.content);

    return template(character);
};
