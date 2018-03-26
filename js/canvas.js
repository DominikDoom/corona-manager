sizeCanvas();
var canvas = new fabric.Canvas('pinboard');

var text = new fabric.IText('Some text', {
    fill: '#fff',
    left: 100,
    top: 100,
    fontFamily:'sans-serif',
    objectCaching: false
});
canvas.add(text);

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