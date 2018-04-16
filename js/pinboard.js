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
    var type = ev.dataTransfer.getData("text");
    switch (type) {
        case "toolboxObject-text":
            var data = {
                id: uuidv4()
            }
            var template = $("#pinboardObject-text-template").html();
            var html = Mustache.render(template, data);
            $("#pinboard").append(html);
            var addedObject = $( "p:contains(" +  data.id + ")").closest(".pinboardObject");
            addedObject.css({
                left: ev.pageX - (addedObject.width() / 2),
                top: ev.pageY - addedObject.height()
            })
        
            var handle = $("<div class='resize-handle'></div>").appendTo(addedObject);
            TweenLite.set(handle, { top: "150px", left: "201px" });

            Draggable.create(addedObject, {
                bounds: pinboard,
                autoScroll: 2,
                edgeResistance: 1,
                type: "top,left"
            });

            Draggable.create(handle, {
                type:"top,left",
                bounds:{minX:201,minY:150,maxX:Number.MAX_VALUE,maxY:Number.MAX_VALUE},
                onPress: function(e) {
                    e.stopPropagation(); // cancel drag
                },
                onDrag: function(e) {
                    TweenLite.set(this.target.parentNode, { width: this.x, height: this.y });
                }
            });
            break;
        case "toolboxObject-image":

            break;
        case "toolboxObject-map":
            
            break;
    }
}

function addPinboardObject(type,dropX,dropY) {
    
}