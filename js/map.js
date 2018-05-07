mapboxgl.accessToken = 'pk.eyJ1IjoiZG9taW5pa2Rvb20iLCJhIjoiY2pndWtvZnlqMG9kcjJxbXI5aGx1anl0ayJ9.SkYvJH5GddIdGHgiTjPP1A';
var maps = [];
function addMap(addedObject) {
    var c = $(addedObject).find("#map").get(0);
    // First Init
    var map = new mapboxgl.Map({
        container: c,
        style: 'mapbox://styles/mapbox/dark-v9'
    });

    //3D Buildings
    map.on('load', function() {
        // Insert the layer beneath any symbol layer.
        var layers = map.getStyle().layers;
    
        var labelLayerId;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                labelLayerId = layers[i].id;
                break;
            }
        }
    
        map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 12,
            'paint': {
                'fill-extrusion-color': '#333333',
    
                // use an 'interpolate' expression to add a smooth transition effect to the
                // buildings as the user zooms in
                'fill-extrusion-height': [
                    "interpolate", ["linear"], ["zoom"],
                    12, 0,
                    12.05, ["get", "height"]
                ],
                'fill-extrusion-base': [
                    "interpolate", ["linear"], ["zoom"],
                    12, 0,
                    12.05, ["get", "min_height"]
                ],
                'fill-extrusion-opacity': .6
            }
        }, labelLayerId);
    });

    pointFeature = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Point",
                    "coordinates": []
                }
            }
        ]
    }
    
    map.on('styledata', function () {
        map.loadImage('img/mapmarker.ico', function (error, image) {
            if (error) throw error;
            if (!map.hasImage('custom-marker')) map.addImage('custom-marker', image);
            if (!map.getLayer('marker')) {
                map.addLayer({
                    id: "marker",
                    type: "symbol",
                    source: {
                        type: "geojson",
                        data: pointFeature
                    },
                    layout: {
                        "icon-size": 0.1, // size of the icon
                        "icon-anchor": "bottom", // point of the icon which will correspond to marker's location
                        "icon-image": "custom-marker"
                    }
                });
            }
        });
    });
    // Add Marker
    map.on('click', function (e) {
        pointFeature.features[0].geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
        map.getSource('marker').setData(pointFeature);
        markerLon = e.lngLat.lng.toFixed(5);
        markerLat = e.lngLat.lat.toFixed(5);
    });

    maps.push(map);
    addedObject.attr("mapId",maps.length - 1)
}

function resizeMap() {
    maps.forEach(element => {
        element.resize();
    });
}
