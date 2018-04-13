// Utility Function to store the mouse position
var currentMousePos = { x: -1, y: -1 };
$(document).mousemove(function(event) {
    currentMousePos.x = event.pageX;
    currentMousePos.y = event.pageY;
});

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
        draggable: "false",
        onmousedown: 'dragmove.startMoving(this,"pinboard",event);',
        onmouseup: 'dragmove.stopMoving("pinboard");'
    })
}

var dragmove = function(){
    return {
        move : function(divid,xpos,ypos){
            divid.style.left = xpos + 'px';
            divid.style.top = ypos + 'px';
        },
        startMoving : function(divid,container,evt){
            evt = evt || window.event;
            var posX = evt.clientX,
                posY = evt.clientY,
                divTop = divid.style.top,
                divLeft = divid.style.left,
                eWi = parseInt(divid.style.width),              // Element width
                eHe = parseInt(divid.style.height),             // Element height
                container = $("#" + container);                 // JQuery selection
                cWi = container.width(),                        // Container width
                cHe = container.height(),                       // Container height
                pcWi = container.parent().width(),              // Visible width
                pcHe = container.parent().height();             // Visible height
            container.css(cursor='move');
            divTop = divTop.replace('px','');
            divLeft = divLeft.replace('px','');
            var diffX = posX - divLeft,
                diffY = posY - divTop;
            document.onmousemove = function(evt){
                evt = evt || window.event;
                var posX = evt.clientX,
                    posY = evt.clientY,
                    aX = posX - diffX,
                    aY = posY - diffY;
                    // Out of bounds checking
                    if (aX < 0) aX = 0;
                    if (aY < 0) aY = 0;
                    if (aX + eWi > cWi) aX = cWi - eWi;
                    if (aY + eHe > cHe) aY = cHe -eHe;
                dragmove.move(divid,aX,aY);
            }
        },
        stopMoving : function(container){
            var a = document.createElement('script');
            var container = $("#" + container);
            container.css(cursor='default');
            document.onmousemove = function(){}
        },
    }
}();