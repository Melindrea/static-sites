(function (w) {
    'use strict';

    var className = 'fonts-loaded',
        bodyTypeface = 'Linux Libertine',
        headerTypeface = 'Atreyu',
        bodyFont, bodyFontBold, bodyFontItalic, bodyFontBoldItalic,
        headerFont;

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

    headerFont = new w.FontFaceObserver(headerTypeface, {});

    w.Promise
        .all([
            bodyFont.check(),
            bodyFontBold.check(),
            bodyFontItalic.check(),
            bodyFontBoldItalic.check(),
            headerFont.check()
        ])
        .then(function () {
            w.document.documentElement.className += ' ' + className;
        });
}(this));
