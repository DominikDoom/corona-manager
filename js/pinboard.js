var pinboardObjectToDelete;

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
            localizeElement(addedObject,currentLang);
        
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
            localizeElement(addedObject,currentLang);
        
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
        if (FileName[0] !== undefined) {
            addedObject.find(".pinboardObject-image").css("background-image",'url("' + fileUrl(FileName[0]) + '")');
        }
    });
}

function fileUrl(str) {
    if (typeof str !== 'string') {
        throw new Error('Expected a string');
    }

    var pathName = path.resolve(str).replace(/\\/g, '/');

    // Windows drive letter must be prefixed with a slash
    if (pathName[0] !== '/') {
        pathName = '/' + pathName;
    }

    return encodeURI('file://' + pathName);
};

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

$(document).on('click', "#deletePinboardObject", function(ev){
    pinboardObjectToDelete = $(this).parent().parent().parent();
    deleteMode = "pinboardObject";								// Der deleteMode gibt der Dialogsbestätigungsfunktion an, welcher Löschvorgang ausgeführt werden soll
	$(".alertOverlay").css("display","block");				    // Das Bestätigungsoverlay und der darin liegende Ja-Nein-Dialog werden sichtbar gemacht
});

// Markdown processing
