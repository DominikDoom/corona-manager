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
            var data = {
                id: uuidv4()
            }
            var template = $("#pinboardObject-image-template").html();
            var html = Mustache.render(template, data);
            $("#pinboard").append(html);
            var addedObject = $( "p:contains(" +  data.id + ")").closest(".pinboardObject");
            setImage(addedObject);
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
        case "toolboxObject-map":
            
            break;
    }
}

function setImage(addedObject) {
    dialog.showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png']}]}, function (FileName) {	// Diese Funktion wird beim öffnen einer Bilddatei aufgerufen
        if (FileName !== undefined) {
            addedObject.find(".pinboardObject-image").css("background-image",'url("' + FileName + '")');
        }
    });
}

// UI events
var imageBackgroundTypes = ['cover','contain','100% 100%'];
var imagebackgroundState = 0;
$(document).on('click', ".pinboardObject-image", function(ev){
    if (ev.ctrlKey) {
        var state = $(this).css('background-size')
        switch (state) {
            case 'cover':
            $(this).css('background-size','contain')
                break;
            case 'contain':
            $(this).css('background-size','100% 100%')
                break;
            case '100% 100%':
            $(this).css('background-size','cover')
                break;
        }   
    }
});

// Context Menu for Pinboard Objects
$(function() {
    $.contextMenu({
        selector: '.imageObj-context-menu', 
        callback: function(key, options) {
            var m = "clicked: " + key;
            window.console && console.log(m) || alert(m); 
        },
        items: {
            "edit": {name: "Change image", icon: "edit"},
            "sep1": "---------",
            "delete": {name: "Delete", icon: "delete"}
        }
    });

    $('.imageObj-context-menu').on('click', function(e){
        if (this == 'edit') {
            setImage();
        }
    })    
});


// Markdown processing
