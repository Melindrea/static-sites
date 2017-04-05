(function (w) {
    'use strict';

    var className = 'fonts-loaded',
        bodyTypeface = 'Linux Libertine',
        bodyFont, bodyFontBold, bodyFontItalic, bodyFontBoldItalic;

    // If the class is already set, we're good.
    if (w.document.documentElement.className.indexOf(className) > -1 ){
        return;
    }

    bodyFont = new w.FontFaceObserver(bodyTypeface, {});

    bodyFontBold = new w.FontFaceObserver(bodyTypeface, {
        weight: 'bold'
    });

    bodyFontItalic = new w.FontFaceObserver(bodyTypeface, {
        style: 'italic'
    });

    bodyFontBoldItalic = new w.FontFaceObserver(bodyTypeface, {
        weight: 'bold',
        style: 'italic'
    });

    w.Promise
        .all([
            bodyFont.check(),
            bodyFontBold.check(),
            bodyFontItalic.check(),
            bodyFontBoldItalic.check()
        ])
        .then(function () {
            w.document.documentElement.className += ' ' + className;
        });
}(this));
