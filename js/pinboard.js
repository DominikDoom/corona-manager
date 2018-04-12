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
            eWi = parseInt(divid.style.width),                  // Element width
            eHe = parseInt(divid.style.height),                 // Element height
            cWi = parseInt(document.getElementById(container).style.width), // Container width
            cHe = parseInt(document.getElementById(container).style.height);    // Container height
            document.getElementById(container).style.cursor='move';
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
                    if (aX < 0) aX = 0;
                    if (aY < 0) aY = 0;
                    // Out of bounds checking
                    if (aX + eWi > cWi) aX = cWi - eWi;
                    if (aY + eHe > cHe) aY = cHe -eHe;
                dragmove.move(divid,aX,aY);
            }
        },
        stopMoving : function(container){
            var a = document.createElement('script');
            document.getElementById(container).style.cursor='default';
            document.onmousemove = function(){}
        },
    }
}();