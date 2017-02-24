'use strict';
module.exports.characterProfile = function (key) {
    var Handlebars = require('handlebars'),
        characters = this.options.character,
        character = characters.characters[key],
        template = this.app.getPartial('character-profile');

    return new Handlebars.SafeString(template.render(character));
};
