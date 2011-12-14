$(document).ready(function(){
    $(".block").each(function(){
        var elm = $(this);
        elm.load(elm.attr('rel'));
    });
});
