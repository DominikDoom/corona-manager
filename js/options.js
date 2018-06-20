$(document).on("click", "#navOptionsButton", function (e) {
    $(".optionsOverlay").css("display","block");
});

$(document).on("click", "#optionsClose", function (e) {
    // To Do: Unsaved settings check
    $(".optionsOverlay").css("display","none");
});

// Tab Switching
$(document).on("click", ".optionsTab", function (e) {
    var tabContents = $(".optionsTable");
    var tabs = $(".optionsTab");
    var active = $(this).attr("tabId");
    
    // Active Tab styling
    $.each(tabs, function(index, element) {
        $(element).removeClass("optionsTab-active");
    });
    $(this).addClass("optionsTab-active");

    // Show / Hide Tab content
    $.each(tabContents, function(index, element) {
        if ($(element).attr("contentId") == active) {
            $(element).css("display","table");
        } else {
            $(element).css("display","none");
        }
    });
});