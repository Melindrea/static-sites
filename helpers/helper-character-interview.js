'use strict';
module.exports.characterInterview = function (key) {
    var Handlebars = require('handlebars'),
        config = require('./../config'),
        characterData = config.data.characters,
        questions = characterData.questions,
        answers = characterData.characters[key].answers,
        partial = this.app.partials.getView('faq'),
        template = Handlebars.compile(partial.content),
        mapped = [], data = {};

    questions.forEach(function (value, index) {
        mapped.push({
            question: value,
            answer: answers[index]
        });
    });

    data.questions = mapped;
    return template(data);
};
