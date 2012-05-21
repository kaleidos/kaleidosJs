/* Kaleidos sameheight.js 
 *
 * Copyright (c) 2011 Kaleidos <hello@kaleidos.net>
 * Copyright (c) 2011 Juan Francisco Alcántara <juanfran.alcantara@kaleidos.net>
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
*/

(function($) {
    $.fn.sameheight = function(params) {
        if (this.length) var items = $(this).find(params.searchSelector);
        else var items = $(params.searchSelector);

        items.each(function() {
            var elm1 = $(this);
            var elm2 = $($(this).data("sameheight"));

            if(elm1.outerHeight() > elm2.outerHeight()) {
                var diff = elm1.outerHeight() - elm2.outerHeight();
                elm2.css('height', elm2.height() + diff);
            } else if (elm1.outerHeight() < elm2.outerHeight()) {
                var diff = elm2.outerHeight() - $(this).outerHeight();
                elm1.css('height', elm1.height() + diff);
            }
        });
    };
})(jQuery);
