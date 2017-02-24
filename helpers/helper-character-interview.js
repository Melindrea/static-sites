'use strict';
module.exports.characterInterview = function (key) {
    var Handlebars = require('handlebars'),
        questions = this.options.character.questions,
        answers = this.options.character.characters[key].answers,
        template = this.app.getPartial('faq'),
        mapped = [], data = {};

    questions.forEach(function (value, index) {
        mapped.push({
            question: value,
            answer: answers[index]
        });
    });

    data.questions = mapped;
    return new Handlebars.SafeString(template.render(data));
};
