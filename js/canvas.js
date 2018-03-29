// Define `LimitedTextbox` class which extends `Textbox`
const LimitedTextbox = fabric.util.createClass(fabric.Textbox, {
    // Override `insertChars` method
    insertChars: function(chars) {
        if (this.maxWidth) {
            const textWidthUnderCursor = this._getLineWidth(this.ctx, this.get2DCursorLocation().lineIndex);
            if (textWidthUnderCursor + this.ctx.measureText(chars).width > this.maxWidth) {
            chars = '\n' + chars;
            }
        }

        if (this.maxLines) {
            const newLinesLength = this._wrapText(this.ctx, this.text + chars).length;
            if (newLinesLength > this.maxLines) {
            return;
            }
        }

        // Call parent class method
        this.callSuper('insertChars', chars);
    }
});

sizeCanvas();
var canvas = new fabric.Canvas('pinboard');
// Double-click event handler

var fabricDblClick = function (obj, handler) {
    return function () {
        if (obj.clicked) handler(obj);
        else {
            obj.clicked = true;
            setTimeout(function () {
                obj.clicked = false;
            }, 500);
        }
    };
};

// ungroup objects in group
var groupItems = []
var ungroup = function (group) {
    groupItems = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);
    for (var i = 0; i < groupItems.length; i++) {
        canvas.add(groupItems[i]);
    }
    // if you have disabled render on addition
    canvas.renderAll();
};

addTextBox();

/*  
##################################
##        Elementpresets		##
##           (Widgets)	    	##
##                          	##
##################################
*/

function addTextBox() {
    var ltb = new LimitedTextbox('text', {
            fill: '#fff',
            top: 5,
            left: 5,
            width: 300,
            maxWidth: 300,
            maxLines: 6
    });
    ltb.on('editing:exited', function () {
        var items = [];
        groupItems.forEach(function (obj) {
            items.push(obj);
            canvas.remove(obj);
        });
        var grp = new fabric.Group(items, {});
        canvas.add(grp);
        grp.on('mousedown', fabricDblClick(grp, function (obj) {
            ungroup(grp);
            canvas.setActiveObject(ltb);
            ltb.enterEditing();
            ltb.selectAll();
            canvas.renderAll();
        }));
    });

    var rect = new fabric.Rect({
        width: 310,
        height: 310,
        fill: '#333333',
        stroke: '#5b5b5b',
        opacity: 1
    });

    var ltbGroup = new fabric.Group([rect, ltb], {
        left: 50,
        top: 50
    });

    canvas.add(ltbGroup);
    ltbGroup.on('mousedown', fabricDblClick(ltbGroup, function (obj) {
        ungroup(ltbGroup);
        canvas.setActiveObject(ltb);
        ltb.enterEditing();
        ltb.selectAll();
    }));
}

/*  
##################################
##      Canvas-Interaktion		##
##         (Zoom & Pan)	    	##
##      und Größenanpassung    	##
##################################
*/

$('.canvasOverlay').mousewheel(function(e) {
    if (e.originalEvent.deltaY < 0) {
        var newZoom = canvas.getZoom() * 1.1;
    } else {
        var newZoom = canvas.getZoom() / 1.1
    }
    canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, newZoom);
});

var panning = false, 
    _drawSelection = canvas._drawSelection;

canvas.on('mouse:up', function (e) {
    canvas._drawSelection = _drawSelection;
    panning = false;
});
canvas.on('mouse:down', function (e) {
    if (e.e.altKey === true) {
        canvas._drawSelection = function(){ };
        panning = true;
    }
});
canvas.on('mouse:move', function (e) {
    if (panning && e.e.altKey && e && e.e) {
        var units = 10;
        var delta = new fabric.Point(e.e.movementX, e.e.movementY);
        canvas.relativePan(delta);
    }
});

function sizeCanvas() {
    var currCanvas = document.getElementById('pinboard');
    var currCtx = currCanvas.getContext('2d');
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    currCanvas.style.position = "fixed";
    currCanvas.setAttribute("width", viewportWidth);
    currCanvas.setAttribute("height", viewportHeight);
    currCanvas.style.top = 0;
    currCanvas.style.left = 0;
}