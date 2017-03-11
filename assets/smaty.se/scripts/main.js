// The following code sets up the galleries and individual thumbnail-scripts, unless the window-width < 500px
$(document).ready(function() {
    'use strict';

    var defaultValues = {
        type:'image',
        disableOn: function () {
            // Detect here whether you want to show the popup
            // return true if you want
            if ($(window).width() < 500) {
                return false;
            }
            return true;
        },
        image: {
            titleSrc: function (item) {
                var caption = $(item.el).parent('figure').find('figcaption');
                if (caption.length > 0) {
                    return caption.html();
                }
                return '';
            }
        }
    };
    $('[data-rel=thumbnail]').magnificPopup(defaultValues);

    $('.js-gallery').each(function () {
        $(this).find('[data-rel=thumbnail]').magnificPopup(
            $.extend({}, defaultValues,
                {
                    gallery: {
                    preload: [0,2], // read about this option in next Lazy-loading section

                    navigateByImgClick: true,

                    enabled: true
                }
            }
        ));
    });
});
