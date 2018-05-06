mapboxgl.accessToken = 'pk.eyJ1IjoiZG9taW5pa2Rvb20iLCJhIjoiY2pndWtvZnlqMG9kcjJxbXI5aGx1anl0ayJ9.SkYvJH5GddIdGHgiTjPP1A';
var maps = [];
function addMap(addedObject) {
    var c = $(addedObject).find("#map").get(0);
    var map = new mapboxgl.Map({
        container: c,
        style: 'mapbox://styles/mapbox/dark-v9'
    });
    maps.push(map);
    // TODO: Remove map correctly from array
}

function resizeMap() {
    maps.forEach(element => {
        element.resize();
    });
}
