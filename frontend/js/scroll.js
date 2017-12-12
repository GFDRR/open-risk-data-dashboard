/**
 * Created by Manuel on 21/12/2016.
 */

$(function() {
    $('#startReadingBtn').click(function() {
        $('html, body').animate({
            scrollTop: $("#startReading").offset().top
        }, 1000);
    });

    $('a[href*="#"]:not([href="#"])').click(function() {
        //if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        //}
    });

});
