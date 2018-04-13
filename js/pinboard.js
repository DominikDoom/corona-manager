// Cursor change on pan
$(document).on('mousedown', ".pinboard", function() {
    $(".pinboard").css('cursor','-webkit-grabbing');
});
$(document).on('mouseup', ".pinboard", function() {
    $(".pinboard").css('cursor','default');
});

// Drag & Drop
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var addedObject = $("#" + data).clone().appendTo(ev.target);
    addedObject.addClass("pinboardObject");
    addedObject.css({
        left: ev.pageX - (addedObject.width() / 2),
        top: ev.pageY - addedObject.height()
    })
    addedObject.attr({
        draggable: "false"
    })

    Draggable.create(addedObject, {
		bounds: "pinboard",
        autoScroll: 2,
		edgeResistance: 0.65,
        type: "top,left"
    });
}