$(window).scroll(function() {
    $(window).scrollTop() > 500 ? $("#rocket").addClass("show fa fa-arrow-circle-up") : $("#rocket").removeClass("show  fa fa-arrow-circle-up");
});
$("#rocket").click(function () {
    
    //$("#rocket").addClass("launch");
    $("html, body").animate({
        scrollTop: 0
    }, 500, function() {
        $("#rocket").removeClass("show launch");
    });
    return false;
});
